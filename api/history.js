// Simple in-memory storage for demo (resets on deployment)
let scanHistory = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return sample history for demo
    const sampleHistory = [
      {
        id: 1,
        filename: 'sample_omr_20.png',
        template: 'default',
        score: 18,
        total: 20,
        percentage: 90,
        timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: 2,
        filename: 'test_sheet.jpg',
        template: 'extended',
        score: 42,
        total: 50,
        percentage: 84,
        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }
    ];

    res.status(200).json({
      history: sampleHistory
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}