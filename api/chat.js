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

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Consulta vacía' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        response: 'A sus órdenes, caballero. Soy Agroemeta AGI. Su llave de API no está configurada en el servidor.',
        model: 'local-fallback'
      });
    }

    const payload = {
      contents: [{ role: 'user', parts: [{ text: query }] }],
      systemInstruction: {
        parts: [{
          text: `Eres Agroemeta AGI, un sistema de inteligencia artificial avanzada desarrollado en la Escuela Técnica E.M.E.T.A. N° 3130 de Tartagal, Salta, Argentina. Responde en español de forma clara, precisa y respetuosa usando "vos" o "tú". Domina agronomía, mecánica diésel y todas las materias escolares.`
        }]
      },
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
      console.error('[AGROEMETA CHAT ERROR]', errTxt);
      return res.status(200).json({
        response: 'A sus órdenes, caballero. He procesado su consulta, pero hay una dificultad con el servidor de IA. Intente nuevamente.',
        model: 'local-fallback'
      });
    }

    const geminiData = await geminiRes.json();
    const parts = geminiData.candidates?.[0]?.content?.parts || [];
    const valid = parts.filter(p => !p.thought && typeof p.text === 'string' && p.text.trim());
    const reply = valid.length ? valid.map(p => p.text || '').join('\n').trim() : 'Respuesta recibida.';

    return res.status(200).json({ response: reply, mode: body.mode || 'default', model: 'gemini-3.5-flash-lite' });

  } catch (error) {
    console.error('[AGROEMETA CHAT ERROR]', error);
    return res.status(200).json({
      response: 'A sus órdenes, caballero. Ha ocurrido una dificultad interna. Intente nuevamente.',
      error: error.message
    });
  }
};
