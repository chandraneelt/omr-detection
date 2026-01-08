import React, { useState, useRef, useCallback } from 'react';
import { Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';
import { FiUpload, FiCamera, FiDownload, FiRefreshCw, FiHelpCircle } from 'react-icons/fi';

import { scanOMR, getTemplates, exportResults } from '../services/api';
import Results from './Results';
import AnswerKeyHelper from './AnswerKeyHelper';

const Scanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [answerKey, setAnswerKey] = useState('');
  const [templates, setTemplates] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showAnswerKeyHelper, setShowAnswerKeyHelper] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Predefined answer keys for different templates
  const answerKeyExamples = {
    'default': '["A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D"]',
    'extended': '["A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E"]',
    'short': '["A", "B", "C", "A", "B", "C", "A", "B", "C", "A"]',
    'medium': '["A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B"]',
    'large': '["A", "B", "C", "D", "E"]'.repeat(20).slice(0, -1) + ']'
  };

  // Load templates on component mount
  React.useEffect(() => {
    loadTemplates();
    testAPIConnection();
  }, []);

  const testAPIConnection = async () => {
    try {
      console.log('Testing API connection...');
      setApiStatus('checking');
      
      const apiUrl = process.env.NODE_ENV === 'production' ? '/api/health' : 'http://localhost:5000/api/health';
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Health Check:', data);
        setApiStatus('connected');
      } else {
        console.error('❌ API Health Check failed:', response.status);
        setApiStatus('error');
        setError(`Backend server not responding (${response.status})`);
      }
    } catch (error) {
      console.error('❌ API connection failed:', error);
      setApiStatus('error');
      setError(`Cannot connect to backend server: ${error.message}`);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response.data.templates);
    } catch (err) {
      console.error('Failed to load templates:', err);
      // Fallback templates if API fails
      setTemplates([
        {
          name: 'default',
          display_name: 'Standard 20 Questions (A-D)',
          questions: 20,
          options: ['A', 'B', 'C', 'D']
        },
        {
          name: 'extended',
          display_name: 'Extended 50 Questions (A-E)',
          questions: 50,
          options: ['A', 'B', 'C', 'D', 'E']
        }
      ]);
    }
  };

  const handleTemplateChange = (templateName) => {
    setSelectedTemplate(templateName);
    // Auto-fill answer key example when template changes
    if (answerKeyExamples[templateName]) {
      setAnswerKey(answerKeyExamples[templateName]);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setCapturedImage(null);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Convert base64 to blob
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          setSelectedFile(file);
          setCapturedImage(imageSrc);
          setShowCamera(false);
          setError('');
        });
    }
  }, [webcamRef]);

  const handleScan = async () => {
    if (!selectedFile) {
      setError('Please select an image or capture a photo');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      console.log('Starting OMR scan...', {
        file: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        template: selectedTemplate,
        apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
      });

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('template', selectedTemplate);
      formData.append('answer_key', answerKey);

      console.log('Sending request to API...');
      const response = await scanOMR(formData);
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.success) {
        setResults(response.data);
        console.log('Results set successfully');
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (err) {
      console.error('Scan error:', err);
      
      let errorMessage = 'Failed to process OMR sheet';
      
      if (err.response) {
        // Server responded with error status
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response received
        console.error('No response received:', err.request);
        errorMessage = 'No response from server. Please check if the backend is running on http://localhost:5000';
      } else {
        // Something else happened
        console.error('Request setup error:', err.message);
        errorMessage = `Request error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (!results?.scan_id) return;

    try {
      const response = await exportResults(results.scan_id, format);
      
      // Handle different response types
      let blob;
      if (response.data instanceof Blob) {
        blob = response.data;
      } else {
        // Convert JSON to blob
        const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
        blob = new Blob([content], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `omr_results_${results.scan_id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export results');
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setCapturedImage(null);
    setResults(null);
    setError('');
    setShowCamera(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fade-in">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Upload or Capture OMR Sheet</h5>
            </Card.Header>
            <Card.Body>
              {!showCamera ? (
                <div>
                  {/* File Upload Zone */}
                  <div
                    {...getRootProps()}
                    className={`upload-zone ${isDragActive ? 'dragover' : ''}`}
                  >
                    <input {...getInputProps()} ref={fileInputRef} />
                    <FiUpload size={48} className="text-muted mb-3" />
                    <h5>Drop OMR sheet here or click to browse</h5>
                    <p className="text-muted">
                      Supports JPG, PNG, and PDF files
                    </p>
                  </div>

                  {/* Camera and File Buttons */}
                  <div className="d-flex gap-2 mt-3 justify-content-center">
                    <Button
                      variant="outline-info"
                      onClick={() => setShowCamera(true)}
                      className="btn-camera"
                    >
                      <FiCamera className="me-2" />
                      Use Camera
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FiUpload className="me-2" />
                      Browse Files
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="camera-container">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width="100%"
                    height="400"
                    videoConstraints={{
                      width: 1280,
                      height: 720,
                      facingMode: "environment"
                    }}
                  />
                  <div className="camera-overlay">
                    <div className="camera-guide"></div>
                  </div>
                  <div className="d-flex gap-2 mt-3 justify-content-center">
                    <Button variant="success" onClick={capturePhoto}>
                      <FiCamera className="me-2" />
                      Capture
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowCamera(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Selected File Preview */}
              {(selectedFile || capturedImage) && (
                <div className="mt-3 p-3 bg-light rounded">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <strong>Selected: </strong>
                      {selectedFile?.name || 'Camera capture'}
                      {capturedImage && (
                        <div className="mt-2">
                          <img
                            src={capturedImage}
                            alt="Captured"
                            style={{ maxWidth: '200px', maxHeight: '150px' }}
                            className="rounded"
                          />
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={resetScanner}
                    >
                      <FiRefreshCw className="me-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Scan Settings</h5>
              <div className="mt-2">
                <small className={`badge ${apiStatus === 'connected' ? 'bg-success' : apiStatus === 'error' ? 'bg-danger' : 'bg-warning'}`}>
                  {apiStatus === 'connected' ? '✅ API Connected' : apiStatus === 'error' ? '❌ API Error' : '🔄 Checking API...'}
                </small>
              </div>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Template</Form.Label>
                  <Form.Select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                  >
                    {templates.map((template) => (
                      <option key={template.name} value={template.name}>
                        {template.display_name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Choose the template that matches your OMR sheet
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Answer Key (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={answerKey}
                    onChange={(e) => setAnswerKey(e.target.value)}
                    placeholder='["A", "B", "C", "D", "A", ...]'
                  />
                  <Form.Text className="text-muted">
                    JSON array of correct answers for automatic scoring
                  </Form.Text>
                  <div className="mt-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setAnswerKey(answerKeyExamples[selectedTemplate] || '')}
                    >
                      Load Example
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="ms-2"
                      onClick={() => setShowAnswerKeyHelper(true)}
                    >
                      <FiHelpCircle className="me-1" />
                      Answer Key Helper
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="ms-2"
                      onClick={() => setAnswerKey('')}
                    >
                      Clear
                    </Button>
                  </div>
                </Form.Group>

                <Button
                  variant="primary"
                  onClick={handleScan}
                  disabled={!selectedFile || loading}
                  className="w-100"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        className="me-2"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCamera className="me-2" />
                      Scan OMR Sheet
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Results Section */}
      {results && (
        <Results
          results={results}
          onExport={handleExport}
          onNewScan={resetScanner}
        />
      )}

      {/* Answer Key Helper Modal */}
      <AnswerKeyHelper
        show={showAnswerKeyHelper}
        onHide={() => setShowAnswerKeyHelper(false)}
        onSelect={(key) => {
          setAnswerKey(key);
          setShowAnswerKeyHelper(false);
        }}
        template={templates.find(t => t.name === selectedTemplate)}
      />
    </div>
  );
};

export default Scanner;