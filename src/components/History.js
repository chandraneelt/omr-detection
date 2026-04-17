import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { FiDownload, FiClock, FiFileText } from 'react-icons/fi';

import { getScanHistory, exportResults } from '../services/api';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await getScanHistory();
      setHistory(response.data.history);
    } catch (err) {
      setError('Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (scanId, format) => {
    try {
      const response = await exportResults(scanId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `omr_results_${scanId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export results');
    }
  };

  const getScoreBadgeVariant = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <div className="mt-2">Loading scan history...</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FiClock className="me-2" />
            Scan History
          </h5>
          <Button variant="outline-primary" size="sm" onClick={loadHistory}>
            Refresh
          </Button>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {history.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FiFileText size={48} className="mb-3" />
              <h6>No scans found</h6>
              <p>Your scan history will appear here after you process OMR sheets.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>File</th>
                    <th>Template</th>
                    <th>Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((scan) => (
                    <tr key={scan.id}>
                      <td>
                        <small>{formatDate(scan.timestamp)}</small>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                          {scan.filename}
                        </div>
                      </td>
                      <td>
                        <Badge bg="secondary">{scan.template}</Badge>
                      </td>
                      <td>
                        <div>
                          <Badge bg={getScoreBadgeVariant(scan.percentage)}>
                            {scan.score}/{scan.total}
                          </Badge>
                          <div>
                            <small className="text-muted">
                              {scan.percentage}%
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleExport(scan.id, 'pdf')}
                            title="Download PDF"
                          >
                            PDF
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleExport(scan.id, 'excel')}
                            title="Download Excel"
                          >
                            Excel
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleExport(scan.id, 'csv')}
                            title="Download CSV"
                          >
                            CSV
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default History;