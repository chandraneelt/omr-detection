// Redirect handler - not used directly, individual files handle each route
module.exports = function handler(req, res) {
  res.status(200).json({ message: 'OMR Scanner API', version: '1.0.0' });
};
