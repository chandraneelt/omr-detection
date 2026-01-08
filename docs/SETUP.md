# OMR Scanner Setup Guide

## Prerequisites

### System Requirements
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher
- **npm**: 8.0 or higher
- **Operating System**: Windows, macOS, or Linux

### Required Libraries
- OpenCV for image processing
- Flask for backend API
- React for frontend interface

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd omr-scanner
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Alternative: Using Virtual Environment (Recommended)
```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### Initialize Database
The database will be automatically initialized when you first run the application.

### 3. Frontend Setup

#### Install Node.js Dependencies
```bash
cd frontend
npm install
```

## Configuration

### Backend Configuration
The backend uses default settings that work out of the box. You can modify these in `backend/app.py`:

- **Port**: 5000 (default)
- **Host**: 0.0.0.0 (accepts connections from any IP)
- **Database**: SQLite (omr_scanner.db)
- **Upload folder**: uploads/
- **Results folder**: results/

### Frontend Configuration
Create a `.env` file in the `frontend` directory (optional):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

If not specified, the frontend will use `http://localhost:5000/api` by default.

### Template Configuration
OMR templates are stored in the `templates/` directory as JSON files. You can:

1. Modify existing templates (`default.json`, `extended.json`)
2. Create new templates following the same structure
3. Templates are automatically loaded by the backend

## Running the Application

### Start Backend Server
```bash
cd backend
python app.py
```

The backend will start on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

### Access the Application
Open your web browser and navigate to `http://localhost:3000`

## Production Deployment

### Backend Production Setup
```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend Production Build
```bash
cd frontend
npm run build
```

Serve the `build/` directory using a web server like Nginx or Apache.

### Docker Deployment (Optional)
Create a `Dockerfile` for containerized deployment:

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
EXPOSE 5000

CMD ["python", "app.py"]
```

## Troubleshooting

### Common Issues

#### 1. OpenCV Installation Issues
If you encounter OpenCV installation problems:

```bash
# On Ubuntu/Debian
sudo apt-get update
sudo apt-get install python3-opencv

# On macOS with Homebrew
brew install opencv

# Alternative: Use conda
conda install opencv
```

#### 2. Camera Access Issues
- Ensure your browser has camera permissions
- Use HTTPS in production for camera access
- Check if other applications are using the camera

#### 3. File Upload Issues
- Check file size limits (default: 10MB)
- Ensure supported file formats (JPG, PNG, PDF)
- Verify backend upload folder permissions

#### 4. CORS Issues
If you encounter CORS errors:
- Ensure Flask-CORS is installed
- Check the CORS configuration in `app.py`
- Verify the frontend API URL configuration

### Performance Optimization

#### Backend Optimization
- Use a production WSGI server (Gunicorn, uWSGI)
- Implement caching for template loading
- Add database indexing for large datasets
- Use image compression for processed images

#### Frontend Optimization
- Build for production (`npm run build`)
- Enable gzip compression
- Use a CDN for static assets
- Implement lazy loading for large image previews

### Security Considerations

#### Production Security
- Implement authentication and authorization
- Add rate limiting to prevent abuse
- Validate and sanitize file uploads
- Use HTTPS for all communications
- Implement proper error handling (don't expose internal errors)

#### File Security
- Scan uploaded files for malware
- Implement file type validation
- Set appropriate file size limits
- Store uploaded files outside web root

## Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Manual Testing
1. Use the sample OMR sheets in the `samples/` directory
2. Test different image formats and sizes
3. Verify camera functionality on different devices
4. Test export functionality for all formats

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API documentation in `docs/API.md`
3. Check the sample files in `samples/`
4. Create an issue in the project repository