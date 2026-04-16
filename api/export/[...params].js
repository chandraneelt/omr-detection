module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { params } = req.query;
  const scanId = params && params[0];
  const format = params && params[1];

  if (!scanId || !format) {
    return res.status(400).json({ error: 'Usage: /api/export/{scanId}/{format}' });
  }

  // Sample result data for export
  const answers   = ['A','B','C','D','A','B','C','D','A','B','C','D','A','B','C','D','A','B','C','D'];
  const correct   = ['A','B','C','D','A','B','C','D','A','B','C','D','A','B','C','D','A','B','C','D'];
  const score     = 18;
  const total     = 20;

  if (format.toLowerCase() === 'csv') {
    let csv = 'Question,Detected Answer,Correct Answer,Status\n';
    answers.forEach((ans, i) => {
      csv += `Q${i+1},${ans},${correct[i]},${ans === correct[i] ? 'Correct' : 'Incorrect'}\n`;
    });
    csv += `\nScore,${score},/${total},${Math.round(score/total*100)}%\n`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=omr_results_${scanId}.csv`);
    return res.status(200).send(csv);
  }

  if (format.toLowerCase() === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=omr_results_${scanId}.json`);
    return res.status(200).json({
      scan_id: scanId,
      answers,
      correct_answers: correct,
      score,
      total,
      percentage: Math.round(score / total * 100),
      timestamp: new Date().toISOString()
    });
  }

  res.status(400).json({ error: `Unsupported format "${format}". Use csv or json.` });
};
