from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import json
import os
from datetime import datetime
import sqlite3
from omr_processor import OMRProcessor
from result_generator import ResultGenerator

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
DATABASE_PATH = 'omr_scanner.db'

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# Initialize components
omr_processor = OMRProcessor()
result_generator = ResultGenerator()

def init_database():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            template_name TEXT NOT NULL,
            answers TEXT NOT NULL,
            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/templates', methods=['GET'])
def get_templates():
    """Get available OMR templates"""
    templates_dir = 'templates'
    templates = []
    
    # Default templates if directory doesn't exist
    default_templates = [
        {
            'name': 'default',
            'display_name': 'Standard 20 Questions (A-D)',
            'questions': 20,
            'options': ['A', 'B', 'C', 'D']
        },
        {
            'name': 'extended',
            'display_name': 'Extended 50 Questions (A-E)',
            'questions': 50,
            'options': ['A', 'B', 'C', 'D', 'E']
        },
        {
            'name': 'short',
            'display_name': 'Short 10 Questions (A-C)',
            'questions': 10,
            'options': ['A', 'B', 'C']
        },
        {
            'name': 'medium',
            'display_name': 'Medium 30 Questions (A-D)',
            'questions': 30,
            'options': ['A', 'B', 'C', 'D']
        },
        {
            'name': 'large',
            'display_name': 'Large 100 Questions (A-E)',
            'questions': 100,
            'options': ['A', 'B', 'C', 'D', 'E']
        }
    ]
    
    if os.path.exists(templates_dir):
        for file in os.listdir(templates_dir):
            if file.endswith('.json'):
                try:
                    with open(os.path.join(templates_dir, file), 'r') as f:
                        template = json.load(f)
                        templates.append({
                            'name': file.replace('.json', ''),
                            'display_name': template.get('display_name', file),
                            'questions': template.get('questions', 0),
                            'options': template.get('options', [])
                        })
                except Exception as e:
                    print(f"Error loading template {file}: {e}")
    
    # If no templates loaded from files, use defaults
    if not templates:
        templates = default_templates
    
    return jsonify({'templates': templates})

@app.route('/api/scan', methods=['POST'])
def scan_omr():
    """Process OMR sheet image"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        template_name = request.form.get('template', 'default')
        answer_key = request.form.get('answer_key', '[]')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save uploaded file
        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Load template
        template_path = f'../templates/{template_name}.json'
        if not os.path.exists(template_path):
            return jsonify({'error': f'Template {template_name} not found'}), 400
        
        with open(template_path, 'r') as f:
            template = json.load(f)
        
        # Process OMR sheet
        result = omr_processor.process_image(filepath, template)
        
        if not result['success']:
            return jsonify({'error': result['error']}), 400
        
        # Parse answer key
        try:
            answer_key_list = json.loads(answer_key) if answer_key else []
        except:
            answer_key_list = []
        
        # Calculate score if answer key provided
        score = 0
        total_questions = len(result['answers'])
        question_analysis = []
        
        for i, detected_answer in enumerate(result['answers']):
            is_correct = False
            if i < len(answer_key_list):
                is_correct = detected_answer == answer_key_list[i]
                if is_correct:
                    score += 1
            
            question_analysis.append({
                'question': i + 1,
                'detected': detected_answer,
                'correct': answer_key_list[i] if i < len(answer_key_list) else None,
                'is_correct': is_correct
            })
        
        # Save to database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO scans (filename, template_name, answers, score, total_questions)
            VALUES (?, ?, ?, ?, ?)
        ''', (filename, template_name, json.dumps(result['answers']), score, total_questions))
        scan_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        response_data = {
            'success': True,
            'scan_id': scan_id,
            'answers': result['answers'],
            'score': score,
            'total_questions': total_questions,
            'percentage': round((score / total_questions * 100) if total_questions > 0 else 0, 2),
            'question_analysis': question_analysis,
            'processed_image': result.get('processed_image_path'),
            'confidence': result.get('confidence', 0.95)
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/<int:scan_id>/<format>', methods=['GET'])
def export_results(scan_id, format):
    """Export scan results in specified format"""
    try:
        # Get scan data from database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM scans WHERE id = ?', (scan_id,))
        scan = cursor.fetchone()
        conn.close()
        
        if not scan:
            return jsonify({'error': 'Scan not found'}), 404
        
        # Generate export file
        export_path = result_generator.generate_export(scan, format)
        
        if not export_path or not os.path.exists(export_path):
            return jsonify({'error': 'Failed to generate export'}), 500
        
        return send_file(export_path, as_attachment=True)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_scan_history():
    """Get scan history"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, filename, template_name, score, total_questions, timestamp
            FROM scans ORDER BY timestamp DESC LIMIT 50
        ''')
        scans = cursor.fetchall()
        conn.close()
        
        history = []
        for scan in scans:
            history.append({
                'id': scan[0],
                'filename': scan[1],
                'template': scan[2],
                'score': scan[3],
                'total': scan[4],
                'percentage': round((scan[3] / scan[4] * 100) if scan[4] > 0 else 0, 2),
                'timestamp': scan[5]
            })
        
        return jsonify({'history': history})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_database()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)