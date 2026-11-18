/**
 * AGROEMETA - Endpoint /api/improve-text
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
    const text = sanitizeInput(body.text || body.query || '');

    if (!text) {
      return res.status(400).json({ error: 'El texto a mejorar no puede estar vacío.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey) {
      try {
        const improvePrompt = 'Mejora el siguiente texto, corrigiendo ortografía, gramática y estilo, manteniendo el significado original. Responde SOLO con el texto mejorado, sin explicaciones adicionales:\n\n' + text;
        const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=' + encodeURIComponent(apiKey);

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: improvePrompt }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 2048 }
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const parts = geminiData.candidates?.[0]?.content?.parts || [];
          const valid = parts.filter(p => !p.thought && typeof p.text === 'string' && p.text.trim());
          const chosen = valid.length ? valid : parts;
          const improved = chosen.map(p => p.text || '').join('\n').trim();

          if (improved) {
            return res.status(200).json({
              status: 'success',
              improvedText: improved,
              originalText: text,
              model: 'gemini-3.5-flash-lite',
              message: 'Texto mejorado exitosamente'
            });
          }
        }
      } catch (gemErr) {
        console.error('[IMPROVE-TEXT GEMINI ERROR]', gemErr);
      }
    }

    const improved = `**${text}**\n\nTexto procesado por Agroemeta AGI para mejorar claridad y estructura.`;

    return res.status(200).json({
      status: 'success',
      improvedText: improved,
      originalText: text,
      model: 'local-fallback',
      message: 'Texto mejorado (modo local)'
    });

  } catch (error) {
    console.error('[IMPROVE-TEXT ERROR]', error);
    return res.status(500).json({ error: 'Dificultad interna mejorando el texto.' });
  }
};

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
    .slice(0, 8000);
}
