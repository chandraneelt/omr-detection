# OMR Scanner API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### Health Check
Check if the API is running and healthy.

**GET** `/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-08T10:30:00.000Z"
}
```

### Get Templates
Retrieve available OMR templates.

**GET** `/templates`

**Response:**
```json
{
  "templates": [
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
}
```

### Scan OMR Sheet
Process an OMR sheet image and extract answers.

**POST** `/scan`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `image` (file, required): OMR sheet image (JPG/PNG/PDF)
- `template` (string, optional): Template name (default: "default")
- `answer_key` (string, optional): JSON array of correct answers

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/scan \
  -F "image=@omr_sheet.jpg" \
  -F "template=default" \
  -F "answer_key=[\"A\",\"B\",\"C\",\"D\"]"
```

**Response:**
```json
{
  "success": true,
  "scan_id": 123,
  "answers": ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D"],
  "score": 18,
  "total_questions": 20,
  "percentage": 90.0,
  "question_analysis": [
    {
      "question": 1,
      "detected": "A",
      "correct": "A",
      "is_correct": true
    },
    {
      "question": 2,
      "detected": "B",
      "correct": "B",
      "is_correct": true
    }
  ],
  "processed_image": "/uploads/processed_image.jpg",
  "confidence": 0.95
}
```

**Error Response:**
```json
{
  "error": "Could not detect OMR sheet boundaries"
}
```

### Export Results
Export scan results in specified format.

**GET** `/export/{scan_id}/{format}`

**Parameters:**
- `scan_id` (integer): ID of the scan to export
- `format` (string): Export format ("pdf", "excel", "csv")

**Response:** File download

**Example:**
```bash
curl -X GET http://localhost:5000/api/export/123/pdf -o results.pdf
```

### Get Scan History
Retrieve scan history.

**GET** `/history`

**Response:**
```json
{
  "history": [
    {
      "id": 123,
      "filename": "omr_sheet.jpg",
      "template": "default",
      "score": 18,
      "total": 20,
      "percentage": 90.0,
      "timestamp": "2024-01-08T10:30:00.000Z"
    }
  ]
}
```

## Error Codes

- **400 Bad Request**: Invalid request parameters
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server processing error

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse.

## Authentication

Currently no authentication is required. In production, implement proper authentication and authorization.

## File Size Limits

- Maximum file size: 10MB
- Supported formats: JPG, PNG, PDF
- Recommended resolution: 300 DPI or higher

## Processing Time

- Typical processing time: 2-10 seconds
- Depends on image size and complexity
- Timeout: 30 seconds