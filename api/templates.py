from http.server import BaseHTTPRequestHandler
import json

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

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            response_data = {'templates': DEFAULT_TEMPLATES}
            response = json.dumps(response_data).encode('utf-8')
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)
            
        except Exception as e:
            error_data = {'error': str(e)}
            response = json.dumps(error_data).encode('utf-8')
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)