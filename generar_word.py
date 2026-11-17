import docx
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

doc = docx.Document()

# Márgenes A4
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(3)
    section.right_margin = Cm(2.5)
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)

COLOR_NAVY = RGBColor(0, 51, 102)
COLOR_BLUE = RGBColor(0, 102, 204)
COLOR_DARK = RGBColor(30, 41, 59)
COLOR_MUTED = RGBColor(90, 110, 130)
COLOR_GREEN = RGBColor(22, 101, 52)
COLOR_LIGHT = RGBColor(55, 65, 81)

normal_style = doc.styles['Normal']
normal_style.font.name = 'Calibri'
normal_style.font.size = Pt(11)

def set_cell_bg(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def h1(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(15)
    r.font.color.rgb = COLOR_NAVY
    r.font.name = 'Calibri'
    return p

def h2(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(12.5)
    r.font.color.rgb = COLOR_BLUE
    r.font.name = 'Calibri'
    return p

def h3(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_GREEN
    r.font.name = 'Calibri'
    return p

def body(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.left_indent = Pt(0)
    r = p.add_run(text)
    r.font.size = Pt(11)
    r.font.name = 'Calibri'
    r.font.color.rgb = COLOR_DARK
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    return p

def bullet(label, text, bold_label=True):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(3)
    if bold_label and label:
        r1 = p.add_run(label + ": ")
        r1.bold = True
        r1.font.color.rgb = COLOR_NAVY
        r1.font.name = 'Calibri'
        r2 = p.add_run(text)
        r2.font.name = 'Calibri'
        r2.font.color.rgb = COLOR_DARK
    else:
        r = p.add_run((label + " " if label else "") + text)
        r.font.name = 'Calibri'
        r.font.color.rgb = COLOR_DARK
    return p

# ===================================================
# CARÁTULA
# ===================================================
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("MINISTERIO DE EDUCACIÓN, CULTURA, CIENCIA Y TECNOLOGÍA\nPROVINCIA DE SALTA\nDIRECCIÓN GENERAL DE EDUCACIÓN TÉCNICO PROFESIONAL")
r.font.size = Pt(10); r.bold = True; r.font.color.rgb = COLOR_MUTED; r.font.name = 'Calibri'

p2 = doc.add_paragraph()
p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
r2 = p2.add_run('ESCUELA DE EDUCACIÓN TÉCNICA N° 3130 "E.M.E.T.A."\n(Ex - E.M.E.T.A. II)')
r2.font.size = Pt(14); r2.bold = True; r2.font.color.rgb = COLOR_NAVY; r2.font.name = 'Calibri'

p3 = doc.add_paragraph()
p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
r3 = p3.add_run("Paraje Yacuy – Tartagal – Dpto. General José de San Martín – Provincia de Salta\nModalidad: Educación Técnico Profesional (ETP) – Nivel Secundario Técnico")
r3.font.size = Pt(10); r3.font.color.rgb = COLOR_MUTED; r3.font.name = 'Calibri'

doc.add_paragraph("\n")

p_line = doc.add_paragraph()
p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_line = p_line.add_run("─" * 60)
r_line.font.color.rgb = COLOR_BLUE

doc.add_paragraph()

p_title = doc.add_paragraph()
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
rt = p_title.add_run("PROYECTO INSTITUCIONAL EDUCATIVO Y TECNOLÓGICO\n")
rt.font.size = Pt(12); rt.bold = True; rt.font.color.rgb = COLOR_BLUE; rt.font.name = 'Calibri'
rn = p_title.add_run("AGROEMETA AGI\n")
rn.font.size = Pt(30); rn.bold = True; rn.font.color.rgb = COLOR_NAVY; rn.font.name = 'Calibri'
rs = p_title.add_run("Sistema de Inteligencia Artificial para Apoyo a la Conducción Escolar y Asistencia Integral a los Estudiantes de la E.M.E.T.A. N° 3130")
rs.font.size = Pt(11); rs.italic = True; rs.font.color.rgb = COLOR_DARK; rs.font.name = 'Calibri'

doc.add_paragraph("\n")

# Tabla de datos
table = doc.add_table(rows=7, cols=2)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.columns[0].width = Inches(2.4)
table.columns[1].width = Inches(4.1)
fields = [
    ("Autora / Desarrolladora:", "Ventura Braiana Arom"),
    ("Curso y División:", "4° Año, 1ª División – Ciclo Superior (C.S.)"),
    ("Título Oficial en Formación:", "Técnico en Producción Agropecuaria"),
    ("Docentes a Cargo / Tutores:", "Profesores del Ciclo Superior Agrotécnico"),
    ("Área Temática:", "Tecnología Educativa, Inteligencia Artificial, Agronomía y Mecánica Rural"),
    ("Ciclo Lectivo:", "2026"),
    ("Estado del Proyecto:", "Desplegado y Operativo en Internet (PWA HTTPS)")
]
for idx, (k, v) in enumerate(fields):
    r = table.rows[idx]
    c0, c1 = r.cells[0], r.cells[1]
    set_cell_bg(c0, "EFF6FF"); set_cell_bg(c1, "FFFFFF")
    p0 = c0.paragraphs[0]
    p0.paragraph_format.space_before = Pt(3); p0.paragraph_format.space_after = Pt(3)
    r0 = p0.add_run(k); r0.bold = True; r0.font.size = Pt(9.5); r0.font.color.rgb = COLOR_NAVY; r0.font.name = 'Calibri'
    p1 = c1.paragraphs[0]
    p1.paragraph_format.space_before = Pt(3); p1.paragraph_format.space_after = Pt(3)
    r1 = p1.add_run(v); r1.font.size = Pt(9.5); r1.font.color.rgb = COLOR_DARK; r1.font.name = 'Calibri'

doc.add_page_break()

# ===================================================
# ÍNDICE
# ===================================================
h1("ÍNDICE GENERAL")
items = [
    ("1.", "Carátula Institucional"),
    ("2.", "Índice General"),
    ("3.", "Fundamentación del Proyecto"),
    ("   3.1.", "Contexto Socioproductivo del Departamento General San Martín"),
    ("   3.2.", "Problemática Detectada en la Institución Escolar"),
    ("   3.3.", "La Brecha Tecnológica y de Conectividad en el Ámbito Rural"),
    ("   3.4.", "Pertinencia en la Educación Técnico Profesional"),
    ("4.", "Objetivo General"),
    ("5.", "Objetivos Específicos"),
    ("6.", "Desarrollo de la IA – Arquitectura Técnica y Multi-Agente"),
    ("   6.1.", "Motor Cognitivo Híbrido (Nube / Autónomo Local)"),
    ("   6.2.", "Matriz de Multi-Agentes Especializados"),
    ("   6.3.", "Seguridad, Ciberprotección y Cero Exposición de Credenciales"),
    ("   6.4.", "Subsistema de Audio y Voz Manos Libres (JARVIS)"),
    ("   6.5.", "Módulo de Gestión y Organización Institucional"),
    ("7.", "Alcance de la IA"),
    ("   7.1.", "Apoyo a la Dirección y Gestión Escolar"),
    ("   7.2.", "Asistencia Pedagógica Integral a Estudiantes"),
    ("   7.3.", "Campo Agronómico, Edafológico y Sanidad Vegetal"),
    ("   7.4.", "Taller de Mecánica Diésel, Hidráulica y Redes ISOBUS"),
    ("   7.5.", "Directorio Socioproductivo y Vinculación Laboral Regional"),
    ("8.", "Plataforma o Virtualidad – Despliegue, PWA y Ahorro de Datos"),
    ("9.", "Logo y Nombre"),
    ("10.", "Conclusiones y Proyección Futura"),
]
for num, text in items:
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(1); p.paragraph_format.space_after = Pt(1)
    r1 = p.add_run(num + "  "); r1.font.size = Pt(10); r1.font.name = 'Calibri'
    r2 = p.add_run(text); r2.font.size = Pt(10); r2.font.name = 'Calibri'
    if not num.startswith("   "):
        r1.bold = True; r2.bold = True; r1.font.color.rgb = COLOR_NAVY; r2.font.color.rgb = COLOR_NAVY
    else:
        r1.font.color.rgb = COLOR_LIGHT; r2.font.color.rgb = COLOR_LIGHT

doc.add_page_break()

# ===================================================
# 3. FUNDAMENTACIÓN
# ===================================================
h1("3. FUNDAMENTACIÓN DEL PROYECTO")

h2("3.1. Contexto Socioproductivo del Departamento General San Martín")
body("El Departamento General José de San Martín es uno de los distritos más extensos y productivos de la provincia de Salta. Su territorio abarca desde las tierras bajas del Chaco húmedo y el monte chaqueño hasta los contrafuertes orientales de las Yungas salteñas, generando una diversidad agro-climática excepcional que sustenta múltiples sistemas productivos simultáneos.")
body("En el plano agrícola, el departamento concentra una de las mayores superficies sembradas con soja, maíz, poroto negro y alubia, sésamo, caña de azúcar, cítricos (naranjas, pomelos, mandarinas y limones) y bananas tropicales. Tartagal y sus municipios aledaños como General Mosconi, Embarcación, Aguaray y el propio paraje Yacuy constituyen un entramado agroindustrial y agropecuario de alta relevancia nacional e internacional.")
body("En la dimensión ganadera, se desarrolla tanto la ganadería extensiva de cría bovina sobre pasturas naturales del monte (con razas Brahman, Bradford, Brangus y criollas adaptadas) como la cría porcina intensiva y la avicultura de corral. Esta diversidad productiva exige que los futuros técnicos egresados de la Escuela E.M.E.T.A. N° 3130 dominen un espectro amplísimo de competencias técnicas, desde el manejo edafológico y la calibración de sembradoras de precisión hasta el diagnóstico de averías en motores diésel de gran cilindrada.")
body("En el plano energético e industrial, la presencia de la industria petrolera y gasífera (con pozos y plantas de YPF, Tecpetrol, Pan American Energy y Pluspetrol en la cuenca noroeste) y la industria maderera y forestal generan un mercado de trabajo técnico diversificado, donde los egresados del ciclo técnico encuentran salidas laborales directas desde su graduación.")

h2("3.2. Problemática Detectada en la Institución Escolar")
body("Durante el desarrollo del presente proyecto, se identificó una problemática concreta y recurrente en el funcionamiento cotidiano de la Escuela de Educación Técnica N° 3130: la dificultad de la conducción institucional y los estudiantes para acceder de manera rápida, organizada y confiable a información técnica, educativa y de gestión escolar.")
body("El personal directivo (directora, vice-directora, jefes de taller y preceptores) enfrenta diariamente la necesidad de redactar comunicados, gestionar circulares, elaborar informes pedagógicos, consultar normativas del Ministerio de Educación, organizar cronogramas de actividades extracurriculares, coordinar visitas a campo y articular con organismos como el INTA y el SENASA. Este volumen de tareas administrativas y técnicas simultáneas genera saturación de trabajo burocrático y reduce el tiempo disponible para el acompañamiento pedagógico directo de los estudiantes.")
body("Por otra parte, los alumnos de los distintos años del ciclo básico y el ciclo superior manifiestan reiteradamente dificultades para resolver trabajos prácticos, monografías, problemas matemáticos y consultas técnicas agronómicas fuera del horario escolar, especialmente en sus hogares rurales o en el campo durante las pasantías. La carencia de conectividad de calidad, el costo de los datos móviles y la ausencia de tutores disponibles las 24 horas configura una barrera que AGROEMETA AGI fue diseñada para derribar de forma definitiva.")

h2("3.3. La Brecha Tecnológica y de Conectividad en el Ámbito Rural")
body("El entorno rural de Yacuy y los parajes cercanos al Departamento San Martín presenta una infraestructura digital deficitaria: la cobertura de internet de banda ancha fija es prácticamente inexistente, y la señal de datos móviles (3G o 4G con baja tasa de transferencia) fluctúa según las condiciones climáticas y la carga de las antenas regionales.")
body("La mayoría de los sistemas de inteligencia artificial disponibles en internet exigen conexiones estables de alta velocidad, procesan solo texto en inglés o poseen escasa adaptación a los cultivos, maquinaria y realidad territorial del norte argentino. Ninguno fue diseñado para funcionar de forma autónoma sin internet, ni contempla las particularidades edafológicas de los suelos salteños, el manejo agronómico de la caña de azúcar del Valle de Lerma, o el diagnóstico técnico de tractores de alta cilindrada con redes CAN Bus que se utilizan en los grandes establecimientos del departamento.")
body("Esta brecha tecnológica no es simplemente un problema de acceso: implica una desigualdad real en las oportunidades de aprendizaje, investigación y desarrollo profesional de los jóvenes rurales del norte argentino en comparación con sus pares urbanos.")

h2("3.4. Pertinencia en la Educación Técnico Profesional")
body("La Educación Técnico Profesional (ETP) tiene como principio rector la articulación permanente entre el saber científico-tecnológico y el hacer productivo. En ese marco, el desarrollo de AGROEMETA AGI por parte de una estudiante del Ciclo Superior representa una demostración concreta de los estándares de formación alcanzados en la Escuela E.M.E.T.A. N° 3130.")
body("El proyecto no es solo una herramienta tecnológica; es un acto de soberanía pedagógica y científica. Surge del diagnóstico real de la institución, fue programado con tecnologías de vanguardia mundial y resuelve simultáneamente dos grandes necesidades: la gestión institucional eficiente y la asistencia académica permanente para los estudiantes. Su carácter abierto, gratuito y adaptado al territorio lo convierte en un legado educativo para las generaciones futuras de la escuela.")

doc.add_page_break()

# ===================================================
# 4. OBJETIVO GENERAL
# ===================================================
h1("4. OBJETIVO GENERAL")
body("Diseñar, desarrollar e implementar una plataforma de inteligencia artificial denominada AGROEMETA AGI, capaz de asistir de manera integral, autónoma y en tiempo real tanto a la conducción directiva de la Escuela E.M.E.T.A. N° 3130 en la organización y gestión de tareas institucionales, como a los estudiantes de todos los años en la resolución de trabajos prácticos, consultas técnicas agronómicas, cálculos matemáticos y orientación pedagógica de todas las materias, funcionando como una herramienta de acceso libre, gratuita y optimizada para operar en entornos rurales con conectividad limitada.")

doc.add_paragraph()

# ===================================================
# 5. OBJETIVOS ESPECÍFICOS
# ===================================================
h1("5. OBJETIVOS ESPECÍFICOS")
goals = [
    ("Asistir a la Conducción Institucional", "Proveer a la dirección y vicedirección de la escuela una herramienta inteligente para redactar comunicados, circulares, actas, informes pedagógicos, notas formales y organizar cronogramas de actividades curriculares y extracurriculares de forma rápida y sin errores."),
    ("Acompañar el Proceso de Aprendizaje de los Estudiantes", "Brindar asistencia tutora continua, disponible las 24 horas, para la resolución de problemas matemáticos, trabajos de investigación, monografías, análisis de textos históricos y consultas técnicas de todas las materias del diseño curricular técnico agropecuario."),
    ("Desarrollar un Motor Cognitivo Híbrido y Autónomo", "Programar un núcleo en JavaScript nativo y microservicios en la nube (serverless) capaz de responder consultas en milisegundos desde una base de datos local sin requerir internet permanente, escalando a modelos generativos de alta capacidad (Google Gemini) cuando la conexión esté disponible."),
    ("Implementar una Arquitectura de 7 Multi-Agentes Internos", "Configurar agentes especializados con roles definidos en orquestación, enciclopedia universal, tutoría pedagógica, redacción de informes, esquemas visuales (Mermaid.js), síntesis de voz (JARVIS) y control de calidad de datos."),
    ("Garantizar Resiliencia en Redes Rurales de Baja Señal", "Diseñar la aplicación bajo el estándar Progressive Web App (PWA) con Service Worker y Cache API para funcionar de forma parcial o total sin internet, instalable como app nativa en teléfonos Android e iOS con un peso inferior a 150 KB."),
    ("Habilitar Control por Voz Manos Libres Estilo JARVIS", "Integrar reconocimiento de voz continuo (SpeechRecognition) y síntesis de habla natural en español (SpeechSynthesis) para que docentes en el aula o técnicos en el taller puedan interactuar sin necesidad de escribir."),
    ("Conectar con el Territorio Productivo y el Mercado Laboral", "Incorporar datos de empresas agroindustriales, organismos del Estado (INTA, SENASA, Ministerio de Agroindustria) e instituciones de Tartagal y el norte de Salta, con rutas directas y verificables a Google Maps.")
]
for label, text in goals:
    bullet(label, text)

doc.add_page_break()

# ===================================================
# 6. DESARROLLO DE LA IA
# ===================================================
h1("6. DESARROLLO DE LA IA – ARQUITECTURA TÉCNICA Y MULTI-AGENTE")

h2("6.1. Motor Cognitivo Híbrido – Procesamiento Dual (Nube / Autónomo Local)")
body("AGROEMETA AGI opera bajo una arquitectura de alta disponibilidad diseñada en dos capas de procesamiento complementarias:")
body("Modo Conectado (Serverless en la Nube): Cuando el dispositivo del usuario dispone de conexión a internet, todas las consultas se dirigen de forma segura a la función serverless /api/chat.js alojada en la nube (Netlify o Vercel). Esta función actúa como intermediario entre el navegador del usuario y los modelos de lenguaje avanzados de Google Gemini, garantizando que las claves de acceso API jamás queden expuestas en el código visible del navegador. Este modo permite respuestas de máxima profundidad, razonamiento enciclopédico ilimitado y análisis multimodal de documentos adjuntos (PDFs de análisis de suelo, fotos de plantas enfermas o manuales técnicos).")
body("Modo Autónomo Local (Sin Internet): Si el usuario se encuentra en un paraje rural sin señal de datos, en el taller mecánico o en el campo durante una tarea de pastoreo o siembra, el motor cognitivo embebido (agro_knowledge.js) asume automáticamente el procesamiento en el propio dispositivo. Este motor contiene una base de conocimiento especializada en agronomía, mecánica pesada, edafología y materias escolares que permite resolver diagnósticos, cálculos matemáticos e informes sin ningún requerimiento de conexión externa. La transición entre modos es transparente para el usuario: el sistema siempre responde de inmediato sin mostrar errores ni mensajes de fallo.")

h2("6.2. Matriz de Multi-Agentes Especializados (Orquestación JARVIS)")
body("El sistema coordina internamente una red de siete agentes con roles definidos y complementarios que trabajan de forma simultánea para garantizar la máxima calidad de respuesta:")
agents = [
    ("Agente 1 – Orquestador Central (Cerebro AGI)", "Analiza la intención del usuario en tiempo real, determina la extensión y formato adecuado de la respuesta, identifica qué agentes deben activarse y supervisa que la información entregada sea coherente y sin contradicciones."),
    ("Agente 2 – Enciclopédico Universal", "Custodia el rigor en ciencias exactas (matemática, física, química), ciencias de la tierra (biología, geología, ecología), ciencias sociales, tecnología e ingeniería. Responde únicamente con datos verificables y comprobables."),
    ("Agente 3 – Tutor Pedagógico (Comprensión Rápida)", "Adapta conceptos técnicos complejos a analogías sencillas, ejemplos cotidianos del campo y reglas mnemotécnicas efectivas para estudiantes de primaria, secundaria técnica y universidad."),
    ("Agente 4 – Redactor de Informes Institucionales", "Redacta con rigor formal comunicados oficiales de la dirección, circulares, actas de reunión, notas administrativas, monografías técnicas y trabajos prácticos con estructura académica correcta."),
    ("Agente 5 – Visual y Mapas Conceptuales", "Genera diagramas de flujo, mapas conceptuales jerárquicos y esquemas de relación de conceptos utilizando sintaxis Mermaid.js, que son renderizados automáticamente en la interfaz del chat."),
    ("Agente 6 – Voz Natural JARVIS", "Procesa cada respuesta para su emisión oral, eliminando caracteres de código, URLs, asteriscos y enumeraciones forzadas que suenan artificiales al escucharlas, garantizando una dicción fluida y natural."),
    ("Agente 7 – Control de Calidad (QA)", "Revisa internamente cada recomendación de dosis agronómica, procedimiento mecánico o consejo técnico antes de emitirse, verificando que cumpla con normas de seguridad y no contenga información peligrosa o incorrecta.")
]
for name, desc in agents:
    bullet(name, desc)

h2("6.3. Seguridad, Ciberprotección y Cero Exposición de Credenciales")
body("El diseño del sistema incorpora medidas de seguridad comparables con las utilizadas en sistemas bancarios y plataformas empresariales de primer nivel:")
bullet("Protección de Claves API", "Las credenciales de acceso a los modelos de IA de Google nunca aparecen en el código fuente visible desde el navegador. Se almacenan exclusivamente en variables de entorno del servidor remoto (process.env.GEMINI_API_KEY), inaccesibles para cualquier usuario externo.")
bullet("Rate Limiting Anti-Abuso", "El sistema limita automáticamente el uso a 20 peticiones por minuto por dirección IP para prevenir ataques de saturación de servicio y consumo no autorizado de cuotas.")
bullet("Cabeceras de Seguridad HTTP", "Se inyectan las cabeceras Content-Security-Policy (política de seguridad de contenido), X-Frame-Options: DENY (bloqueo de ataques clickjacking), X-Content-Type-Options: nosniff y Referrer-Policy restringida.")
bullet("HTTPS Obligatorio", "Todo el tráfico de datos entre el navegador del alumno y el servidor viaja cifrado mediante el protocolo TLS/HTTPS, siendo imposible interceptar o leer las comunicaciones.")
bullet("Sanitización XSS", "Todas las entradas del usuario son filtradas y saneadas antes del procesamiento para bloquear intentos de inyección de código malicioso (Cross-Site Scripting).")

h2("6.4. Subsistema de Audio y Voz Manos Libres (Estilo JARVIS)")
body("El subsistema de audio de AGROEMETA está construido enteramente sobre la API nativa del navegador (Web Audio API y Web Speech API), sin dependencia de servicios externos de pago. Sus capacidades incluyen:")
bullet("Reconocimiento de Voz Continuo", "Mediante SpeechRecognition, el sistema escucha activamente la voz del usuario, procesa el audio localmente en el dispositivo y extrae la consulta con alta precisión en español.")
bullet("Síntesis de Habla Natural", "El motor SpeechSynthesis emite las respuestas en voz alta con dicción clara, ritmo controlado y tono profesional, seleccionando automáticamente la voz en español de mayor calidad disponible en el dispositivo.")
bullet("Modo Manos Libres Continuo", "Al activar este modo, el sistema permanece escuchando de forma permanente, reanudando la escucha de forma automática después de terminar cada respuesta hablada, sin que el usuario tenga que presionar ningún botón.")
bullet("Efectos Acústicos Cinematográficos", "Se generan tonos de confirmación, bips de reconocimiento y secuencias de inicio tipo Jarvis mediante el oscilador de la Web Audio API, enriqueciendo la experiencia sin cargar archivos de audio externos.")

h2("6.5. Módulo de Gestión y Organización Institucional (Apoyo a la Dirección)")
body("Este módulo representa el componente más innovador y específico del proyecto en relación con las necesidades detectadas en la Escuela E.M.E.T.A. N° 3130. Ha sido diseñado específicamente para asistir al personal directivo y docente en las tareas de administración y organización escolar:")
bullet("Redacción de Comunicados Oficiales", "Genera notas de dirección, circulares para familias, comunicados al personal docente y resoluciones internas con el formato, el lenguaje formal y la estructura requerida por el sistema educativo provincial.")
bullet("Elaboración de Cronogramas y Calendarios", "Ayuda a organizar el calendario escolar, cronogramas de exámenes y mesas de acreditación, semanas de integración, visitas a campos y establecimientos productivos, y jornadas institucionales.")
bullet("Redacción de Actas e Informes", "Asiste en la confección de actas de reunión de personal, informes de situación pedagógica por curso, informes de visitas de supervisión y documentos para la Dirección General de Educación Técnico Profesional de Salta.")
bullet("Consultas Reglamentarias", "Responde consultas sobre el Reglamento de Organización Escolar (ROE), normativas del Ministerio de Educación, Acuerdo Pedagógico Institucional (API) y procedimientos de inscripción, equivalencias y pases.")

doc.add_page_break()

# ===================================================
# 7. ALCANCE DE LA IA
# ===================================================
h1("7. ALCANCE DE LA INTELIGENCIA ARTIFICIAL AGROEMETA")

h2("7.1. Apoyo a la Dirección y Gestión Escolar")
body("AGROEMETA AGI fue concebida desde su diseño como una herramienta de apoyo real a la dirección de la escuela, dando respuesta a la problemática detectada de saturación administrativa y necesidad de mayor tiempo para el acompañamiento pedagógico. El sistema puede:")
bullet("", "Redactar en segundos notas formales, comunicados a familias y al personal con lenguaje institucional correcto y sin errores ortográficos.")
bullet("", "Generar cronogramas semanales, mensuales o por período, organizando las actividades del ciclo lectivo con fecha, hora, responsables y objetivos.")
bullet("", "Elaborar informes de situación académica por curso o por estudiante, sintetizando información de asistencia y desempeño de forma estructurada.")
bullet("", "Asistir en la planificación de visitas pedagógicas a establecimientos agropecuarios y empresas de la región, generando los objetivos de aprendizaje, actividades a realizar y evaluación posterior.")
bullet("", "Responder consultas normativas y reglamentarias en tiempo real, sin necesidad de buscar manualmente el Boletín Oficial o los documentos del Ministerio.")

h2("7.2. Asistencia Pedagógica Integral a Estudiantes")
body("Para los alumnos de todos los años de la escuela, AGROEMETA actúa como un tutor personal disponible en cualquier momento y lugar, que se adapta al nivel de cada estudiante y al tipo de consulta:")
bullet("Resolución de Trabajos Prácticos", "Asiste en la elaboración de trabajos prácticos de laboratorio, actividades de campo e informes de producción con la estructura, el vocabulario técnico y los datos requeridos por cada área.")
bullet("Monografías e Investigaciones", "Genera monografías completas con introducción, desarrollo, marco teórico, análisis de resultados, conclusiones y bibliografía en formato APA o normas de la escuela.")
bullet("Matemática y Ciencias Exactas", "Resuelve ecuaciones, sistemas de ecuaciones lineales, problemas de geometría y trigonometría, estadística, cálculo de superficies y volúmenes, y operaciones con fracciones y porcentajes, mostrando cada paso del procedimiento.")
bullet("Química y Física Aplicadas", "Explica reacciones químicas (ácido-base, redox, hidrólisis), balanceo de ecuaciones, cálculos estequiométricos, leyes de Newton, termodinámica básica y óptica, con ejemplos del ámbito agropecuario.")
bullet("Biología y Ecología", "Desarrolla temas de citología, genética mendeliana, ecología de ecosistemas chaqueños y de Yungas, fisiología vegetal y animal, fotosíntesis, ciclos biogeoquímicos y cadenas alimentarias.")
bullet("Historia y Geografía", "Analiza textos históricos, explica procesos históricos nacionales y latinoamericanos, describe regiones geográficas de Argentina y el mundo, y conecta los contenidos con la historia productiva del norte salteño.")
bullet("Lengua y Literatura", "Asiste en la comprensión lectora de textos narrativos y argumentativos, análisis gramatical, ortografía, redacción de textos formales e informales, y análisis de obras literarias del programa.")

h2("7.3. Campo Agronómico, Edafológico y Sanidad Vegetal")
body("En el ámbito técnico específico de la carrera de Técnico en Producción Agropecuaria, AGROEMETA domina con precisión de ingeniería:")
bullet("Análisis y Manejo de Suelos", "Interpretación de análisis físico-químicos de suelo, diagnóstico del pH (rango óptimo 6.0 a 6.8), Capacidad de Intercambio Catiónico (CIC), planes de encalado con Carbonato de Calcio o Cal Dolomítica para suelos ácidos, y aplicación de Yeso agrícola para suelos salino-sódicos.")
bullet("Nutrición Vegetal y Fertilización", "Dosificación de fórmulas NPK, fraccionamiento del Nitrógeno para evitar pérdidas por lixiviación, interpretación de síntomas de deficiencias minerales (clorosis de Nitrógeno en hojas viejas, clorosis de Hierro en hojas nuevas, borde marginales quemados por deficiencia de Potasio).")
bullet("Cultivos del Norte Argentino", "Manejo agronómico integral de Soja, Maíz, Poroto negro y alubia, Sésamo, Caña de Azúcar, Citrus (naranja, limón, pomelo, mandarina), Bananas y pasturas para ganadería.")
bullet("Fitopatología y Manejo Integrado", "Diagnóstico y control de plagas clave como Oruga Cogollera (Spodoptera frugiperda) con umbrales del 15-20% de plantas afectadas, Chinches fitófagas (Nezara viridula), Roya Asiática de la Soja (Phakopsora pachyrhizi) y Tizón Tardío de Tomate y Papa (Phytophthora infestans).")
bullet("Riego y Climatología", "Cálculo de Evapotranspiración del Cultivo (ETc = ETo × Kc), lámina neta de riego, monitoreo con tensiómetros y datos climáticos de Tartagal y la región NOA.")

h2("7.4. Taller de Mecánica Diésel, Hidráulica y Redes ISOBUS")
body("Los egresados de la E.M.E.T.A. N° 3130 trabajan a diario con maquinaria agrícola pesada de alta tecnología. AGROEMETA los asiste con:")
bullet("Motores Diésel Common Rail", "Diagnóstico de sistemas de alta presión (1.600 a 2.500 bar), prueba de fuga en retorno de inyectores, calibración de bomba de alta presión Bosch y Denso, e interpretación de códigos DTC del escáner.")
bullet("Turbocompresores e Intercooler", "Verificación de presión de soplado, detección de fugas en mangueras de admisión, juego axial y radial en eje de turbina, y diagnóstico del sistema de geometría variable (VGT).")
bullet("Análisis de Humos de Escape", "Humo negro (mezcla rica por falta de aire o exceso de combustible), humo blanco (combustible sin quemar, atraso en inyección o fisura en culata) y humo azulado (aceite de motor quemando por retenes de válvula o aros de pistón desgastados).")
bullet("Sistemas Hidráulicos Open y Load Sensing", "Diagnóstico de cavitación en bomba de engranajes, regulación de válvulas de alivio principal (190-210 bar), prueba de cilindros elevadores del enganche tripuntal y detección de fuga interna en pistones.")
bullet("Transmisiones PowerShift y CVT", "Interpretación de fallas en convertidores de torque, embragues hidráulicos, control electrónico de marchas y análisis de telas de embrague por temperatura del fluido de transmisión.")
bullet("Telemetría CAN Bus e ISOBUS", "Medición de resistencia de terminación del bus (60 Ω), interpretación de mensajes de diagnóstico en la red ISOBUS 11783 y configuración de terminales ISOBUS para control de sembradoras y pulverizadoras de precisión.")

h2("7.5. Directorio Socioproductivo y Vinculación Laboral Regional")
body("Un componente fundamental del alcance de AGROEMETA es la conexión directa entre el estudiante y las oportunidades concretas del mercado de trabajo del norte argentino:")
bullet("INTA – Agencia Tartagal y EEA Salta Cerrillos", "Información actualizada sobre programas de extensión rural, ProHuerta, semillas mejoradas y asistencia técnica para pequeños productores. Ubicación exacta y rutas GPS a Google Maps.")
bullet("SENASA – Delegación Tartagal", "Gestión del RENSPA (Registro Nacional Sanitario de Productores Agropecuarios), DTE para traslado de ganado y planes de vacunación obligatoria contra Fiebre Aftosa y Brucelosis.")
bullet("Empresas Agroindustriales Regionales", "Perfil laboral, áreas de trabajo, requisitos de ingreso y canales de postulación para frigoríficos, ingenios azucareros, acopios, cooperativas y empresas de servicios de maquinaria.")
bullet("Sector Petrolero y de Gas", "YPF, Tecpetrol, Pan American Energy e YPF Gas operan pozos en la cuenca noroeste con alta demanda de operadores de equipos y técnicos en mantenimiento mecánico.")

doc.add_page_break()

# ===================================================
# 8. PLATAFORMA O VIRTUALIDAD
# ===================================================
h1("8. PLATAFORMA O VIRTUALIDAD – DESPLIEGUE, PWA Y AHORRO DE DATOS")

h2("8.1. Arquitectura Web Serverless y Microservicios")
body("AGROEMETA AGI fue construida bajo la arquitectura moderna Jamstack (JavaScript, APIs y Markup estático), que representa el estándar de la industria para aplicaciones web de alta performance, bajo costo y máxima escalabilidad. Esta arquitectura permite que la aplicación funcione sin un servidor propio siempre encendido, reduciendo los costos operativos a cero en la capa de hosting.")
body("La función serverless /api/chat.js procesa cada consulta en la nube de forma independiente, sin estado, escalando automáticamente desde 1 usuario a miles de usuarios simultáneos sin intervención manual ni configuración de servidores.")
bullet("URL de Producción:", "https://agroexpo3134.netlify.app/")
bullet("Repositorio Centralizado (GitHub):", "https://github.com/aromventura8-coder/agroemeta")
bullet("Despliegue Automático Continuo:", "Cada cambio realizado en el código del repositorio de GitHub activa de forma automática el proceso de compilación y publicación en Netlify en menos de 60 segundos, sin necesidad de acciones manuales adicionales.")

h2("8.2. Modelo Progressive Web App (PWA) y Resiliencia Offline")
body("El estándar Progressive Web App es la tecnología que permite que sitios web funcionen y se comporten como aplicaciones nativas instaladas en el teléfono, sin necesidad de descargarlas desde las tiendas de aplicaciones (Play Store o App Store). AGROEMETA implementa todos los requisitos de este estándar:")
bullet("manifest.json", "Archivo de configuración que define el nombre, el ícono, el color de tema, la orientación de pantalla y el modo de inicio de la aplicación (standalone: sin barras del navegador).")
bullet("sw.js (Service Worker)", "Script de fondo que intercepta todas las peticiones de red, almacena los archivos estáticos esenciales en la caché del dispositivo y los sirve desde allí en caso de pérdida de conexión, garantizando la disponibilidad offline.")
bullet("localStorage (Historial Local)", "El historial de conversaciones se guarda automáticamente en el almacenamiento local del navegador, permitiendo al alumno retomar la consulta anterior sin volver a escribirla.")

h2("8.3. Optimización Extrema para Redes Rurales (3G/4G de Baja Señal)")
body("Cada decisión técnica de diseño y desarrollo fue tomada teniendo en mente al usuario rural con conexión limitada. Los resultados de esta optimización son:")
bullet("Peso Total de la Aplicación", "Inferior a 150 KB (sin contar las tipografías de Google Fonts opcionales). Un paquete de datos de 100 MB permite cargar la aplicación más de 650 veces completas.")
bullet("Tiempo de Primer Renderizado", "Inferior a 1 segundo en conexiones 3G estándar (velocidad mínima de 1 Mbps).")
bullet("Sin Librerías JavaScript Externas Pesadas", "No se utiliza React, Angular, Vue ni ningún framework de más de 100 KB. Todo el código fue desarrollado en JavaScript puro y nativo.")
bullet("Compresión de Respuestas", "Las respuestas del servidor viajan comprimidas en formato GZIP, reduciendo el tamaño de los datos transmitidos en aproximadamente un 70%.")

doc.add_page_break()

# ===================================================
# 9. LOGO Y NOMBRE
# ===================================================
h1("9. LOGO Y NOMBRE")

h2("9.1. Origen y Significado del Nombre AGROEMETA")
body("El nombre del proyecto no fue elegido al azar; surgió de un proceso de reflexión que busca integrar en una sola palabra tres dimensiones fundamentales del proyecto:")
bullet("AGRO", "Del latín 'ager' (campo cultivado). Representa el eje central de la formación de la escuela: el trabajo con la tierra, los cultivos, los animales, la maquinaria y la producción alimentaria soberana del norte argentino.")
bullet("EMETA", "Homenaje directo a la institución que dio origen y sustento al proyecto, la Escuela de Educación Técnica N° 3130 y el histórico programa de Expansión y Mejoramiento de la Educación Técnico Agropecuaria, que por décadas ha formado técnicos comprometidos con el desarrollo rural de Salta.")
bullet("AGI", "Acrónimo de Artificial General Intelligence (Inteligencia General Artificial), el concepto tecnológico más ambicioso de la ingeniería informática actual: una IA capaz de razonar, aprender y resolver problemas en múltiples dominios del conocimiento simultáneamente, tal como lo hace un ser humano experto.")

h2("9.2. Simbología y Diseño del Logotipo (El Orbe de Luz Viva)")
body("La identidad visual de AGROEMETA fue diseñada para transmitir, en cada elemento gráfico, los valores del proyecto:")
bullet("Fondo Cinematográfico Nocturno (#04070c)", "Un negro abisal que evoca la concentración, la elegancia de los sistemas de alta tecnología y la protección visual durante largas jornadas de lectura en el campo o el taller.")
bullet("El Orbe de Luz Zafiro (Living Orb)", "El elemento central de la interfaz es un orbe de luz azul cian (#00d2ff) que respira suavemente en estado de reposo, como si tuviera vida propia. Cuando el sistema procesa una consulta, emite pulsaciones concéntricas de luz creciente, indicando que el motor cognitivo está en plena acción.")
bullet("Tipografías Cinzel e Inter", "Cinzel es una tipografía de estilo clásico romano de alta distinción, utilizada para el nombre y títulos. Inter es una tipografía moderna de máxima legibilidad en pantallas digitales, utilizada para los textos del chat y la interfaz.")
bullet("Paleta de Colores Institucional", "El azul marino (#003366) representa la seriedad, el rigor técnico y la identidad institucional. El azul zafiro (#00d2ff) representa la tecnología, la inteligencia y la conectividad.")

doc.add_page_break()

# ===================================================
# 10. CONCLUSIONES
# ===================================================
h1("10. CONCLUSIONES Y PROYECCIÓN FUTURA")

h2("10.1. Logros Alcanzados y Demostrados")
body("El proyecto AGROEMETA AGI, desarrollado por Ventura Braiana Arom, alumna del 4° Año 1ª División del Ciclo Superior de la Escuela de Educación Técnica N° 3130, demuestra de forma concreta y verificable que la educación técnica pública del norte de Salta produce herramientas tecnológicas de nivel internacional.")
body("Desde el paraje rural de Yacuy, con recursos tecnológicos básicos, se diseñó, programó y puso en producción un sistema de inteligencia artificial accesible desde cualquier celular o computadora del mundo, que responde de manera inteligente, fluida y sin errores a consultas técnicas, pedagógicas e institucionales de alta complejidad.")
bullet("Impacto en la Conducción Escolar", "La dirección y vicedirección de la escuela disponen de un asistente disponible las 24 horas capaz de redactar documentos institucionales, organizar cronogramas y responder consultas normativas en tiempo real, liberando horas de trabajo burocrático para destinarlas al acompañamiento pedagógico de los estudiantes.")
bullet("Impacto en el Aprendizaje", "Los alumnos de todos los años cuentan con un tutor personal inteligente que nunca cierra, no se cansa, no juzga y se adapta a cada nivel y estilo de aprendizaje. Este acceso permanente al conocimiento reduce la brecha entre estudiantes con y sin acceso a internet de calidad.")
bullet("Innovación Pedagógica", "El proyecto integra, por primera vez en la escuela, tecnologías de punta como la inteligencia artificial generativa, las aplicaciones web progresivas (PWA), el reconocimiento de voz en tiempo real y la arquitectura serverless en la nube.")

h2("10.2. Proyección a Corto, Mediano y Largo Plazo")
body("AGROEMETA AGI es un proyecto vivo, en permanente evolución. Las próximas etapas de desarrollo planificadas incluyen:")
bullet("Visión Computacional para Diagnóstico de Plagas", "Integración de modelos de inteligencia artificial para análisis de imágenes, que permita al alumno o productor fotografiar una hoja enferma con la cámara de su celular y recibir en segundos el diagnóstico de la plaga o enfermedad, con el plan de control recomendado.")
bullet("Telemetría IoT para la Huerta Escolar", "Conexión de sensores de humedad de suelo, temperatura y luminosidad (mediante módulos Arduino o ESP32 con protocolo LoRa) a la huerta de la escuela, integrando los datos al sistema para recomendaciones de riego automáticas.")
bullet("Generación de Imágenes Educativas", "Incorporación de modelos generadores de imágenes científicas (esquemas de células, ciclos de cultivos, diagramas de motores) para enriquecer las explicaciones pedagógicas con soporte visual de alta calidad.")
bullet("Módulo de Evaluaciones Formativas", "Desarrollo de un sistema de preguntas y respuestas interactivas por tema y año, que permita a los estudiantes autoevaluarse antes de los exámenes y recibir retroalimentación inmediata y personalizada.")

h2("10.3. Reflexión Final")
body("Este proyecto es la demostración de que la soberanía tecnológica no es un privilegio reservado a las grandes ciudades ni a los institutos de investigación. AGROEMETA AGI nació en un paraje rural del departamento San Martín, fue programada por una estudiante de una escuela técnica agropecuaria, y hoy está disponible para cualquier persona en el mundo con un celular y conexión a internet.")
body("La Escuela E.M.E.T.A. N° 3130 no solo forma técnicos para trabajar el campo: forma ciudadanos capaces de pensar, crear e innovar desde el territorio. AGROEMETA AGI es la evidencia viva de esa formación.")

# Cierre formal
doc.add_paragraph("\n")
p_cierre = doc.add_paragraph()
p_cierre.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_c1 = p_cierre.add_run("Autora del Proyecto: ")
r_c1.bold = True; r_c1.font.color.rgb = COLOR_NAVY; r_c1.font.name = 'Calibri'
r_c2 = p_cierre.add_run("Ventura Braiana Arom")
r_c2.font.size = Pt(12); r_c2.bold = True; r_c2.font.color.rgb = COLOR_BLUE; r_c2.font.name = 'Calibri'

p_curso = doc.add_paragraph()
p_curso.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_cc = p_curso.add_run("4° Año – 1ª División – Ciclo Superior | E.M.E.T.A. N° 3130 – Yacuy, Tartagal, Salta")
r_cc.font.size = Pt(10); r_cc.font.color.rgb = COLOR_MUTED; r_cc.font.name = 'Calibri'

p_year = doc.add_paragraph()
p_year.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_yr = p_year.add_run("Ciclo Lectivo 2026")
r_yr.font.size = Pt(10); r_yr.font.color.rgb = COLOR_MUTED; r_yr.font.name = 'Calibri'

output = r"c:\Users\Ghosy\Desktop\AGROEMETA\INFORME_PROYECTO_AGROEMETA.docx"
doc.save(output)
print(f"OK: {output}")
