import React from 'react';
import { Row, Col, Card, Button, Badge, ProgressBar } from 'react-bootstrap';
import { FiDownload, FiRefreshCw, FiCheck, FiX, FiMinus } from 'react-icons/fi';

const Results = ({ results, onExport, onNewScan }) => {
  const {
    score,
    total_questions,
    percentage,
    question_analysis,
    confidence
  } = results;

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const getQuestionIcon = (analysis) => {
    if (!analysis.correct) return <FiMinus className="text-muted" />;
    if (analysis.is_correct) return <FiCheck className="text-success" />;
    return <FiX className="text-danger" />;
  };

  const getQuestionClass = (analysis) => {
    if (!analysis.correct) return 'no-answer';
    if (analysis.is_correct) return 'correct';
    return 'incorrect';
  };

  return (
    <div className="fade-in">
      <Row>
        <Col lg={8}>
          <Card className="results-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Scan Results</h5>
              <div>
                <Badge bg="info" className="me-2">
                  Confidence: {Math.round(confidence * 100)}%
                </Badge>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={onNewScan}
                >
                  <FiRefreshCw className="me-1" />
                  New Scan
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Score Summary */}
              <div className="text-center mb-4">
                <div className="score-display text-center">
                  {score}/{total_questions}
                </div>
                <div className="score-percentage">
                  {percentage}%
                </div>
                <ProgressBar
                  variant={getScoreColor(percentage)}
                  now={percentage}
                  className="mt-2"
                  style={{ height: '8px' }}
                />
              </div>

              {/* Question Analysis */}
              {question_analysis && question_analysis.length > 0 && (
                <div>
                  <h6 className="mb-3">Question-by-Question Analysis</h6>
                  <div className="question-grid">
                    {question_analysis.map((analysis, index) => (
                      <div
                        key={index}
                        className={`question-item ${getQuestionClass(analysis)}`}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>Q{analysis.question}</strong>
                          {getQuestionIcon(analysis)}
                        </div>
                        <div className="mt-1">
                          <small className="text-muted">Detected:</small>{' '}
                          <span className="fw-bold">
                            {analysis.detected || 'No Answer'}
                          </span>
                        </div>
                        {analysis.correct && (
                          <div>
                            <small className="text-muted">Correct:</small>{' '}
                            <span className="fw-bold">{analysis.correct}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Export Results</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button
                  variant="outline-info"
                  onClick={() => onExport('csv')}
                >
                  <FiDownload className="me-2" />
                  Download CSV
                </Button>
                <Button
                  variant="outline-success"
                  onClick={() => onExport('json')}
                >
                  <FiDownload className="me-2" />
                  Download JSON
                </Button>
              </div>

              <hr />

              <div className="text-center">
                <h6>Summary</h6>
                <div className="row text-center">
                  <div className="col-6">
                    <div className="fw-bold text-success">{score}</div>
                    <small className="text-muted">Correct</small>
                  </div>
                  <div className="col-6">
                    <div className="fw-bold text-danger">
                      {total_questions - score}
                    </div>
                    <small className="text-muted">Incorrect</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Results;