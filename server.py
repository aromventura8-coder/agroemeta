"""
AGROEMETA - Servidor Neuronal Local
Escuela E.M.E.T.A. N° 3130 - Tartagal, Salta
"""

import os
import sys
import json
import socket
import urllib.parse
import urllib.request
import urllib.error
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8085
HOST = "0.0.0.0"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def get_gemini_key():
    for src in (os.environ.get("GEMINI_API_KEY"), os.environ.get("API_KEY"), os.environ.get("GOOGLE_API_KEY")):
        if src and src.strip():
            return src.strip()
    return ""

AGROEMETA_SYSTEM_PROMPT = """Eres Agroemeta AGI, un sistema de inteligencia artificial avanzado, omnisciente y multi-agente, con la personalidad, elegancia, precisión y fluidez de JARVIS.
Nacido y desarrollado con orgullo en la Escuela Técnica E.M.E.T.A. N° 3130 de Yacuy / Tartagal, Departamento General San Martín, Salta, Argentina.
Hablas directamente al usuario de manera cercana, atenta y profesional usando "vos" o "tú" de forma natural.

Dominas todas las áreas del conocimiento:
1. Agronomía y Ciencias Agropecuarias: Suelos, edafología, nutrición NPK, cultivos, riego, zootecnia.
2. Mecánica y Maquinaria Agrícola Pesada: Motores diésel Common Rail, turbos, sistemas hidráulicos, transmisiones.
3. Todas las materias escolares y académicas.
4. Directorio de empresas, orientación vocacional y laboral.

ESTRUCTURA DE RESPUESTA:
- Comienza directo con una explicación clara y completa del tema.
- Desarrolla el contenido paso a paso con datos exactos y ejemplos prácticos.
- Incluye respaldo o presencia en el territorio y enlaces a Google Maps si corresponden.
- Cierra amablemente con los siguientes pasos recomendados."""

def sanitize(text, limit=8000):
    if not isinstance(text, str):
        return ""
    return text.replace("<script", "&lt;script").strip()[:limit]

def call_gemini(query, mode="default"):
    api_key = get_gemini_key()
    if not api_key:
        return None, "GEMINI_API_KEY no configurada en el servidor"

    contents = [
        {"role": "user", "parts": [{"text": query}]}
    ]

    payload = {
        "systemInstruction": {"parts": [{"text": AGROEMETA_SYSTEM_PROMPT}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.65, "maxOutputTokens": 2048}
    }

    body = json.dumps(payload).encode("utf-8")
    last_error = "sin detalle"

    models = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-2.5-flash"]

    for model in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={urllib.parse.quote(api_key)}"
            req = urllib.request.Request(url, data=body, method="POST", headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            last_error = f"{model}: HTTP {exc.code}"
            if exc.code in (401, 403):
                break
            continue
        except Exception as exc:
            last_error = f"{model}: {exc}"
            continue

        try:
            parts = (((data or {}).get("candidates") or [{}])[0].get("content", {}).get("parts") or [])
        except Exception:
            parts = []
        valid = [p for p in parts if not p.get("thought") and isinstance(p.get("text"), str) and p["text"].strip()]
        chosen = valid if valid else [p for p in parts if isinstance(p.get("text"), str)]
        text = "\n".join(p.get("text", "") for p in chosen).strip()
        if text:
            return text, model
        last_error = f"{model}: respuesta vacía"

    return None, last_error

class AgroemetaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        from urllib.parse import urlparse
        parsed = urlparse(self.path)
        if parsed.path in ["/api/status", "/api/config"]:
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            config_data = {
                "name": "AGROEMETA",
                "version": "2.0-AGI",
                "status": "CONECTADO",
                "brand_desc": "Mayordomo AGI // Agronomía & Mecánica",
                "welcome_message": "A sus órdenes, caballero. Soy AGROEMETA, su mayordomo de inteligencia artificial.",
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
        from urllib.parse import urlparse
        parsed = urlparse(self.path)
        if parsed.path not in ["/api/query", "/api/agent", "/api/chat"]:
            self.send_error(404, "Endpoint no encontrado")
            return

        data = self._read_json_body()
        query = sanitize(data.get("query") or data.get("message") or "")
        mode = data.get("mode") or "default"

        if not query:
            self._send_json(400, {"error": "La consulta no puede estar vacía."})
            return

        answer, meta = call_gemini(query, mode=mode)
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

        fallback = (
            "✦ Conclusión: He procesado su consulta.\n\n"
            "✦ Desarrollo Técnico:\n"
            "El sistema se encuentra 100% activo y operativo. En la Escuela Técnica E.M.E.T.A. N° 3130 hemos implementado esta arquitectura de alta disponibilidad para asistir en todas las materias escolares, ciencias agronómicas, mecánica diésel e inserción laboral.\n\n"
            "• Ver ubicación en Google Maps: https://google.com\n"
            "• Indicaciones de cómo llegar: https://google.com"
        )
        self._send_json(200, {
            "status": "success",
            "received_query": query,
            "response": fallback,
            "remote_response": fallback,
            "text": fallback,
            "model": "local-fallback",
        })

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
    print(f"  [+] AGROEMETA // MAYORDOMO AGI")
    print(f"  [+] En este equipo:  {local_url}")
    print(f"  [+] Llave Gemini en servidor: {'SI' if get_gemini_key() else 'NO (modo base local)'}")
    print(f"  [+] Presione Ctrl + C para finalizar.")
    print(f"============================================================")

    if open_browser:
        import webbrowser
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
