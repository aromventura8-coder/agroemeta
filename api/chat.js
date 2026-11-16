/**
 * AGROEMETA AGI - Endpoint Seguro Serverless /api/chat
 * Compatible con Vercel Functions, Netlify Functions y Node.js Backend
 * Escuela E.M.E.T.A. N° 3130 - Tartagal, Salta
 */

// SIN LÍMITES: no se bloquea por cantidad de peticiones. Si Gemini falla,
// se agota la cuota o no hay llave, el frontend cae a la base local y el
// asistente sigue respondiendo igual.

const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.5-flash'
];

// Sanitización de entradas para mitigar inyecciones maliciosas
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
    .slice(0, 8000); // Límite de seguridad de longitud
}

// System Prompt de Élite de Agroemeta AGI
const AGROEMETA_SYSTEM_PROMPT = `Eres Agroemeta AGI, un sistema de inteligencia artificial avanzado, omnisciente y multi-agente, con la distinción, templanza, precisión y fluidez de JARVIS.
Nacido y desarrollado con orgullo en la Escuela Técnica E.M.E.T.A. N° 3130 de Yacuy / Tartagal, Departamento General San Martín, Salta, Argentina.

=== ARQUITECTURA DE MULTI-AGENTES INTERNOS ===
1. AGENTE ORQUESTADOR: Analiza intención, determina extensión adecuada y coordina a los agentes.
2. AGENTE ENCICLOPÉDICO UNIVERSAL: Domina todas las áreas del saber humano (ciencias exactas, humanidades, medicina, tecnología, agronomía, mecánica pesada diésel).
3. AGENTE TUTOR PEDAGÓGICO: Explica con claridad cristalina a estudiantes de primaria, secundaria, técnica y universidad usando analogías y resúmenes prácticos.
4. AGENTE REDACTOR DE INFORMES: Estructura monografías y trabajos prácticos con rigor académico y conclusiones sólidas.
5. AGENTE VISUAL Y MAPAS: Si se solicita un mapa conceptual o esquema, genera bloques de código Mermaid (iniciando con \`\`\`mermaid) o diagramas jerárquicos claros.
6. AGENTE DE VOZ JARVIS: Lenguaje culto, directo, firme y respetuoso ("caballero", "señor"). Nunca lee símbolos de formato.
7. AGENTE QA & VERIFICACIÓN: Datos 100% reales, comprobables y sin invenciones.

=== GEOGRAFÍA, EMPRESAS Y ENLACES A GOOGLE MAPS ===
Cuando el usuario pregunte por una empresa, campo, fábrica, organismo público o institución en Tartagal, Salta, Argentina o el mundo:
1. Explica país, provincia, ciudad, dirección o ruta exacta y referencias cercanas.
2. Explica qué hace, qué perfiles laborales busca y cómo postularse.
3. Entrega siempre los botones o enlaces funcionales a Google Maps:
   - Ver ubicación exacta: https://google.com
   - Indicaciones de cómo llegar: https://google.com`;

module.exports = async (req, res) => {
  // 1. Cabeceras de Seguridad HTTP y CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilice POST.' });
  }

  try {
    // 2. Procesamiento y Sanitización del Body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const rawQuery = body.query || body.message || '';
    const query = sanitizeInput(rawQuery);
    const mode = body.mode || 'default'; // 'default', 'brief', 'easy', 'report'
    const history = Array.isArray(body.history) ? body.history.slice(-10) : [];

    if (!query) {
      return res.status(400).json({ error: 'La consulta no puede estar vacía.' });
    }

    // 4. Inyección del Modo de Respuesta
    let modeInstruction = "";
    if (mode === 'brief') {
      modeInstruction = "\n[INSTRUCCIÓN DE LONGITUD]: Responde en MODO BREVE / RESUMIDO. Síntesis ultra concisa y directa con los puntos clave.";
    } else if (mode === 'easy') {
      modeInstruction = "\n[INSTRUCCIÓN PEDAGÓGICA]: Responde en MODO EXPLICACIÓN FÁCIL PARA ESTUDIAR. Usa analogías sencillas, ejemplos cotidianos y reglas prácticas.";
    } else if (mode === 'report') {
      modeInstruction = "\n[INSTRUCCIÓN ACADÉMICA]: Responde en MODO INFORME COMPLETO. Estructura con Introducción, Fundamento Técnico, Análisis y Conclusiones.";
    }

    // 5. Conexión Segura con Gemini API desde el Servidor (Zero Exposición de Llaves)
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      // 503 => el frontend hace fallback a la base de conocimiento local (sigue funcionando)
      return res.status(503).json({
        error: 'Servicio de IA no configurado en el servidor (falta GEMINI_API_KEY).'
      });
    }

    const formattedContents = [];
    history.forEach((h) => {
      if (!h || typeof h.text !== 'string' || !h.text.trim()) return;
      formattedContents.push({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      });
    });

    const currentParts = [];
    const doc = body.document;
    if (doc && doc.isText && doc.content) {
      currentParts.push({
        text: `[DOCUMENTO ADJUNTO POR EL USUARIO: ${doc.name || 'documento'}]\n${String(doc.content).slice(0, 20000)}\n[FIN DEL DOCUMENTO]\n`
      });
    } else if (doc && doc.base64 && doc.mimeType) {
      currentParts.push({ inlineData: { mimeType: doc.mimeType, data: doc.base64 } });
    }
    currentParts.push({ text: `${query}${modeInstruction}` });
    formattedContents.push({ role: 'user', parts: currentParts });

    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: AGROEMETA_SYSTEM_PROMPT }]
      },
      contents: formattedContents,
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 2048
      }
    };

    // Se prueban los modelos en orden hasta obtener respuesta (los "lite" son los más rápidos).
    let lastError = 'sin detalle';
    for (const model of CANDIDATE_MODELS) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const aiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiPayload),
          signal: AbortSignal.timeout(8000)
        });

        if (!aiRes.ok) {
          lastError = `${model}: HTTP ${aiRes.status} ${await aiRes.text()}`.slice(0, 500);
          continue;
        }

        const aiData = await aiRes.json();
        const parts = (aiData && aiData.candidates && aiData.candidates[0] && aiData.candidates[0].content && aiData.candidates[0].content.parts) || [];
        const valid = parts.filter((p) => !p.thought && typeof p.text === 'string' && p.text.trim());
        const replyText = (valid.length ? valid : parts).map((p) => p.text || '').join('\n').trim();

        if (replyText) {
          return res.status(200).json({ response: replyText, mode: mode, model: model });
        }
        lastError = `${model}: respuesta vacía`;
      } catch (err) {
        lastError = `${model}: ${err && err.message ? err.message : String(err)}`;
      }
    }

    console.error('[API CHAT ERROR]', lastError);
    // 502 => el frontend hace fallback a la base de conocimiento local (sigue funcionando)
    return res.status(502).json({ error: 'No se pudo obtener respuesta del modelo en este momento.' });

  } catch (error) {
    console.error('[SERVERLESS FATAL ERROR]', error);
    return res.status(500).json({
      error: 'Dificultad interna de procesamiento en el servidor de Agroemeta AGI.'
    });
  }
};
