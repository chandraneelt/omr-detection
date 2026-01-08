from flask import Flask, jsonify, Response
import json
import io

app = Flask(__name__)

def handler(request):
    """Export scan results"""
    try:
        # Extract scan_id and format from URL path
        path_parts = request.path.split('/')
        if len(path_parts) < 4:
            return jsonify({'error': 'Invalid export URL'}), 400
        
        scan_id = path_parts[-2]
        format_type = path_parts[-1]
        
        # For demo purposes, return sample data
        sample_data = {
            'scan_id': scan_id,
            'answers': ['A', 'B', 'C', 'D'] * 5,
            'score': 18,
            'total': 20,
            'timestamp': '2024-01-08T10:30:00'
        }
        
        if format_type.lower() == 'csv':
            # Generate CSV
            output = io.StringIO()
            output.write('Question,Answer\n')
            
            for i, answer in enumerate(sample_data['answers'], 1):
                output.write(f"Q{i},{answer}\n")
            
            response = Response(
                output.getvalue(),
                mimetype='text/csv',
                headers={'Content-Disposition': f'attachment; filename=omr_results_{scan_id}.csv'}
            )
            return response
        
        elif format_type.lower() == 'json':
            response = Response(
                json.dumps(sample_data, indent=2),
                mimetype='application/json',
                headers={'Content-Disposition': f'attachment; filename=omr_results_{scan_id}.json'}
            )
            return response
        
        else:
            return jsonify({'error': f'Format {format_type} not supported'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500