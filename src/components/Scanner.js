import React, { useState, useRef, useCallback } from 'react';
import { Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';
import { FiUpload, FiCamera, FiRefreshCw, FiHelpCircle } from 'react-icons/fi';

import { TEMPLATES, processOMR, exportToCSV, exportToJSON } from '../services/omrEngine';
import Results from './Results';
import AnswerKeyHelper from './AnswerKeyHelper';

const ANSWER_KEY_EXAMPLES = {
  short:    '["A","B","C","A","B","C","A","B","C","A"]',
  default:  '["A","B","C","D","A","B","C","D","A","B","C","D","A","B","C","D","A","B","C","D"]',
  medium:   '["A","B","C","D","A","B","C","D","A","B","C","D","A","B","C","D","A","B","C","D","A","B","C","D","A","B","C","D","A","B"]',
  extended: '["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"]',
  large:    JSON.stringify(Array.from({length:100},(_,i)=>['A','B','C','D','E'][i%5])),
};

const Scanner = () => {
  const [selectedFile,        setSelectedFile]        = useState(null);
  const [selectedTemplate,    setSelectedTemplate]    = useState('default');
  const [answerKey,           setAnswerKey]           = useState(ANSWER_KEY_EXAMPLES.default);
  const [results,             setResults]             = useState(null);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState('');
  const [showCamera,          setShowCamera]          = useState(false);
  const [capturedImage,       setCapturedImage]       = useState(null);
  const [showAnswerKeyHelper, setShowAnswerKeyHelper] = useState(false);

  const webcamRef   = useRef(null);
  const fileInputRef = useRef(null);

  const handleTemplateChange = (name) => {
    setSelectedTemplate(name);
    setAnswerKey(ANSWER_KEY_EXAMPLES[name] || '');
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
    accept: { 'image/*': ['.jpeg','.jpg','.png'] },
    multiple: false,
  });

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc).then(r => r.blob()).then(blob => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setCapturedImage(imageSrc);
        setShowCamera(false);
        setError('');
      });
    }
  }, []);

  const handleScan = async () => {
    if (!selectedFile) { setError('Please select an image or capture a photo'); return; }
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const data = await processOMR(selectedFile, selectedTemplate, answerKey);
      setResults(data);
    } catch (err) {
      setError('Failed to process image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    if (!results) return;
    if (format === 'csv')  exportToCSV(results);
    if (format === 'json') exportToJSON(results);
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setCapturedImage(null);
    setResults(null);
    setError('');
    setShowCamera(false);
  };

  const currentTemplate = TEMPLATES.find(t => t.name === selectedTemplate);

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
                <>
                  <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'dragover' : ''}`}>
                    <input {...getInputProps()} ref={fileInputRef} />
                    <FiUpload size={48} className="text-muted mb-3" />
                    <h5>Drop OMR sheet here or click to browse</h5>
                    <p className="text-muted">Supports JPG and PNG files</p>
                  </div>
                  <div className="d-flex gap-2 mt-3 justify-content-center">
                    <Button variant="outline-info" onClick={() => setShowCamera(true)}>
                      <FiCamera className="me-2" />Use Camera
                    </Button>
                    <Button variant="outline-primary" onClick={() => fileInputRef.current?.click()}>
                      <FiUpload className="me-2" />Browse Files
                    </Button>
                  </div>
                </>
              ) : (
                <div className="camera-container">
                  <Webcam
                    audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
                    width="100%" videoConstraints={{ facingMode: 'environment' }}
                  />
                  <div className="d-flex gap-2 mt-3 justify-content-center">
                    <Button variant="success" onClick={capturePhoto}>
                      <FiCamera className="me-2" />Capture
                    </Button>
                    <Button variant="outline-secondary" onClick={() => setShowCamera(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {(selectedFile || capturedImage) && (
                <div className="mt-3 p-3 bg-light rounded d-flex align-items-center justify-content-between">
                  <div>
                    <strong>Selected: </strong>{selectedFile?.name || 'Camera capture'}
                    {capturedImage && (
                      <div className="mt-2">
                        <img src={capturedImage} alt="Captured" style={{ maxWidth: 200, maxHeight: 150 }} className="rounded" />
                      </div>
                    )}
                  </div>
                  <Button variant="outline-danger" size="sm" onClick={resetScanner}>
                    <FiRefreshCw className="me-1" />Reset
                  </Button>
                </div>
              )}

              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Scan Settings</h5>
              <small className="badge bg-success mt-1">✅ Ready (Browser Mode)</small>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Template</Form.Label>
                  <Form.Select value={selectedTemplate} onChange={e => handleTemplateChange(e.target.value)}>
                    {TEMPLATES.map(t => (
                      <option key={t.name} value={t.name}>{t.display_name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Answer Key (Optional)</Form.Label>
                  <Form.Control
                    as="textarea" rows={4} value={answerKey}
                    onChange={e => setAnswerKey(e.target.value)}
                    placeholder='["A","B","C","D",...]'
                  />
                  <Form.Text className="text-muted">JSON array for automatic scoring</Form.Text>
                  <div className="mt-2 d-flex gap-2 flex-wrap">
                    <Button variant="outline-secondary" size="sm"
                      onClick={() => setAnswerKey(ANSWER_KEY_EXAMPLES[selectedTemplate] || '')}>
                      Load Example
                    </Button>
                    <Button variant="outline-info" size="sm"
                      onClick={() => setShowAnswerKeyHelper(true)}>
                      <FiHelpCircle className="me-1" />Helper
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => setAnswerKey('')}>
                      Clear
                    </Button>
                  </div>
                </Form.Group>

                <Button variant="primary" onClick={handleScan}
                  disabled={!selectedFile || loading} className="w-100">
                  {loading ? (
                    <><Spinner as="span" animation="border" size="sm" className="me-2" />Processing...</>
                  ) : (
                    <><FiCamera className="me-2" />Scan OMR Sheet</>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {results && (
        <Results results={results} onExport={handleExport} onNewScan={resetScanner} />
      )}

      <AnswerKeyHelper
        show={showAnswerKeyHelper}
        onHide={() => setShowAnswerKeyHelper(false)}
        onSelect={key => { setAnswerKey(key); setShowAnswerKeyHelper(false); }}
        template={currentTemplate}
      />
    </div>
  );
};

export default Scanner;
