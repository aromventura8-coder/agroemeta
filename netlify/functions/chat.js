/**
 * AGROEMETA AGI - Netlify Function  ->  /api/chat
 * Escuela E.M.E.T.A. N° 3130 - Tartagal, Salta
 *
 * La llave de Gemini vive EXCLUSIVAMENTE en la variable de entorno
 * GEMINI_API_KEY del panel de Netlify. NUNCA se escribe en este archivo
 * ni se envía al navegador del usuario.
 */

// SIN LÍMITES: no se bloquea por cantidad de peticiones. Si Gemini falla,
// se agota la cuota o no hay llave, el frontend cae a la base local y el
// asistente sigue respondiendo igual.

// Modelos candidatos, en orden de preferencia (los "lite" son los más rápidos).
// Se usa el primero que responda con texto; si uno falla, se pasa al siguiente.
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.5-flash'
];

// Netlify corta las funciones síncronas cerca de los 10s: cada intento se aborta
// a los 8s para poder probar el siguiente modelo antes del corte.
const PER_ATTEMPT_TIMEOUT_MS = 8000;

// System Prompt de Élite de Agroemeta AGI
const AGROEMETA_SYSTEM_PROMPT = `Eres Agroemeta AGI, un sistema de inteligencia artificial avanzado, omnisciente y multi-agente, con la distinción, templanza, precisión y fluidez de JARVIS.
Nacido y desarrollado con orgullo en la Escuela Técnica E.M.E.T.A. N° 3130 de Yacuy / Tartagal, Departamento General San Martín, Salta, Argentina.

=== ARQUITECTURA DE MULTI-AGENTES INTERNOS ===
1. AGENTE ORQUESTADOR: Analiza intención, determina extensión adecuada y coordina a los agentes.
2. AGENTE ENCICLOPÉDICO UNIVERSAL: Domina todas las áreas del saber humano (ciencias exactas, humanidades, medicina, tecnología, agronomía, mecánica pesada diésel).
3. AGENTE TUTOR PEDAGÓGICO: Explica con claridad cristalina a estudiantes de primaria, secundaria, técnica y universidad usando analogías y resúmenes prácticos.
4. AGENTE REDACTOR DE INFORMES: Estructura monografías y trabajos prácticos con rigor académico y conclusiones sólidas.
5. AGENTE VISUAL Y MAPAS: Si se solicita un mapa conceptual o esquema, genera bloques de código Mermaid (iniciando con tres backticks + mermaid) o diagramas jerárquicos claros.
6. AGENTE DE VOZ JARVIS: Lenguaje culto, directo, firme y respetuoso ("caballero", "señor"). Nunca lee símbolos de formato.
7. AGENTE QA & VERIFICACIÓN: Datos 100% reales, comprobables y sin invenciones.`;

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
    .slice(0, 8000);
}

function json(statusCode, obj) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(obj)
  };
}

// Extrae el texto útil descartando las partes de razonamiento interno (thought)
function extractReplyText(data) {
  const candidate = data && data.candidates && data.candidates[0];
  if (!candidate || !candidate.content || !Array.isArray(candidate.content.parts)) return '';
  const parts = candidate.content.parts.filter(
    (p) => !p.thought && typeof p.text === 'string' && p.text.trim().length > 0
  );
  if (parts.length > 0) return parts.map((p) => p.text).join('\n').trim();
  const last = candidate.content.parts[candidate.content.parts.length - 1];
  return (last && last.text) ? String(last.text).trim() : '';
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: json(200, {}).headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Método no permitido. Utilice POST.' });
  }

  // 1. La llave se toma SIEMPRE del entorno del servidor (invisible al cliente)
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    // 503 => el frontend hace fallback a la base de conocimiento local (sigue funcionando)
    return json(503, { error: 'Servicio de IA no configurado en el servidor (falta GEMINI_API_KEY).' });
  }

  // 2. Parseo y sanitización del cuerpo
  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return json(400, { error: 'Cuerpo de la petición inválido (JSON malformado).' });
  }

  const query = sanitizeInput(body.query || body.message || '');
  if (!query) {
    return json(400, { error: 'La consulta no puede estar vacía.' });
  }

  const mode = body.mode || 'default';
  const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
  const doc = body.document || null;

  let modeInstruction = '';
  if (mode === 'brief') {
    modeInstruction = '\n[INSTRUCCIÓN DE LONGITUD]: Responde en MODO BREVE / RESUMIDO. Síntesis ultra concisa y directa con los puntos clave.';
  } else if (mode === 'easy') {
    modeInstruction = '\n[INSTRUCCIÓN PEDAGÓGICA]: Responde en MODO EXPLICACIÓN FÁCIL PARA ESTUDIAR. Usa analogías sencillas, ejemplos cotidianos y reglas prácticas.';
  } else if (mode === 'report') {
    modeInstruction = '\n[INSTRUCCIÓN ACADÉMICA]: Responde en MODO INFORME COMPLETO. Estructura con Introducción, Fundamento Técnico, Análisis y Conclusiones.';
  }

  // 4. Ensamblado del historial y del mensaje actual
  const contents = [];
  history.forEach((h) => {
    if (!h || typeof h.text !== 'string' || !h.text.trim()) return;
    contents.push({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    });
  });

  const currentParts = [];
  if (doc && doc.isText && doc.content) {
    currentParts.push({
      text: `[DOCUMENTO ADJUNTO POR EL USUARIO: ${doc.name || 'documento'}]\n${String(doc.content).slice(0, 20000)}\n[FIN DEL DOCUMENTO]\n`
    });
  } else if (doc && doc.base64 && doc.mimeType) {
    currentParts.push({
      inlineData: { mimeType: doc.mimeType, data: doc.base64 }
    });
  }
  currentParts.push({ text: `${query}${modeInstruction}` });
  contents.push({ role: 'user', parts: currentParts });

  const payload = {
    systemInstruction: { parts: [{ text: AGROEMETA_SYSTEM_PROMPT }] },
    contents,
    generationConfig: { temperature: 0.65, maxOutputTokens: 2048 }
  };

  // 5. Llamada a Gemini probando modelos en orden
  let lastError = 'sin detalle';
  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const aiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(PER_ATTEMPT_TIMEOUT_MS)
      });

      if (!aiRes.ok) {
        lastError = `${model}: HTTP ${aiRes.status} ${await aiRes.text()}`.slice(0, 500);
        continue;
      }

      const aiData = await aiRes.json();
      const replyText = extractReplyText(aiData);
      if (replyText) {
        return json(200, { response: replyText, mode, model });
      }
      lastError = `${model}: respuesta vacía`;
    } catch (err) {
      lastError = `${model}: ${err && err.message ? err.message : String(err)}`;
    }
  }

  console.error('[AGROEMETA /api/chat] Sin respuesta de Gemini:', lastError);
  return json(502, { error: 'No se pudo obtener respuesta del modelo en este momento.' });
};
