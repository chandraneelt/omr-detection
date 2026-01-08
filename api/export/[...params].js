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
    try {
      const { params } = req.query;
      const [scanId, format] = params || [];
      
      if (!scanId || !format) {
        return res.status(400).json({ error: 'Missing scan ID or format' });
      }

      // Generate sample export data
      const sampleData = {
        scan_id: scanId,
        answers: ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'],
        score: 18,
        total: 20,
        percentage: 90,
        timestamp: new Date().toISOString()
      };

      if (format.toLowerCase() === 'csv') {
        // Generate CSV
        let csvContent = 'Question,Answer,Correct,Status\n';
        
        for (let i = 0; i < sampleData.answers.length; i++) {
          const answer = sampleData.answers[i];
          const correct = ['A', 'B', 'C', 'D'][i % 4]; // Sample correct answers
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
        res.status(400).json({ error: `Format ${format} not supported in serverless version. Use CSV or JSON.` });
      }
      
    } catch (error) {
      res.status(500).json({ error: `Export error: ${error.message}` });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}