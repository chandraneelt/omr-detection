from flask import Flask, jsonify

app = Flask(__name__)

# This would normally connect to the same storage as scan.py
# For demo purposes, we'll return empty history
def handler(request):
    """Get scan history"""
    try:
        # In a real app, this would fetch from database
        # For demo, return empty history
        history = []
        
        return jsonify({'history': history})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500