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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ response: 'Llave API no configurada en el servidor.' });
    }

    const payload = {
      contents: [{ role: 'user', parts: [{ text: query }] }],
      systemInstruction: { parts: [{ text: 'Eres Agroemeta AGI. Responde en español de forma corta y directa.' }] },
      generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error('Gemini error:', errTxt);
      return res.status(200).json({ response: 'Error de conexión con Gemini.' });
    }

    const data = await geminiRes.json();
    const text = (geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '').trim() || 'Respuesta recibida.';

    return res.status(200).json({ response: text, model: 'gemini-3.5-flash-lite' });
  } catch (e) {
    console.error(error);
    return res.status(200).json({ response: 'Error interno del servidor.' });
  }
};
