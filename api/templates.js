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

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      templates: DEFAULT_TEMPLATES
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}