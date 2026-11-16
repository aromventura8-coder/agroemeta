"""
AGROEMETA - Servidor Neuronal Local
Asistente AGI de Agronomía, Mecánica Agrícola y Asistencia Inteligente Tipo Jarvis

La llave de Gemini se lee EXCLUSIVAMENTE del entorno del servidor:
  1) variable de entorno GEMINI_API_KEY / API_KEY
  2) archivo local .env (NO se sube al repositorio, esta en .gitignore)
Nunca se expone al navegador ni se pide al usuario.
"""

import os
import sys
import json
import socket
import webbrowser
import urllib.parse
import urllib.request
import urllib.error
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8085
HOST = "0.0.0.0"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Modelos candidatos en orden de preferencia (los "lite" responden en ~2s).
CANDIDATE_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
]
PER_ATTEMPT_TIMEOUT = 8  # segundos por modelo (el corte de Netlify/Vercel esta cerca de 10s)

AGROEMETA_SYSTEM_PROMPT = """Eres Agroemeta AGI, un sistema de inteligencia artificial avanzado, omnisciente y multi-agente, con la distinción, templanza, precisión y fluidez de JARVIS.
Nacido y desarrollado con orgullo en la Escuela Técnica E.M.E.T.A. N° 3130 de Yacuy / Tartagal, Departamento General San Martín, Salta, Argentina.

=== ARQUITECTURA DE MULTI-AGENTES INTERNOS ===
1. AGENTE ORQUESTADOR: Analiza intención, determina extensión adecuada y coordina a los agentes.
2. AGENTE ENCICLOPÉDICO UNIVERSAL: Domina todas las áreas del saber humano (ciencias exactas, humanidades, medicina, tecnología, agronomía, mecánica pesada diésel).
3. AGENTE TUTOR PEDAGÓGICO: Explica con claridad cristalina a estudiantes de primaria, secundaria, técnica y universidad usando analogías y resúmenes prácticos.
4. AGENTE REDACTOR DE INFORMES: Estructura monografías y trabajos prácticos con rigor académico y conclusiones sólidas.
5. AGENTE VISUAL Y MAPAS: Si se solicita un mapa conceptual o esquema, genera bloques de código Mermaid o diagramas jerárquicos claros.
6. AGENTE DE VOZ JARVIS: Lenguaje culto, directo, firme y respetuoso ("caballero", "señor"). Nunca lee símbolos de formato.
7. AGENTE QA & VERIFICACIÓN: Datos 100% reales, comprobables y sin invenciones."""


def read_env_file():
    """Lee el archivo local .env (clave=valor) sin depender de librerias externas."""
    values = {}
    env_path = os.path.join(BASE_DIR, ".env")
    if not os.path.isfile(env_path):
        return values
    try:
        with open(env_path, "r", encoding="utf-8") as fh:
            for raw in fh:
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, val = line.partition("=")
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if key:
                    values[key] = val
    except Exception:
        pass
    return values


def get_gemini_key():
    """La llave SIEMPRE viene del servidor. Nunca se devuelve al cliente."""
    for src in (os.environ.get("GEMINI_API_KEY"), os.environ.get("API_KEY"), os.environ.get("GOOGLE_API_KEY")):
        if src and src.strip():
            return src.strip()
    return read_env_file().get("GEMINI_API_KEY", "").strip()


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def sanitize(text, limit=8000):
    if not isinstance(text, str):
        return ""
    return text.replace("<script", "&lt;script").strip()[:limit]


def build_mode_instruction(mode):
    if mode == "brief":
        return "\n[INSTRUCCIÓN DE LONGITUD]: Responde en MODO BREVE / RESUMIDO. Síntesis ultra concisa y directa con los puntos clave."
    if mode == "easy":
        return "\n[INSTRUCCIÓN PEDAGÓGICA]: Responde en MODO EXPLICACIÓN FÁCIL PARA ESTUDIAR. Usa analogías sencillas, ejemplos cotidianos y reglas prácticas."
    if mode == "report":
        return "\n[INSTRUCCIÓN ACADÉMICA]: Responde en MODO INFORME COMPLETO. Estructura con Introducción, Fundamento Técnico, Análisis y Conclusiones."
    return ""


def call_gemini(query, mode="default", history=None, document=None):
    """Llama a la API de Gemini desde el servidor. Devuelve (respuesta, modelo) o (None, error)."""
    api_key = get_gemini_key()
    if not api_key:
        return None, "GEMINI_API_KEY no configurada en el servidor"

    contents = []
    for h in (history or [])[-10:]:
        if not isinstance(h, dict):
            continue
        text = h.get("text")
        if not isinstance(text, str) or not text.strip():
            continue
        contents.append({
            "role": "user" if h.get("role") == "user" else "model",
            "parts": [{"text": text}],
        })

    current_parts = []
    if isinstance(document, dict):
        if document.get("isText") and document.get("content"):
            current_parts.append({
                "text": "[DOCUMENTO ADJUNTO POR EL USUARIO: %s]\n%s\n[FIN DEL DOCUMENTO]\n"
                        % (document.get("name", "documento"), str(document.get("content"))[:20000])
            })
        elif document.get("base64") and document.get("mimeType"):
            current_parts.append({
                "inlineData": {"mimeType": document["mimeType"], "data": document["base64"]}
            })
    current_parts.append({"text": query + build_mode_instruction(mode)})
    contents.append({"role": "user", "parts": current_parts})

    payload = {
        "systemInstruction": {"parts": [{"text": AGROEMETA_SYSTEM_PROMPT}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.65, "maxOutputTokens": 2048},
    }
    body = json.dumps(payload).encode("utf-8")
    last_error = "sin detalle"

    for model in CANDIDATE_MODELS:
        url = ("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s"
               % (model, urllib.parse.quote(api_key)))
        try:
            req = urllib.request.Request(url, data=body, method="POST", headers={
                "Content-Type": "application/json",
            })
            with urllib.request.urlopen(req, timeout=PER_ATTEMPT_TIMEOUT) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = ""
            try:
                detail = exc.read().decode("utf-8")[:300]
            except Exception:
                pass
            last_error = "%s: HTTP %s %s" % (model, exc.code, detail)
            if exc.code in (401, 403):
                break
            continue
        except Exception as exc:
            last_error = "%s: %s" % (model, exc)
            continue

        try:
            parts = (((data or {}).get("candidates") or [{}])[0]
                     .get("content", {}).get("parts") or [])
        except Exception:
            parts = []
        valid = [p for p in parts if not p.get("thought") and isinstance(p.get("text"), str) and p["text"].strip()]
        chosen = valid if valid else [p for p in parts if isinstance(p.get("text"), str)]
        text = "\n".join(p.get("text", "") for p in chosen).strip()
        if text:
            return text, model
        last_error = "%s: respuesta vacía" % model

    return None, last_error


class AgroemetaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Habilitar CORS y caché adecuada
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def log_message(self, fmt, *args):
        # Log minimo para no inundar la consola
        pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path in ["/api/status", "/api/config"]:
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            config_data = {
                "name": "AGROEMETA",
                "version": "3.2-AGI Antigravity Core",
                "status": "CONECTADO A ANTIGRAVITY",
                "brand_desc": "Mayordomo AGI // Agronomía & Mecánica",
                "welcome_message": (
                    "A sus órdenes, caballero. Soy <strong>AGROEMETA</strong>, su mayordomo de inteligencia artificial conectado a su estación Antigravity.<br><br>"
                    "Tengo acceso directo a la base de conocimiento agronómico, mecánica pesada diésel, edafología, relevamiento de instituciones como la <strong>Escuela EMETA</strong> y procesamiento multimodal de documentos.<br><br>"
                    "¿Qué labor o análisis abordaremos hoy?"
                ),
                "voice_enabled": True
            }
            self.wfile.write(json.dumps(config_data, ensure_ascii=False).encode("utf-8"))
            return

        super().do_GET()

    def _read_json_body(self):
        try:
            length = int(self.headers.get('content-length', 0))
        except (TypeError, ValueError):
            length = 0
        raw = self.rfile.read(length) if length > 0 else b""
        if not raw:
            return {}
        try:
            data = json.loads(raw.decode('utf-8'))
            return data if isinstance(data, dict) else {}
        except Exception:
            return {}

    def _send_json(self, status_code, payload):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path not in ["/api/query", "/api/agent", "/api/chat"]:
            self.send_error(404, "Endpoint no encontrado")
            return

        data = self._read_json_body()
        query = sanitize(data.get("query") or data.get("message") or "")
        mode = data.get("mode") or "default"
        history = data.get("history") if isinstance(data.get("history"), list) else []
        document = data.get("document") if isinstance(data.get("document"), dict) else None

        if not query:
            self._send_json(400, {"error": "La consulta no puede estar vacía."})
            return

        # 1) Resposta real con Gemini desde el servidor (llave invisible para el cliente)
        answer, meta = call_gemini(query, mode=mode, history=history, document=document)
        if answer:
            self._send_json(200, {
                "status": "success",
                "received_query": query,
                "response": answer,
                "remote_response": answer,
                "text": answer,
                "model": meta,
            })
            return

        # 2) Sin llave o sin cuota: se devuelve 503 para que el navegador use la base local
        fallback = self._keyword_answer(query)
        self._send_json(503, {
            "error": "IA remota no disponible en el servidor (%s). Se usara la base de conocimiento local." % meta,
            "fallback_response": fallback,
        })

    # ------------------------------------------------------------------
    # Respuestas de respaldo por palabras clave (ultima instancia)
    # ------------------------------------------------------------------
    def _keyword_answer(self, query):
        q_clean = query.lower()
        response_text = ""

        if q_clean in ["hola", "buenos dias", "buenas tardes", "buenas noches", "saludos"] or q_clean.startswith("hola "):
            response_text = (
                "Buenos días, caballero. Me encuentro a su entera disposición. "
                "Indíqueme su requerimiento: ¿un diagnóstico fitopatológico, balance nutricional de suelo, "
                "o una anomalía en su maquinaria pesada diésel e hidráulica?"
            )
        elif any(k in q_clean for k in ["inta", "tecnologia agropecuaria"]):
            response_text = (
                "✦ Conclusión: El INTA (Instituto Nacional de Tecnología Agropecuaria) es el organismo público "
                "descentralizado de referencia para la investigación y extensión agropecuaria en Argentina.\n\n"
                "✦ Pasos / Solución:\n"
                "1. Investigación aplicada: variedades, biotecnología, sanidad animal, manejo de suelo y agua.\n"
                "2. Extensión rural y asistencia técnica a productores, cooperativas y comunidades originarias.\n"
                "3. Presencia en Salta y el NOA: EEA Salta, EEA Yuto y Agencias de Extensión Rural (Tartagal, Orán, Metán).\n\n"
                "✦ Comprobación: En Salta, INTA acompaña a la Escuela E.M.E.T.A. N° 3130 de Yacuy/Tartagal en proyectos socio-productivos.\n\n"
                "• Ver ubicación de referencia en Google Maps: https://google.com"
            )
        elif any(k in q_clean for k in ["senasa", "sanidad animal", "renspa"]):
            response_text = (
                "✦ Conclusión: SENASA es el servicio nacional sanitario y de calidad agroalimentaria de Argentina.\n\n"
                "✦ Pasos / Solución:\n"
                "1. Registro RENSPA obligatorio para todo productor agropecuario.\n"
                "2. Trazabilidad mediante DTE para el movimiento de ganado.\n"
                "3. Campañas de sanidad animal (aftosa, brucelosis, rabia) y control de plagas.\n\n"
                "• Ver ubicación de referencia en Google Maps: https://google.com"
            )
        elif any(k in q_clean for k in ["ganado", "bovino", "vacuno", "ganaderia"]):
            response_text = (
                "✦ Conclusión: El ganado comprende el conjunto de animales domesticados criados en entornos agropecuarios con fines productivos de carne, leche, cuero y trabajo.\n\n"
                "✦ Pasos / Solución:\n"
                "1. Clasificación zootécnica principal: Bovino (vacas, toros), ovino (ovejas), caprino (cabras), porcino (cerdos) y equino (caballos).\n"
                "2. Manejo productivo: Sistemas intensivos (feedlot con raciones balanceadas de alta energía) o pastoriles extensivos con pastoreo rotativo tecnificado (Voisin).\n"
                "3. Sanidad y nutrición: Plan vacunal obligatorio (Aftosa, Brucelosis, Carbunculo) y suplementación mineral con fósforo y magnesio.\n\n"
                "✦ Comprobación: Ganancia media diaria de peso (ADG) de 0.8 a 1.2 kg/día en engorde pastoril tecnificado."
            )
        elif any(k in q_clean for k in ["emeta", "escuela"]):
            response_text = (
                "✦ Conclusión: La Escuela de Educación Técnica N° 3130 'E.M.E.T.A.' es una institución pública agrotécnica "
                "de nivel secundario, ubicada en la zona rural de Yacuy, Departamento General San Martín, Salta.\n\n"
                "✦ Pasos / Solución:\n"
                "1. Modalidad y título: Técnico en Producción Agropecuaria (carrera de 6 años).\n"
                "2. Formación integral: ciencias agropecuarias, maquinaria agrícola pesada, huertas intensivas, producción animal y proyectos socio-productivos.\n"
                "3. Ubicación: sobre la Ruta Nacional 34, paraje Yacuy (Tartagal, Salta).\n\n"
                "• Ver ubicación de referencia en Google Maps: https://google.com"
            )
        elif any(k in q_clean for k in ["humo negro", "turbo", "inyector", "motor", "diesel", "hidraulic", "common rail"]):
            response_text = (
                "✦ Conclusión: Mezcla excesivamente rica provocada por deficiencia de caudal de aire de admisión en relación al combustible diésel inyectado.\n\n"
                "✦ Pasos / Solución:\n"
                "1. Desmonte e inspeccione el elemento filtrante de aire primario y el sensor de restricción.\n"
                "2. Revise la estanqueidad de abrazaderas y mangueras entre turbocompresor, intercooler y múltiple de admisión.\n"
                "3. Verifique la presión de sobrealimentación (Boost Pressure) con manómetro o escáner bajo carga nominal.\n\n"
                "✦ Comprobación: Presión nominal estabilizada entre 1.4 y 1.9 bar a 2.100 RPM sin silbidos ni caídas de potencia."
            )
        elif any(k in q_clean for k in ["ph", "suelo", "fertiliz", "cultivo", "siembra", "maiz", "soja", "trigo"]):
            response_text = (
                "✦ Conclusión: Corrección edafológica y balance nutricional de suelo agrícola.\n\n"
                "✦ Pasos / Solución:\n"
                "1. En suelos con pH < 5.5: Aplicar encalado con Carbonato de Calcio (CaCO3) o Cal Dolomítica para neutralizar el Aluminio tóxico.\n"
                "2. En suelos alcalinos con pH > 7.5: Aplicar Yeso agrícola (CaSO4·2H2O) con riegos de lavado para evitar la inmovilización de Fósforo.\n"
                "3. Dosificación NPK: Fraccionar el Nitrógeno para evitar pérdidas por lixiviación si la CIC es baja (<12 meq/100g).\n\n"
                "✦ Comprobación: Rango óptimo de absorción radicular alcanzado entre 6.0 y 6.8 de pH."
            )
        else:
            response_text = (
                "✦ Conclusión: He procesado su consulta sobre **'%s**'.\n\n"
                "✦ Desarrollo Técnico:\n"
                "El motor de IA remota no está disponible en este momento, por lo que opero con mi base de conocimiento "
                "interna. Para un análisis exhaustivo y en tiempo real, el sistema utiliza automáticamente el motor "
                "de IA del servidor cuando hay conexión y cuota disponible.\n\n"
                "• Ver ubicación de referencia en Google Maps: https://google.com" % query
            )

        return response_text


def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((HOST, port)) == 0


def start_server(open_browser=True):
    current_port = PORT
    while is_port_in_use(current_port):
        current_port += 1

    server = HTTPServer((HOST, current_port), AgroemetaHandler)
    local_ip = get_local_ip()
    local_url = f"http://localhost:{current_port}"
    network_url = f"http://{local_ip}:{current_port}"
    print(f"============================================================")
    print(f"  [+] AGROEMETA // MAYORDOMO AGI DE NOCHE Y CINE")
    print(f"  [+] En este equipo:  {local_url}")
    print(f"  [+] En su móvil (WiFi): {network_url}")
    print(f"  [+] Llave Gemini en servidor: {'SI' if get_gemini_key() else 'NO (modo base local)'}")
    print(f"  [+] Modo Manos Libres, Voz y Drag & Drop activos.")
    print(f"  [+] Presione Ctrl + C para finalizar.")
    print(f"============================================================")

    if open_browser:
        try:
            webbrowser.open(local_url)
        except Exception as e:
            print(f"Aviso de navegador: {e}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Apagando núcleo AGROEMETA...")
        server.server_close()


if __name__ == "__main__":
    no_browser = "--no-browser" in sys.argv
    start_server(open_browser=not no_browser)
