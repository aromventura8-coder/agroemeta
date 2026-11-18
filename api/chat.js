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

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
      return res.status(200).json({ response: 'Llave API no configurada.' });
    }

    const payload = {
      contents: [{ role: 'user', parts: [{ text: query }] }],
      systemInstruction: { parts: [{ text: 'Eres Agroemeta AGI. Responde en español de forma corta.' }] },
      generationConfig: { temperature: 0.65, maxOutputTokens: 2048 }
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiRes.ok) {
      const errTxt = await geminiRes.text();
      console.error('[ERROR]', errTxt);
      return res.status(200).json({ response: 'Error de conexión con Gemini.' });
    }

    const data = await geminiRes.json();
    const parts = geminiData.candidates?.[0]?.content?.parts || [];
    const valid = parts.filter(p => !p.thought && typeof p.text === 'string' && p.text.trim());
    const reply = valid.length ? valid.map(p => p.text || '').join('\n').trim() : 'Respuesta recibida.';

    return res.status(200).json({ response: reply, model: 'gemini-3.5-flash-lite' });

  } catch (e) {
    console.error('[ERROR]', e);
    return res.status(200).json({ response: 'Error interno: ' + e.message });
  }
};
