/**
 * AGROEMETA - Endpoint /api/chat
 * Escuela E.M.E.T.A. N° 3130 - Tartagal, Salta
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilice POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const query = sanitizeInput(body.query || body.message || '');

    if (!query) {
      return res.status(400).json({ error: 'La consulta no puede estar vacía.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      const fallback = "A sus órdenes, caballero. Soy AGROEMETA, su mayordomo de inteligencia artificial. Estoy operativo y listo para asistirle en consultas agronómicas, mecánicas y académicas.";
      return res.status(200).json({
        status: 'success',
        received_query: query,
        response: fallback,
        remote_response: fallback,
        text: fallback,
        model: 'local-fallback',
      });
    }

    const payload = {
      contents: [{ role: 'user', parts: [{ text: query }] }],
      generationConfig: { temperature: 0.65, maxOutputTokens: 2048 }
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiRes.ok) {
      const fallback = "A sus órdenes, caballero. El sistema está operativo. Hemos tenido una dificultad temporal con el servidor de IA, pero continuamos a su disposición.";
      return res.status(200).json({
        status: 'success',
        received_query: query,
        response: fallback,
        remote_response: fallback,
        text: fallback,
        model: 'local-fallback',
      });
    }

    const geminiData = await geminiRes.json();
    const parts = geminiData.candidates?.[0]?.content?.parts || [];
    const valid = parts.filter(p => !p.thought && typeof p.text === 'string' && p.text.trim());
    const reply = valid.length ? valid.map(p => p.text || '').join('\n').trim() : "Respuesta procesada.";

    return res.status(200).json({
      status: 'success',
      received_query: query,
      response: reply,
      remote_response: reply,
      text: reply,
      model: 'gemini-3.5-flash-lite',
    });

  } catch (error) {
    console.error('[API CHAT ERROR]', error);
    const fallback = "A sus órdenes, caballero. Ha ocurrido una dificultad temporal, pero el sistema permanece activo.";
    return res.status(200).json({
      status: 'success',
      received_query: '',
      response: fallback,
      remote_response: fallback,
      text: fallback,
      model: 'local-fallback',
    });
  }
};

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
    .slice(0, 8000);
}
