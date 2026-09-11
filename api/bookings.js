const crypto = require('node:crypto');
const { supabaseRequest } = require('./_supabase');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedMunicipalities = new Set(['Olongapo', 'Subic', 'Castillejos', 'San Marcelino', 'Botolan', 'Iba']);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const name = String(body.customerName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  const details = String(body.details || '').trim();
  const preferredDate = String(body.preferredDate || '');
  const municipality = String(body.municipality || '');
  const providerId = Number(body.providerId);
  if (name.length < 2 || !EMAIL.test(email) || phone.length < 7 || details.length < 10 || !preferredDate || !providerId || !allowedMunicipalities.has(municipality)) {
    return res.status(400).json({ error: 'Please complete all booking details correctly.' });
  }
  const selectedDate = new Date(`${preferredDate}T00:00:00`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (Number.isNaN(selectedDate.valueOf()) || selectedDate < today) return res.status(400).json({ error: 'Please choose a future date.' });
  const reference = `ZG-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  try {
    const rows = await supabaseRequest('bookings', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ reference, provider_id: providerId, customer_name: name, email, phone, municipality, preferred_date: preferredDate, details, status: 'pending' })
    });
    res.status(201).json({ booking: { reference: rows[0].reference, status: rows[0].status } });
  } catch (error) {
    const status = error.code === 'DATABASE_NOT_CONFIGURED' ? 503 : 500;
    res.status(status).json({ error: error.code || 'BOOKING_FAILED' });
  }
};
