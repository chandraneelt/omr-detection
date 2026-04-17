import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { FiSettings, FiInfo } from 'react-icons/fi';

import { getTemplates } from '../services/api';

const Settings = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(false);
      const response = await getTemplates();
      setTemplates(response.data.templates);
    } catch (err) {
      setError('Failed to load templates');
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FiSettings className="me-2" />
            Application Settings
          </h5>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-3">
              {success}
            </Alert>
          )}

          {/* Templates Section */}
          <div className="mb-4">
            <h6 className="mb-3">Available Templates</h6>
            {templates.length > 0 ? (
              <div className="row">
                {templates.map((template) => (
                  <div key={template.name} className="col-md-6 mb-3">
                    <Card className="h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title">{template.display_name}</h6>
                          <Badge bg="primary">{template.name}</Badge>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Questions:</small>{' '}
                          <strong>{template.questions}</strong>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Options:</small>{' '}
                          <strong>{template.options.join(', ')}</strong>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <Alert variant="info">
                <FiInfo className="me-2" />
                No templates found. Please check your backend configuration.
              </Alert>
            )}
          </div>

          {/* Application Info */}
          <div className="mb-4">
            <h6 className="mb-3">Application Information</h6>
            <Card className="bg-light">
              <Card.Body>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-2">
                      <small className="text-muted">Version:</small>{' '}
                      <strong>1.0.0</strong>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Backend:</small>{' '}
                      <strong>Python Flask + OpenCV</strong>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Frontend:</small>{' '}
                      <strong>React + Bootstrap</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <small className="text-muted">Supported Formats:</small>{' '}
                      <strong>JPG, PNG, PDF</strong>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Export Formats:</small>{' '}
                      <strong>PDF, Excel, CSV</strong>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Camera Support:</small>{' '}
                      <strong>WebRTC</strong>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Usage Instructions */}
          <div className="mb-4">
            <h6 className="mb-3">How to Use</h6>
            <Card>
              <Card.Body>
                <ol className="mb-0">
                  <li className="mb-2">
                    <strong>Upload or Capture:</strong> Use the main scanner page to upload an OMR sheet image or capture one using your device camera.
                  </li>
                  <li className="mb-2">
                    <strong>Select Template:</strong> Choose the template that matches your OMR sheet format (number of questions and options).
                  </li>
                  <li className="mb-2">
                    <strong>Add Answer Key (Optional):</strong> Provide the correct answers in JSON format for automatic scoring.
                  </li>
                  <li className="mb-2">
                    <strong>Process:</strong> Click "Scan OMR Sheet" to analyze the image and extract answers.
                  </li>
                  <li className="mb-0">
                    <strong>Export:</strong> Download results in PDF, Excel, or CSV format, or view them in the History section.
                  </li>
                </ol>
              </Card.Body>
            </Card>
          </div>

          {/* Tips */}
          <div>
            <h6 className="mb-3">Tips for Best Results</h6>
            <Alert variant="info">
              <ul className="mb-0">
                <li>Ensure good lighting when capturing images</li>
                <li>Keep the OMR sheet flat and aligned</li>
                <li>Use high-resolution images for better accuracy</li>
                <li>Make sure bubbles are clearly filled</li>
                <li>Avoid shadows and reflections on the sheet</li>
              </ul>
            </Alert>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Settings;