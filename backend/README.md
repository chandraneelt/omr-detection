# OMR Scanner Backend

Python Flask backend for the OMR Scanner application using OpenCV for image processing.

## Features

- **Image Processing**: OpenCV-based OMR sheet analysis
- **Template System**: Configurable OMR templates
- **RESTful API**: Clean API endpoints for frontend integration
- **Export Functionality**: PDF, Excel, and CSV export options
- **Database Storage**: SQLite for scan history
- **Error Handling**: Comprehensive error handling and validation

## Architecture

```
backend/
├── app.py                 # Main Flask application
├── omr_processor.py       # Core OMR processing logic
├── result_generator.py    # Export file generation
├── requirements.txt       # Python dependencies
├── uploads/              # Uploaded images (created automatically)
├── results/              # Generated export files (created automatically)
└── omr_scanner.db        # SQLite database (created automatically)
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/templates` - Get available templates
- `POST /api/scan` - Process OMR sheet
- `GET /api/export/{id}/{format}` - Export results
- `GET /api/history` - Get scan history

## OMR Processing Pipeline

1. **Image Preprocessing**
   - Convert to grayscale
   - Apply Gaussian blur
   - Adaptive thresholding
   - Morphological operations

2. **Sheet Detection**
   - Find contours
   - Detect largest rectangular contour
   - Apply perspective correction

3. **Answer Extraction**
   - Calculate bubble positions based on template
   - Extract bubble regions
   - Analyze pixel density to determine if filled
   - Handle multiple/no answers

4. **Result Generation**
   - Compare with answer key (if provided)
   - Calculate score and percentage
   - Generate detailed analysis

## Configuration

### Template Structure
Templates are JSON files that define OMR sheet layout:

```json
{
  "display_name": "Template Name",
  "questions": 20,
  "options": ["A", "B", "C", "D"],
  "layout": {
    "type": "vertical",
    "bubble_size": {"width": 30, "height": 20},
    "spacing": {"question": 40, "option": 80},
    "margins": {"top": 150, "left": 100, "right": 100, "bottom": 100}
  },
  "detection": {
    "fill_threshold": 0.3,
    "min_contour_area": 100,
    "max_contour_area": 2000
  }
}
```

### Environment Variables
- `FLASK_ENV`: Set to 'development' for debug mode
- `DATABASE_URL`: SQLite database path (optional)
- `UPLOAD_FOLDER`: Upload directory path (optional)

## Installation

1. Install Python 3.8+
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the application:
   ```bash
   python app.py
   ```

## Development

### Adding New Templates
1. Create a new JSON file in `../templates/`
2. Follow the template structure
3. Restart the backend to load the new template

### Extending OMR Processing
The `OMRProcessor` class can be extended to support:
- Different bubble shapes
- Multi-column layouts
- Custom detection algorithms
- Advanced image preprocessing

### Database Schema
```sql
CREATE TABLE scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    template_name TEXT NOT NULL,
    answers TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

Use the sample OMR sheets in the `../samples/` directory for testing:

```bash
curl -X POST http://localhost:5000/api/scan \
  -F "image=@../samples/sample_20_questions.png" \
  -F "template=default"
```

## Production Deployment

### Using Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

## Performance Considerations

- **Image Size**: Large images take longer to process
- **Template Complexity**: More questions/options increase processing time
- **Concurrent Requests**: Consider using multiple workers in production
- **Memory Usage**: OpenCV operations can be memory-intensive

## Error Handling

The backend handles various error scenarios:
- Invalid image formats
- Corrupted images
- Template not found
- Processing failures
- Database errors

All errors return appropriate HTTP status codes and descriptive messages.