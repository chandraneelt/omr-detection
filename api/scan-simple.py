from http.server import BaseHTTPRequestHandler
import json
import random
from datetime import datetime

DEFAULT_TEMPLATES = [
    {
        "name": "default",
        "display_name": "Standard 20 Questions (A-D)",
        "questions": 20,
        "options": ["A", "B", "C", "D"]
    },
    {
        "name": "extended",
        "display_name": "Extended 50 Questions (A-E)",
        "questions": 50,
        "options": ["A", "B", "C", "D", "E"]
    }
]

def simulate_omr_detection(template):
    """Simulate OMR detection for demo purposes"""
    num_questions = template.get('questions', 20)
    options = template.get('options', ['A', 'B', 'C', 'D'])
    
    answers = []
    for i in range(num_questions):
        if random.random() > 0.1:  # 90% chance of having an answer
            answers.append(random.choice(options))
        else:
            answers.append('')  # 10% chance of no answer
    
    return answers

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            # For now, just simulate processing
            template = DEFAULT_TEMPLATES[0]  # Use default template
            
            # Simulate OMR processing
            answers = simulate_omr_detection(template)
            
            # Simulate answer key (empty for now)
            answer_key_list = []
            
            # Calculate score
            score = 0
            total_questions = len(answers)
            question_analysis = []
            
            for i, detected_answer in enumerate(answers):
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
            
            response_data = {
                'success': True,
                'scan_id': 1,
                'answers': answers,
                'score': score,
                'total_questions': total_questions,
                'percentage': round((score / total_questions * 100) if total_questions > 0 else 0, 2),
                'question_analysis': question_analysis,
                'confidence': 0.8
            }
            
            response = json.dumps(response_data).encode('utf-8')
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)
            
        except Exception as e:
            error_data = {'error': f'Server error: {str(e)}'}
            response = json.dumps(error_data).encode('utf-8')
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)