# 🎯 OMR Scanner - Optical Mark Recognition Application

A comprehensive full-stack OMR (Optical Mark Recognition) scanning application that processes OMR sheets using computer vision and provides instant results with downloadable reports.

## 🌟 Features

### 📸 **Image Input**
- Upload OMR sheet images (JPG/PNG/PDF)
- Capture images using device camera (mobile & desktop)
- Auto-crop and perspective correction
- Drag & drop interface

### 🔍 **OMR Processing**
- Detect OMR sheet boundaries
- Identify bubbles and answer regions
- Handle partial shading, noise, and skew
- Support configurable templates (10, 20, 30, 50, 100 questions)
- Validate marked answers with confidence scoring

### 📊 **Evaluation & Scoring**
- Compare detected answers with answer keys
- Auto-calculate scores and percentages
- Detect invalid/multiple answers
- Display per-question analysis
- Generate confidence scores

### 📥 **Results & Export**
- Show instant results on screen
- Download results as PDF/Excel/CSV
- Store scan history
- Question-by-question breakdown

### 🎨 **User Interface**
- Mobile-first responsive design
- Interactive answer key helper
- 5 configurable templates
- Pattern generator for answer keys
- Real-time status indicators

## 🚀 Live Demo

- **Frontend**: https://omr-detection.vercel.app
- **Local Setup**: http://localhost:3000 (after setup)

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Bootstrap 5** - Responsive design
- **React Webcam** - Camera integration
- **React Dropzone** - File upload
- **Axios** - API communication

### Backend
- **Python Flask** - REST API server
- **OpenCV** - Image processing
- **NumPy** - Numerical computations
- **SQLite** - Database storage
- **ReportLab** - PDF generation

### Deployment
- **Vercel** - Frontend hosting
- **Docker** - Containerization
- **Railway/Render** - Full-stack deployment options

## 📋 Template Options

1. **Short (10 Questions)** - A, B, C options
2. **Default (20 Questions)** - A, B, C, D options
3. **Medium (30 Questions)** - A, B, C, D options
4. **Extended (50 Questions)** - A, B, C, D, E options
5. **Large (100 Questions)** - A, B, C, D, E options

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chandraneelt/omr-detection.git
   cd omr-detection
   ```

2. **Automated Setup**
   ```bash
   python setup.py
   ```

3. **Manual Setup**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   python app.py
   
   # Frontend (new terminal)
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 Usage

### Basic Workflow
1. **Select Template** - Choose question format (10-100 questions)
2. **Upload Image** - Drag & drop or use camera capture
3. **Add Answer Key** - Use helper tool or manual entry
4. **Scan Sheet** - Process with OpenCV
5. **View Results** - See scores and analysis
6. **Export Data** - Download PDF, Excel, or CSV

### Answer Key Helper
- **Quick Patterns**: ABCD, ABCDE, ABC repeating patterns
- **Custom Generator**: Create your own patterns
- **Sample Keys**: Pre-made examples for testing
- **Auto-fill**: Template-specific examples

## 🔧 Configuration

### Templates
Templates are stored in `templates/` directory as JSON files:

```json
{
  "display_name": "Standard 20 Questions (A-D)",
  "questions": 20,
  "options": ["A", "B", "C", "D"],
  "layout": {
    "bubble_size": {"width": 30, "height": 20},
    "spacing": {"question": 40, "option": 80}
  }
}
```

### Environment Variables
```env
# Frontend
REACT_APP_API_URL=http://localhost:5000/api

# Backend
FLASK_ENV=development
DATABASE_PATH=omr_scanner.db
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access at http://localhost:3000
```

## ☁️ Cloud Deployment

### Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. "Deploy from GitHub repo"
3. Select this repository
4. Automatic deployment with database

### Render
1. Go to [render.com](https://render.com)
2. "New Web Service"
3. Connect GitHub repository
4. Uses included `render.yaml` configuration

### Vercel
```bash
npm i -g vercel
vercel --prod
```

## 📊 API Documentation

### Endpoints
- `GET /api/health` - Health check
- `GET /api/templates` - Available templates
- `POST /api/scan` - Process OMR sheet
- `GET /api/history` - Scan history
- `GET /api/export/{id}/{format}` - Export results

### Example Request
```bash
curl -X POST http://localhost:5000/api/scan \
  -F "image=@omr_sheet.jpg" \
  -F "template=default" \
  -F "answer_key=[\"A\",\"B\",\"C\",\"D\"]"
```

## 🧪 Testing

### Sample Files
Use the provided sample OMR sheets in `samples/` directory:
- `samples/filled_omr_20.png` - Pre-filled test sheet
- `samples/blank_omr_20.png` - Blank template

### Test Answer Key
```json
["A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D"]
```

### Debug Tools
- Open `debug-scan.html` in browser for API testing
- Check browser console (F12) for detailed logs
- Use `test-api.html` for endpoint verification

## 📁 Project Structure

```
omr-detection/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── ...
│   └── package.json
├── backend/           # Flask API server
│   ├── app.py
│   ├── omr_processor.py
│   ├── result_generator.py
│   └── requirements.txt
├── api/              # Vercel serverless functions
├── templates/        # OMR sheet templates
├── samples/          # Sample OMR sheets
├── docs/            # Documentation
└── docker-compose.yml
```

## 🎯 Key Features Implemented

- ✅ **Real OMR Processing** - OpenCV-based bubble detection
- ✅ **5 Template Options** - Configurable question formats
- ✅ **Answer Key Helper** - Interactive pattern generator
- ✅ **Mobile Support** - Camera capture and responsive design
- ✅ **Export Options** - PDF, Excel, CSV downloads
- ✅ **Scan History** - Track previous scans
- ✅ **Error Handling** - Comprehensive validation
- ✅ **Status Indicators** - Real-time feedback
- ✅ **Debug Tools** - Development utilities

## 🔧 Troubleshooting

### Common Issues
1. **API Connection**: Ensure backend is running on port 5000
2. **Camera Access**: Allow browser permissions
3. **File Upload**: Check file size (max 10MB) and format
4. **Template Loading**: Verify templates directory exists

### Debug Steps
1. Check browser console for errors
2. Test API endpoints with `debug-scan.html`
3. Verify both servers are running
4. Clear browser cache if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenCV community for computer vision tools
- React team for the frontend framework
- Flask team for the backend framework
- Bootstrap for responsive design components

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/chandraneelt/omr-detection/issues)
- **Documentation**: Check the `docs/` directory
- **Examples**: See `samples/` directory

---

**Built with ❤️ for accurate and efficient OMR processing**
