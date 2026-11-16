# GUÍA DE DESPLIEGUE EN INTERNET DE AGROEMETA AGI
### Escuela E.M.E.T.A. N° 3130 (Tartagal, Salta, Argentina)

Esta guía le permitirá publicar **Agroemeta AGI** en internet de forma **100% gratuita**, con **HTTPS seguro**, dominio público propio y listo para ser usado por miles de estudiantes desde computadoras o celulares.

---

## 🚀 OPCIÓN 1: VERCEL (RECOMENDADA - 1 CLIC Y CERO COSTO)

Vercel ejecuta el frontend ultrarrápido y hospeda automáticamente la función backend segura `/api/chat.js` con Rate Limiting y protección de claves API.

### Pasos:
1. Cree una cuenta gratuita en [Vercel](https://vercel.com) (puede iniciar sesión con GitHub).
2. Suba la carpeta del proyecto a un repositorio de GitHub (o instale la herramienta oficial `npm i -g vercel`).
3. En el panel de Vercel, haga clic en **"Add New Project"** e importe el repositorio.
4. En la sección **"Environment Variables" (Variables de Entorno)**, agregue:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** *(Pegue su clave gratuita de Google AI Studio / Gemini)*
5. Haga clic en **"Deploy"**.
6. En menos de 45 segundos, Vercel le entregará su enlace público seguro, por ejemplo:
   `https://agroemeta-agi.vercel.app`

---

## 🌐 OPCIÓN 2: NETLIFY

1. Cree una cuenta gratuita en [Netlify](https://www.netlify.com).
2. Arrastre y suelte la carpeta de su proyecto en la sección **"Deploy manually"** o conecte su repositorio de GitHub.
3. Vaya a **Site configuration > Environment variables** y defina:
   - `GEMINI_API_KEY`: *(Su clave de Gemini)*
4. Netlify publicará la web con HTTPS y dominio gratuito `https://tu-sitio.netlify.app`.

---

## 📱 CÓMO INSTALAR EN CELULARES (PWA)
1. Abra el enlace de la web publicada desde Google Chrome en Android o Safari en iPhone.
2. **Android:** Toque los tres puntos arriba a la derecha y seleccione **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
3. **iPhone:** Toque el botón de compartir y seleccione **"Agregar a pantalla de inicio"**.
4. ¡Listo! Tendrá a Agroemeta AGI con su icono oficial como si fuera una aplicación nativa descargada de la tienda.

---

## 🔒 ARQUITECTURA DE SEGURIDAD IMPLEMENTADA
- **Cero Exposición:** Su clave de API nunca viaja al navegador de los estudiantes. Se procesa exclusivamente en `/api/chat.js`.
- **Anti-Abuso (Rate Limiting):** Límite estricto de hasta 20 peticiones por minuto por dirección IP.
- **Cabeceras HTTP Seguras:** `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- **Ahorro de Datos:** Cero librerías pesadas, carga instantánea en 3G/4G y funcionamiento offline mediante `sw.js`.
