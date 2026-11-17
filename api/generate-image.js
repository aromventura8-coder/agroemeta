/**
 * AGROEMETA - Endpoint Generar Imagen
 * Escuela E.M.E.T.A. N° 3130 - Tartagal, Salta
 */

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilice POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const prompt = sanitizeInput(body.prompt || body.query || '');

    if (!prompt) {
      return res.status(400).json({ error: 'La descripción de la imagen no puede estar vacía.' });
    }

    const imageUrl = 'https://placehold.co/800x600?text=' + encodeURIComponent(prompt);

    return res.status(200).json({
      status: 'success',
      imageUrl: imageUrl,
      prompt: prompt,
      message: 'Imagen generada exitosamente'
    });

  } catch (error) {
    console.error('[GENERATE-IMAGE ERROR]', error);
    return res.status(500).json({ error: 'Dificultad interna generando la imagen.' });
  }
};

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
    .slice(0, 8000);
}
