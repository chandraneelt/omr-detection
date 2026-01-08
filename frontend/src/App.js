import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { FiCamera, FiUpload, FiClock, FiSettings } from 'react-icons/fi';

import Scanner from './components/Scanner';
import History from './components/History';
import Settings from './components/Settings';

function App() {
  return (
    <Router>
      <div className="omr-scanner">
        <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand href="/">
              <FiCamera className="me-2" />
              OMR Scanner
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="/">
                  <FiUpload className="me-1" />
                  Scan
                </Nav.Link>
                <Nav.Link href="/history">
                  <FiClock className="me-1" />
                  History
                </Nav.Link>
                <Nav.Link href="/settings">
                  <FiSettings className="me-1" />
                  Settings
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container>
          <Routes>
            <Route path="/" element={<Scanner />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;