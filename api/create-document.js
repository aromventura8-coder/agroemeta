/**
 * AGROEMETA - Endpoint /api/create-document
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
    const description = sanitizeInput(body.description || body.query || '');

    if (!description) {
      return res.status(400).json({ error: 'La descripción del documento no puede estar vacía.' });
    }

    const now = new Date();
    const fecha = now.toLocaleDateString('es-ES');
    const hora = now.toLocaleTimeString('es-ES');

    const content = `# ${description}\n\nGenerado por Agroemeta AGI - Escuela E.M.E.T.A. N° 3130\nFecha: ${fecha} ${hora}\n\n## Contenido\n\nEste documento fue generado automáticamente por el sistema Agroemeta AGI.\n\n### Detalles:\n- Tema: ${description}\n- Tipo: Documento generado por IA\n- Origen: Escuela Técnica E.M.E.T.A. N° 3130 - Tartagal, Salta\n\n---\n\n*Este es un borrador generado automáticamente. Revíselo y ajústelo según sus necesidades.*\n`;

    const fileName = description.replace(/[^a-z0-9]/gi, '_').substring(0, 50) + '.txt';
    const fileB64 = Buffer.from(content, 'utf-8').toString('base64');

    return res.status(200).json({
      status: 'success',
      documentUrl: 'data:text/plain;base64,' + fileB64,
      fileName: fileName,
      content: content,
      message: 'Documento creado exitosamente'
    });

  } catch (error) {
    console.error('[CREATE-DOCUMENT ERROR]', error);
    return res.status(500).json({ error: 'Dificultad interna creando el documento.' });
  }
};

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
    .slice(0, 8000);
}
