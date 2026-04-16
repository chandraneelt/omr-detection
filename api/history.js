module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  res.status(200).json({
    history: [
      { id: 1, filename: 'sample_omr_20.png', template: 'default',  score: 18, total: 20,  percentage: 90, timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, filename: 'test_sheet.jpg',    template: 'extended', score: 42, total: 50,  percentage: 84, timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, filename: 'quiz_sheet.png',    template: 'medium',   score: 27, total: 30,  percentage: 90, timestamp: new Date(Date.now() - 7200000).toISOString() }
    ]
  });
};
