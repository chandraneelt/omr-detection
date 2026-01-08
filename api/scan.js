import { IncomingForm } from 'formidable';

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
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
      
    } catch (error) {
      console.error('Scan error:', error);
      res.status(500).json({ 
        error: `Server error: ${error.message}` 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}