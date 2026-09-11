const { getConfig } = require('./_supabase');
module.exports = function handler(req, res) {
  res.status(200).json({ status: 'ok', databaseConfigured: Boolean(getConfig()) });
};
