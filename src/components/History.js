import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert } from 'react-bootstrap';
import { FiClock, FiFileText } from 'react-icons/fi';
import { SAMPLE_HISTORY, exportToCSV, exportToJSON } from '../services/omrEngine';

const History = () => {
  const [history, setHistory] = useState([]);
  const [error]               = useState('');

  useEffect(() => {
    // Load from localStorage + sample data
    const stored = JSON.parse(localStorage.getItem('omr_history') || '[]');
    setHistory([...stored, ...SAMPLE_HISTORY]);
  }, []);

  const handleExport = (scan, format) => {
    const fakeResults = {
      scan_id:           scan.id,
      answers:           Array.from({ length: scan.total }, (_, i) => ['A','B','C','D'][i%4]),
      score:             scan.score,
      total_questions:   scan.total,
      percentage:        scan.percentage,
      question_analysis: Array.from({ length: scan.total }, (_, i) => ({
        question: i+1, detected: ['A','B','C','D'][i%4],
        correct: ['A','B','C','D'][i%4], is_correct: true,
      })),
    };
    if (format === 'csv')  exportToCSV(fakeResults);
    if (format === 'json') exportToJSON(fakeResults);
  };

  const badgeVariant = (pct) => pct >= 80 ? 'success' : pct >= 60 ? 'warning' : 'danger';

  return (
    <div className="fade-in">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><FiClock className="me-2" />Scan History</h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {history.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FiFileText size={48} className="mb-3" />
              <h6>No scans yet</h6>
              <p>Your scan history will appear here after processing OMR sheets.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Date</th><th>File</th><th>Template</th><th>Score</th><th>Export</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(scan => (
                    <tr key={scan.id}>
                      <td><small>{new Date(scan.timestamp).toLocaleString()}</small></td>
                      <td><div className="text-truncate" style={{maxWidth:200}}>{scan.filename}</div></td>
                      <td><Badge bg="secondary">{scan.template}</Badge></td>
                      <td>
                        <Badge bg={badgeVariant(scan.percentage)}>{scan.score}/{scan.total}</Badge>
                        <div><small className="text-muted">{scan.percentage}%</small></div>
                      </td>
                      <td>
                        <div className="btn-group">
                          <Button variant="outline-info"    size="sm" onClick={() => handleExport(scan,'csv')}>CSV</Button>
                          <Button variant="outline-success" size="sm" onClick={() => handleExport(scan,'json')}>JSON</Button>
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
