# OMR Scanner Frontend

React-based frontend application for the OMR Scanner with mobile-first responsive design.

## Features

- **Mobile-First Design**: Optimized for mobile devices and tablets
- **Camera Integration**: WebRTC-based camera capture
- **Drag & Drop Upload**: Intuitive file upload interface
- **Real-Time Results**: Instant feedback and analysis
- **Export Options**: Download results in multiple formats
- **Scan History**: View and manage previous scans
- **Responsive UI**: Bootstrap-based responsive design

## Architecture

```
frontend/
├── public/
│   └── index.html         # HTML template
├── src/
│   ├── components/        # React components
│   │   ├── Scanner.js     # Main scanning interface
│   │   ├── Results.js     # Results display
│   │   ├── History.js     # Scan history
│   │   └── Settings.js    # Application settings
│   ├── services/
│   │   └── api.js         # API service layer
│   ├── App.js             # Main application component
│   ├── index.js           # Application entry point
│   └── index.css          # Global styles
└── package.json           # Dependencies and scripts
```

## Components

### Scanner Component
- File upload with drag & drop
- Camera capture with preview
- Template selection
- Answer key input
- Processing status

### Results Component
- Score display with progress bar
- Question-by-question analysis
- Export buttons for different formats
- Confidence indicator

### History Component
- List of previous scans
- Export functionality for historical data
- Filtering and sorting options

### Settings Component
- Template information
- Application configuration
- Usage instructions

## Key Features

### Camera Integration
```javascript
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "environment" // Use rear camera on mobile
};
```

### File Upload
```javascript
import { useDropzone } from 'react-dropzone';

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  accept: {
    'image/*': ['.jpeg', '.jpg', '.png'],
    'application/pdf': ['.pdf']
  },
  multiple: false
});
```

### API Integration
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000
});
```

## Styling

### CSS Framework
- **Bootstrap 5**: Component library and grid system
- **React Bootstrap**: Bootstrap components for React
- **Custom CSS**: Additional styling for OMR-specific features

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interfaces
- Optimized for various screen sizes

### Key CSS Classes
```css
.upload-zone          /* Drag & drop area */
.camera-container     /* Camera preview container */
.camera-guide         /* Camera alignment guide */
.results-card         /* Results display card */
.question-grid        /* Question analysis grid */
.score-display        /* Score visualization */
```

## State Management

### Local State
Components use React hooks for local state management:
- `useState` for component state
- `useEffect` for side effects
- `useCallback` for memoized callbacks
- `useRef` for DOM references

### API State
- Loading states for async operations
- Error handling and display
- Success feedback
- Data caching for templates

## Installation

1. Install Node.js 16+
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm start
   ```

## Development

### Available Scripts
- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

### Environment Variables
Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Adding New Features
1. Create new components in `src/components/`
2. Add API calls in `src/services/api.js`
3. Update routing in `App.js`
4. Add styles in `index.css`

## Browser Compatibility

### Supported Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Required Features
- WebRTC for camera access
- File API for uploads
- Fetch API for HTTP requests
- ES6+ JavaScript features

### Mobile Support
- iOS Safari 13+
- Chrome Mobile 80+
- Samsung Internet 12+
- Firefox Mobile 75+

## Performance Optimization

### Code Splitting
```javascript
const LazyComponent = React.lazy(() => import('./Component'));
```

### Image Optimization
- Compress uploaded images
- Use appropriate image formats
- Implement lazy loading

### Bundle Optimization
- Tree shaking for unused code
- Code splitting for routes
- Minification in production

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
- Test API integration
- Test file upload functionality
- Test camera capture

### Manual Testing
- Test on different devices
- Test camera permissions
- Test file upload limits
- Test export functionality

## Deployment

### Production Build
```bash
npm run build
```

### Static Hosting
Deploy the `build/` directory to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

### Environment Configuration
Set production environment variables:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Accessibility

### WCAG Compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management

### Semantic HTML
- Proper heading hierarchy
- Form labels and descriptions
- ARIA attributes where needed

## Security Considerations

### File Upload Security
- Client-side file type validation
- File size limits
- Sanitize file names

### API Security
- HTTPS in production
- Input validation
- Error message sanitization

### Camera Privacy
- Request permissions appropriately
- Clear privacy indicators
- Secure camera data handling