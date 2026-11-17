"""
AGROEMETA - Servidor Neuronal Local
Asistente AGI de Agronomía, Mecánica Agrícola y Asistencia Inteligente Tipo Jarvis
"""

import os
import sys
import json
import socket
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

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

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/status" or parsed.path == "/api/config":
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
                "institutions": {
                    "emeta": {
                        "name": "Programa y Escuelas E.M.E.T.A.",
                        "full_title": "Expansión y Mejoramiento de la Educación Técnico Agropecuaria",
                        "sedes": [
                            "Escuela Técnica N° 3129 E.M.E.T.A. (Metán Viejo, Salta)",
                            "Escuela Técnica N° 3130 E.M.E.T.A. II (Yacuy, Salta)",
                            "E.P.E.A. N° 2 (Plottier, Neuquén)"
                        ]
                    }
                },
                "voice_enabled": True
            }
            self.wfile.write(json.dumps(config_data, ensure_ascii=False).encode("utf-8"))
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path in ["/api/query", "/api/agent"]:
            length = int(self.headers.get('content-length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body.decode('utf-8'))
                query = data.get("query", "").strip()
            except Exception:
                query = ""

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            
            # Procesamiento de consultas institucionales o de backend
            q_clean = query.lower()
            response_text = ""
            
            if "emeta" in q_clean or "escuela" in q_clean:
                response_text = (
                    "• Conclusión: Localización e identificación institucional de la Escuela E.M.E.T.A.\n\n"
                    "• Pasos / Solución:\n"
                    "1. La sigla corresponde al programa histórico 'Expansión y Mejoramiento de la Educación Técnico Agropecuaria'.\n"
                    "2. Sede Central Salta: Escuela Técnica N° 3129 'E.M.E.T.A.' (Metán Viejo, Salta, Ruta 9/34 Km 1445) con albergue rural y título de Técnico en Producción Agropecuaria.\n"
                    "3. Sede Yacuy: Escuela Técnica N° 3130 'E.M.E.T.A. II' (Yacuy, General San Martín, Salta).\n"
                    "4. Sede Patagonia: E.P.E.A. N° 2 (Ex-EMETA, Plottier, Neuquén).\n\n"
                    "• Comprobación: Ambas instituciones pertenecen a la modalidad técnica agrotécnica oficial pública de nivel medio.\n\n"
                    "• Preguntas (si faltan datos):\n"
                    "1. ¿Requiere información sobre una sede específica o plan curricular de producción agropecuaria?"
                )
            else:
                response_text = None

            resp = {
                "status": "success",
                "received_query": query,
                "remote_response": response_text
            }
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode("utf-8"))
            return

        self.send_error(404, "Endpoint no encontrado")

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
