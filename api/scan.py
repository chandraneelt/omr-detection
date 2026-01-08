from http.server import BaseHTTPRequestHandler
import json
import base64
import numpy as np
import cv2
from datetime import datetime
import cgi
import io
from urllib.parse import parse_qs

# Simple in-memory storage
scans_storage = []
scan_counter = 0

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

class SimpleOMRProcessor:
    """Simplified OMR processor for serverless deployment"""
    
    def process_image(self, image_bytes, template):
        """Process OMR sheet image and extract answers"""
        try:
            # Convert to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return {'success': False, 'error': 'Could not decode image'}
            
            # Simplified processing for serverless
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Basic thresholding
            _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
            
            # Extract answers based on template
            answers = self._extract_answers_simple(thresh, template)
            
            return {
                'success': True,
                'answers': answers,
                'confidence': 0.8
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Processing error: {str(e)}'}
    
    def _extract_answers_simple(self, image, template):
        """Simplified answer extraction"""
        num_questions = template.get('questions', 20)
        options = template.get('options', ['A', 'B', 'C', 'D'])
        
        answers = []
        height, width = image.shape
        
        # Simple grid-based detection
        start_y = int(height * 0.15)
        end_y = int(height * 0.85)
        start_x = int(width * 0.1)
        
        question_height = (end_y - start_y) // num_questions if num_questions > 0 else 20
        option_width = int(width * 0.15)
        
        for q in range(num_questions):
            question_y = start_y + q * question_height
            question_answers = []
            
            for i, option in enumerate(options):
                # Calculate bubble position
                bubble_x = start_x + i * option_width
                bubble_y = question_y
                
                # Extract small region around bubble
                region_size = 20
                x1 = max(0, bubble_x - region_size)
                x2 = min(width, bubble_x + region_size)
                y1 = max(0, bubble_y - region_size)
                y2 = min(height, bubble_y + region_size)
                
                if y2 > y1 and x2 > x1:
                    region = image[y1:y2, x1:x2]
                    
                    # Check if region has enough filled pixels
                    if region.size > 0:
                        fill_ratio = np.sum(region > 0) / region.size
                        if fill_ratio > 0.3:  # 30% threshold
                            question_answers.append(option)
            
            # Determine final answer
            if len(question_answers) == 1:
                answers.append(question_answers[0])
            elif len(question_answers) == 0:
                answers.append('')
            else:
                answers.append('MULTIPLE')
        
        return answers

# Initialize processor
omr_processor = SimpleOMRProcessor()

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        global scan_counter, scans_storage
        
        try:
            # Parse multipart form data
            content_type = self.headers.get('Content-Type', '')
            
            if 'multipart/form-data' not in content_type:
                self.send_error_response(400, 'Content-Type must be multipart/form-data')
                return
            
            # Get content length
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error_response(400, 'No data received')
                return
            
            # Read the body
            body = self.rfile.read(content_length)
            
            # Parse multipart data
            form_data = self.parse_multipart(body, content_type)
            
            if not form_data:
                self.send_error_response(400, 'Failed to parse form data')
                return
            
            # Get form fields
            template_name = form_data.get('template', ['default'])[0]
            answer_key = form_data.get('answer_key', ['[]'])[0]
            
            # Get image file
            if 'image' not in form_data:
                self.send_error_response(400, 'No image file provided')
                return
            
            image_data = form_data['image'][0]
            if not image_data:
                self.send_error_response(400, 'Empty image file')
                return
            
            # Find template
            template = next((t for t in DEFAULT_TEMPLATES if t['name'] == template_name), DEFAULT_TEMPLATES[0])
            
            # Process OMR sheet
            result = omr_processor.process_image(image_data, template)
            
            if not result['success']:
                self.send_error_response(400, result['error'])
                return
            
            # Parse answer key
            try:
                answer_key_list = json.loads(answer_key) if answer_key else []
            except:
                answer_key_list = []
            
            # Calculate score
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
            
            # Store scan result
            scan_counter += 1
            
            response_data = {
                'success': True,
                'scan_id': scan_counter,
                'answers': result['answers'],
                'score': score,
                'total_questions': total_questions,
                'percentage': round((score / total_questions * 100) if total_questions > 0 else 0, 2),
                'question_analysis': question_analysis,
                'confidence': result.get('confidence', 0.8)
            }
            
            self.send_json_response(response_data)
            
        except Exception as e:
            self.send_error_response(500, f'Server error: {str(e)}')
    
    def parse_multipart(self, body, content_type):
        """Parse multipart form data"""
        try:
            # Create a file-like object from bytes
            fp = io.BytesIO(body)
            
            # Parse the content type to get boundary
            pdict = {}
            if 'boundary=' in content_type:
                boundary = content_type.split('boundary=')[1]
                pdict['boundary'] = boundary.encode()
            
            # Parse the multipart data
            form = cgi.FieldStorage(fp=fp, environ={'REQUEST_METHOD': 'POST'}, headers={'content-type': content_type})
            
            result = {}
            for field in form.list:
                if field.filename:  # File field
                    result[field.name] = [field.file.read()]
                else:  # Regular field
                    result[field.name] = [field.value]
            
            return result
            
        except Exception as e:
            print(f"Multipart parsing error: {e}")
            return None
    
    def send_json_response(self, data):
        """Send JSON response"""
        response = json.dumps(data).encode('utf-8')
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(response)))
        self.end_headers()
        self.wfile.write(response)
    
    def send_error_response(self, code, message):
        """Send error response"""
        error_data = {'error': message}
        response = json.dumps(error_data).encode('utf-8')
        
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(response)))
        self.end_headers()
        self.wfile.write(response)