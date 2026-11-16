# GUÍA DE DESPLIEGUE EN INTERNET DE AGROEMETA AGI
### Escuela E.M.E.T.A. N° 3130 (Tartagal, Salta, Argentina)

Publicar **Agroemeta AGI** en internet de forma **100% gratuita**, con **HTTPS seguro**, dominio público y listo para que lo usen miles de estudiantes desde computadoras o celulares.

---

## 🔑 CÓMO FUNCIONA LA LLAVE DE GEMINI (sin que nadie la vea)

La llave **NO está en el código** y **no se le pide a ningún usuario**. Vive únicamente en el servidor:

| Capa | Dónde vive la llave | Quién la ve |
|---|---|---|
| Vercel | Variable de entorno `GEMINI_API_KEY` del proyecto | Nadie (solo Vercel) |
| Netlify | Variable de entorno `GEMINI_API_KEY` del sitio | Nadie (solo Netlify) |
| Servidor local | Archivo `.env` (ignorado por git) | Solo tu PC |

El navegador llama a `/api/chat`; el servidor agrega la llave, llama a Google y devuelve **solo la respuesta**. Si la llave falta o se agota la cuota, el servidor responde con un código de respaldo y la web **sigue funcionando** con la base de conocimiento local.

---

## 🚀 OPCIÓN 1: VERCEL (RECOMENDADA - GRATIS)

**Estado actual:** ya publicado en **https://agroemeta.vercel.app**

### Pasos (si querés rehacerlo o cambiar algo):
1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión con GitHub.
2. **Add New Project → Import Git Repository** → elegí `aromventura8-coder/agroemeta`.
3. En la configuración del proyecto:
   - **Root Directory:** `./`
   - **Framework Preset:** `Other`
   - **Build Command:** *(dejar vacío)*
   - **Output Directory:** `.`   ← **importante**, así se sirve el sitio desde la raíz
4. En **Environment Variables** agregá:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** tu llave de Google AI Studio
   - **Environments:** `Production` + `Preview`
5. Clic en **Deploy**. Vercel publica en ~45 segundos.
6. Cada `git push` a `main` redespliega automáticamente.

---

## 🌐 OPCIÓN 2: NETLIFY (gratis, con funciones)

⚠️ **Importante:** las Netlify Functions **solo funcionan con el repositorio conectado a Git** (o con la CLI). El deploy "arrastrar y soltar" **no** publica funciones.

1. Conectá el repositorio `aromventura8-coder/agroemeta` al sitio de Netlify (rama `main`).
2. Netlify lee solo el `netlify.toml` incluido:
   ```toml
   [build]
     publish = "."
     command = "echo no-build-step"
   [functions]
     directory = "netlify/functions"
   ```
3. En **Site configuration → Environment variables** agregá `GEMINI_API_KEY` (Production + Preview + Development).
4. Deploy. La función queda expuesta en `/api/chat`.

Para actualizar **solo el sitio estático** (sin funciones) podés arrastrar `AGROEMETA_WEB_DEPLOY.zip` al panel de Deploys.

---

## 💻 SERVIDOR LOCAL (tu PC)

```powershell
# 1) crear la llave local (no se sube al repositorio)
copy .env.example .env
#    editá .env y pegá GEMINI_API_KEY=tu_llave

# 2) arrancar
python server.py
```

El servidor local (puerto **8085**) tiene los mismos endpoints que la nube:
- `GET  /api/config` → configuración de marca
- `POST /api/chat`  → IA real con Gemini (modelos `flash-lite`, ~2-4 s)
- `POST /api/agent` → mismo motor (compatibilidad con Antigravity)

---

## 📱 CÓMO INSTALAR EN CELULARES (PWA)
1. Abrí el enlace publicado desde Google Chrome en Android o Safari en iPhone.
2. **Android:** menú de tres puntos → **"Instalar aplicación"** o **"Agregar a la pantalla de inicio"**.
3. **iPhone:** botón de compartir → **"Agregar a pantalla de inicio"**.
4. ¡Listo! Tenés Agroemeta AGI con su icono oficial, como una app nativa.

---

## 🔒 ARQUITECTURA DE SEGURIDAD IMPLEMENTADA
- **Cero Exposición:** la llave de API nunca viaja al navegador ni está en el repositorio (verificado con `git grep`).
- **Sin límites de uso:** el asistente nunca se bloquea; si la cuota de Google se agota, cae automáticamente a la base de conocimiento local y **sigue respondiendo**.
- **Modelos con redundancia:** si un modelo falla o no está disponible, se prueba el siguiente (`flash-lite` primero por velocidad).
- **Cabeceras HTTP Seguras:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`.
- **Sanitización de entradas** en el servidor (límite de longitud y neutralización de `<script>`).
- **Ahorro de Datos:** cero librerías pesadas, carga instantánea en 3G/4G y funcionamiento offline mediante `sw.js`.
