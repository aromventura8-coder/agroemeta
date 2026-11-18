module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Solo POST' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const query = (body.query || body.message || '').trim();

    if (!query) return res.status(400).json({ error: 'Consulta vacía' });

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        response: 'A sus órdenes, caballero. El sistema está operativo. Sin embargo, la llave de Gemini no está configurada en el servidor.',
        model: 'local-fallback'
      });
    }

    const payload = {
      contents: [{ role: 'user', parts: [{ text: query }] }],
      systemInstruction: { parts: [{ text: 'Eres Agroemeta AGI, asistente de la Escuela E.M.E.T.A. N° 3130. Responde en español de forma clara y concisa.' }] },
      generationConfig: { temperature: 0.65, maxOutputTokens: 1500 }
    };

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiRes.ok) {
      const errTxt = await geminiRes.text();
      console.error('[ERROR]', errTxt);
      return res.status(200).json({
        response: 'Servidor temporalmente no disponible. Intente nuevamente.',
        model: 'error'
      });
    }

    const data = await geminiRes.json();
    const parts = geminiData.candidates?.[0]?.content?.parts || [];
    const text = parts.map(p => p.text || '').join(' ').trim() || 'Respuesta recibida.';

    return res.status(200).json({ response: text, model: 'gemini-3.5-flash-lite' });
  } catch (e) {
    console.error(error);
    return res.status(200).json({ response: 'Error interno del servidor.' });
  }
};
