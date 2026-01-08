import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

const AnswerKeyHelper = ({ show, onHide, onSelect, template }) => {
  const [customAnswers, setCustomAnswers] = useState([]);
  const [pattern, setPattern] = useState('ABCD');
  const [repeat, setRepeat] = useState(true);

  const generateAnswerKey = () => {
    const numQuestions = template?.questions || 20;
    const options = template?.options || ['A', 'B', 'C', 'D'];
    const answers = [];

    if (repeat) {
      // Repeat pattern
      const patternArray = pattern.split('').filter(char => options.includes(char.toUpperCase()));
      for (let i = 0; i < numQuestions; i++) {
        answers.push(patternArray[i % patternArray.length]);
      }
    } else {
      // Random answers
      for (let i = 0; i < numQuestions; i++) {
        answers.push(options[Math.floor(Math.random() * options.length)]);
      }
    }

    return JSON.stringify(answers);
  };

  const predefinedPatterns = {
    'ABCD': 'Standard A-B-C-D pattern',
    'ABCDE': 'Extended A-B-C-D-E pattern',
    'ABC': 'Simple A-B-C pattern',
    'AAAA': 'All A answers',
    'BBBB': 'All B answers',
    'ABAB': 'Alternating A-B pattern',
    'ABCA': 'A-B-C-A pattern'
  };

  const handleGenerate = () => {
    const answerKey = generateAnswerKey();
    onSelect(answerKey);
    onHide();
  };

  const handlePredefined = (patternKey) => {
    setPattern(patternKey);
    const answerKey = generateAnswerKey();
    onSelect(answerKey);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Answer Key Helper</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info">
          <strong>Template:</strong> {template?.display_name} ({template?.questions} questions, options: {template?.options?.join(', ')})
        </Alert>

        <h6>Quick Patterns</h6>
        <Row className="mb-3">
          {Object.entries(predefinedPatterns).map(([key, description]) => (
            <Col md={6} key={key} className="mb-2">
              <Button
                variant="outline-primary"
                size="sm"
                className="w-100"
                onClick={() => handlePredefined(key)}
              >
                {key} - {description}
              </Button>
            </Col>
          ))}
        </Row>

        <hr />

        <h6>Custom Pattern Generator</h6>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Pattern</Form.Label>
            <Form.Control
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value.toUpperCase())}
              placeholder="Enter pattern like ABCD, ABAB, etc."
            />
            <Form.Text className="text-muted">
              Enter a pattern using available options: {template?.options?.join(', ')}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Repeat pattern for all questions"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
            />
          </Form.Group>

          <div className="mb-3">
            <strong>Preview:</strong>
            <div className="bg-light p-2 rounded mt-1" style={{ fontSize: '0.9em', maxHeight: '100px', overflow: 'auto' }}>
              {generateAnswerKey()}
            </div>
          </div>
        </Form>

        <hr />

        <h6>Sample Answer Keys</h6>
        <div className="mb-2">
          <Button
            variant="outline-success"
            size="sm"
            className="me-2 mb-2"
            onClick={() => onSelect('["A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D"]')}
          >
            20 Questions (ABCD Pattern)
          </Button>
          <Button
            variant="outline-success"
            size="sm"
            className="me-2 mb-2"
            onClick={() => onSelect('["A", "A", "A", "A", "A", "B", "B", "B", "B", "B", "C", "C", "C", "C", "C", "D", "D", "D", "D", "D"]')}
          >
            20 Questions (Grouped)
          </Button>
          <Button
            variant="outline-success"
            size="sm"
            className="me-2 mb-2"
            onClick={() => onSelect('["A", "B", "C", "A", "B", "C", "A", "B", "C", "A"]')}
          >
            10 Questions (ABC Pattern)
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleGenerate}>
          Generate & Use Pattern
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AnswerKeyHelper;