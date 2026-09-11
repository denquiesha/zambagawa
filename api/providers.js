const { supabaseRequest } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const params = new URLSearchParams({
      select: 'id,name,service,category,municipality,rating,completed_jobs,starting_price,initials,color,verified',
      order: 'rating.desc'
    });
    if (req.query.category && req.query.category !== 'all') params.set('category', `eq.${req.query.category}`);
    if (req.query.municipality && req.query.municipality !== 'all') params.set('municipality', `eq.${req.query.municipality}`);
    const providers = await supabaseRequest(`providers?${params}`);
    res.status(200).json({ providers });
  } catch (error) {
    const status = error.code === 'DATABASE_NOT_CONFIGURED' ? 503 : 500;
    res.status(status).json({ error: error.code || 'PROVIDERS_UNAVAILABLE' });
  }
};
