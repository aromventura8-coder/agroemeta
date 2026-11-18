module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Solo POST' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const query = body.query || body.message || '';

    if (!query) return res.status(400).json({ error: 'Consulta vacía' });

    return res.status(200).json({
      response: `Recibido: ${query}`,
      model: 'test'
    });
  } catch (e) {
    return res.status(200).json({ error: String(e) });
  }
};
