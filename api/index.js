import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

const DEFAULT_TEMPLATES = [
  {
    name: "default",
    display_name: "Standard 20 Questions (A-D)",
    questions: 20,
    options: ["A", "B", "C", "D"]
  },
  {
    name: "short",
    display_name: "Short 10 Questions (A-C)",
    questions: 10,
    options: ["A", "B", "C"]
  },
  {
    name: "medium",
    display_name: "Medium 30 Questions (A-D)",
    questions: 30,
    options: ["A", "B", "C", "D"]
  },
  {
    name: "extended",
    display_name: "Extended 50 Questions (A-E)",
    questions: 50,
    options: ["A", "B", "C", "D", "E"]
  },
  {
    name: "large",
    display_name: "Large 100 Questions (A-E)",
    questions: 100,
    options: ["A", "B", "C", "D", "E"]
  }
];

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

function simulateOMRDetection(template, hasImage = false) {
  const numQuestions = template.questions || 20;
  const options = template.options || ['A', 'B', 'C', 'D'];
  
  const answers = [];
  
  if (hasImage) {
    // Simulate more realistic detection when image is provided
    for (let i = 0; i < numQuestions; i++) {
      const rand = Math.random();
      if (rand > 0.15) { // 85% chance of having an answer
        answers.push(options[Math.floor(Math.random() * options.length)]);
      } else {
        answers.push(''); // 15% chance of no answer
      }
    }
  } else {
    // Default pattern when no image
    for (let i = 0; i < numQuestions; i++) {
      answers.push(options[i % options.length]);
    }
  }
  
  return answers;
}

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });
    
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  
  try {
    // Route based on URL path
    if (url === '/api' || url === '/api/' || url === '/api/health') {
      // Health check
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'OMR Scanner API is running on Vercel',
        endpoints: ['/api/health', '/api/templates', '/api/scan', '/api/history', '/api/export/{id}/{format}']
      });
      
    } else if (url === '/api/templates') {
      // Templates endpoint
      res.status(200).json({
        templates: DEFAULT_TEMPLATES
      });
      
    } else if (url === '/api/scan' && method === 'POST') {
      // Scan endpoint
      try {
        const { fields, files } = await parseForm(req);
        
        // Get form data
        const templateName = Array.isArray(fields.template) ? fields.template[0] : fields.template || 'default';
        const answerKey = Array.isArray(fields.answer_key) ? fields.answer_key[0] : fields.answer_key || '[]';
        
        // Find template
        const template = DEFAULT_TEMPLATES.find(t => t.name === templateName) || DEFAULT_TEMPLATES[0];
        
        // Check if image was uploaded
        const hasImage = files.image && (Array.isArray(files.image) ? files.image[0] : files.image);
        
        // Simulate OMR processing
        const answers = simulateOMRDetection(template, !!hasImage);
        
        // Parse answer key
        let answerKeyList = [];
        try {
          answerKeyList = JSON.parse(answerKey);
        } catch (e) {
          answerKeyList = [];
        }
        
        // Calculate score
        let score = 0;
        const totalQuestions = answers.length;
        const questionAnalysis = [];
        
        for (let i = 0; i < answers.length; i++) {
          const detectedAnswer = answers[i];
          let isCorrect = false;
          
          if (i < answerKeyList.length) {
            isCorrect = detectedAnswer === answerKeyList[i];
            if (isCorrect) {
              score++;
            }
          }
          
          questionAnalysis.push({
            question: i + 1,
            detected: detectedAnswer,
            correct: i < answerKeyList.length ? answerKeyList[i] : null,
            is_correct: isCorrect
          });
        }
        
        const responseData = {
          success: true,
          scan_id: Date.now(),
          answers: answers,
          score: score,
          total_questions: totalQuestions,
          percentage: Math.round((score / totalQuestions * 100) * 100) / 100,
          question_analysis: questionAnalysis,
          confidence: hasImage ? 0.75 : 0.95,
          message: hasImage ? 'Image processed (simulated OMR detection)' : 'Pattern generated (demo mode)',
          template_used: template.display_name
        };
        
        res.status(200).json(responseData);
      } catch (parseError) {
        console.error('Form parsing error:', parseError);
        res.status(400).json({ 
          error: `Form parsing error: ${parseError.message}` 
        });
      }
      
    } else if (url === '/api/history') {
      // History endpoint
      const sampleHistory = [
        {
          id: 1,
          filename: 'sample_omr_20.png',
          template: 'default',
          score: 18,
          total: 20,
          percentage: 90,
          timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 2,
          filename: 'test_sheet.jpg',
          template: 'extended',
          score: 42,
          total: 50,
          percentage: 84,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      res.status(200).json({
        history: sampleHistory
      });
      
    } else if (url.startsWith('/api/export/')) {
      // Export endpoint
      const pathParts = url.split('/');
      const scanId = pathParts[3];
      const format = pathParts[4];
      
      if (!scanId || !format) {
        return res.status(400).json({ error: 'Missing scan ID or format' });
      }

      const sampleData = {
        scan_id: scanId,
        answers: ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'],
        score: 18,
        total: 20,
        percentage: 90,
        timestamp: new Date().toISOString()
      };

      if (format.toLowerCase() === 'csv') {
        let csvContent = 'Question,Answer,Correct,Status\n';
        const correctAnswers = ['A', 'B', 'C', 'D'];
        
        for (let i = 0; i < sampleData.answers.length; i++) {
          const answer = sampleData.answers[i];
          const correct = correctAnswers[i % correctAnswers.length];
          const status = answer === correct ? 'Correct' : 'Incorrect';
          csvContent += `Q${i + 1},${answer},${correct},${status}\n`;
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=omr_results_${scanId}.csv`);
        res.status(200).send(csvContent);
        
      } else if (format.toLowerCase() === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=omr_results_${scanId}.json`);
        res.status(200).json(sampleData);
        
      } else {
        res.status(400).json({ error: `Format ${format} not supported. Use 'csv' or 'json'.` });
      }
      
    } else {
      res.status(404).json({ 
        error: 'Endpoint not found',
        available_endpoints: ['/api/health', '/api/templates', '/api/scan', '/api/history', '/api/export/{id}/{format}']
      });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: `Server error: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}