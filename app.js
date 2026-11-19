/**
 * AGROEMETA - Interfaz de Mayordomo Inteligente
 * Arquitectura AGI con Conciencia Temporal, Respaldo Automático,
 * Persistencia en LocalStorage y Resiliencia Total.
 */

(function() {
  const runApp = () => {
    const ANTIGRAVITY_BACKEND_URL = (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin !== "null" && !window.location.origin.startsWith("file:"))
      ? window.location.origin
      : "http://127.0.0.1:8085";

    const STORAGE_CHAT_KEY = "agroemeta_chat_history_v2";

    // Elementos DOM
    const chatFeed = document.getElementById("chatFeed");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const micToggleBtn = document.getElementById("micToggleBtn");
    const voiceMuteBtn = document.getElementById("voiceMuteBtn");
    const voicePauseBtn = document.getElementById("voicePauseBtn");
    const voiceResumeBtn = document.getElementById("voiceResumeBtn");
    const voiceStopBtn = document.getElementById("voiceStopBtn");
    const voiceSpeedSelect = document.getElementById("voiceSpeedSelect");
    const voiceStatusEl = document.getElementById("voiceStatus");
    const btnBackup = document.getElementById("btnBackup");
    const btnClearChat = document.getElementById("btnClearChat");
    const genImgBtn = document.getElementById("genImgBtn");
    const createDocBtn = document.getElementById("createDocBtn");
    const improveTextBtn = document.getElementById("improveTextBtn");
    const imgGenPanel = document.getElementById("imgGenPanel");
    const docTaskPanel = document.getElementById("docTaskPanel");
    const improveTextPanel = document.getElementById("improveTextPanel");
    const imageGallery = document.getElementById("imageGallery");
    const subtitlesPanel = document.getElementById("subtitlesPanel");
    const toastNotification = document.getElementById("toastNotification");
    const imgPromptInput = document.getElementById("imgPromptInput");
    const btnGenerateImg = document.getElementById("btnGenerateImg");
    const docTaskInput = document.getElementById("docTaskInput");
    const btnSelectDocFile = document.getElementById("btnSelectDocFile");
    const docTaskFileInput = document.getElementById("docTaskFileInput");
    const btnCreateDocTask = document.getElementById("btnCreateDocTask");
    const improveTextInput = document.getElementById("improveTextInput");
    const btnImproveText = document.getElementById("btnImproveText");
    const livingCore = document.querySelector(".living-core-container");
    const orbStateText = document.getElementById("orbStateText");
    const thinkingIndicator = document.getElementById("thinkingIndicator");

    // Estado
    let isVoiceMuted = false;
    let generatedImages = [];
    let currentDocTask = null;

    // ---------- TAREA 2: CONCIENCIA TEMPORAL EN TIEMPO REAL ----------
    function getArgentinaDateTime() {
      const now = new Date();
      const dateOpts = { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const timeOpts = { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return {
        fecha: now.toLocaleDateString('es-AR', dateOpts),
        hora: now.toLocaleTimeString('es-AR', timeOpts),
        timestamp: now.toISOString()
      };
    }

    // ---------- Utilidades ----------
    function showToast(message) {
      if (!toastNotification) return;
      toastNotification.textContent = message;
      toastNotification.classList.add('visible');
      setTimeout(() => toastNotification.classList.remove('visible'), 3200);
    }

    // ---------- TAREA 3: PERSISTENCIA EN LOCALSTORAGE ----------
    function saveMessageToStorage(sender, text, type) {
      try {
        let history = JSON.parse(localStorage.getItem(STORAGE_CHAT_KEY) || "[]");
        history.push({
          sender,
          text,
          type,
          time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        });
        // Conservar hasta 60 mensajes para mantener rendimiento
        if (history.length > 60) history = history.slice(-60);
        localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(history));
      } catch (_) {}
    }

    function loadHistoryFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_CHAT_KEY);
        if (!raw) return;
        const history = JSON.parse(raw);
        if (!Array.isArray(history) || history.length === 0) return;

        // Renderizar mensajes previos respetando el indicador y bienvenida
        history.forEach(item => {
          appendMessage(item.sender, item.text, item.type, false);
        });
      } catch (_) {}
    }

    function clearChatHistory() {
      localStorage.removeItem(STORAGE_CHAT_KEY);
      // Mantener solo el thinkingIndicator y la bienvenida
      const bubbles = chatFeed.querySelectorAll('.bubble-row:not(#welcomeBubble)');
      bubbles.forEach(b => b.remove());
      showToast("Historial de conversación reiniciado");
    }

    // ---------- TAREA 1: BOTÓN DE RESPALDO (ZIP DESCARGABLE) ----------
    async function triggerBackupDownload() {
      showToast("Preparando copia de seguridad...");
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
      const zipFilename = `AGROEMETA_BACKUP_${timestamp}.zip`;

      // 1. Si estamos conectados a un servidor local, llamar al endpoint de respaldo en disco
      try {
        fetch(`${ANTIGRAVITY_BACKEND_URL}/api/backup`, { method: "POST" }).catch(() => {});
      } catch (_) {}

      // 2. Generar el archivo ZIP descargable para el usuario
      if (typeof JSZip !== "undefined") {
        try {
          const zip = new JSZip();
          const filesToBackup = [
            "index.html", "app.js", "audio.js", "agro_knowledge.js",
            "style.css", "server.py", "package.json", "manifest.json",
            "sw.js", "vercel.json", "netlify.toml", "README.md"
          ];

          await Promise.all(filesToBackup.map(async (filename) => {
            try {
              const res = await fetch(filename);
              if (res.ok) {
                const text = await res.text();
                zip.file(filename, text);
              }
            } catch (_) {}
          }));

          const blob = await zip.generateAsync({ type: "blob" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = zipFilename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast("💾 Respaldo descargado con éxito");
          return;
        } catch (err) {
          console.warn("Fallo al crear ZIP con JSZip:", err);
        }
      }

      // Fallback si JSZip no está disponible: descargar snapshot JSON del estado
      const snapshot = {
        app: "AGROEMETA",
        fecha: getArgentinaDateTime(),
        chatHistory: JSON.parse(localStorage.getItem(STORAGE_CHAT_KEY) || "[]")
      };
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `AGROEMETA_DATOS_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("💾 Respaldo de datos descargado");
    }

    if (btnBackup) btnBackup.addEventListener("click", triggerBackupDownload);
    if (btnClearChat) btnClearChat.addEventListener("click", clearChatHistory);

    // ---------- Galería de imágenes ----------
    function renderImageGallery() {
      if (!imageGallery) return;
      imageGallery.innerHTML = generatedImages.map((img) => `
        <div class="image-card">
          <img src="${img.url}" alt="${img.prompt}" loading="lazy">
          <div class="image-card-overlay">
            <button class="btn-img-download" title="Descargar" onclick="downloadImage('${img.url}', '${img.prompt}')">⬇️</button>
            <button class="btn-img-regenerate" title="Regenerar" onclick="regenerateImage('${img.prompt}')">🔄</button>
          </div>
        </div>
      `).join('');
      imageGallery.style.display = generatedImages.length > 0 ? 'grid' : 'none';
    }

    window.downloadImage = function(url, prompt) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(prompt || 'imagen').replace(/[^a-z0-9]/gi, '_').substring(0, 30)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Imagen descargada");
    };

    window.regenerateImage = function(prompt) {
      if (imgPromptInput) imgPromptInput.value = prompt;
      if (imgGenPanel) imgGenPanel.style.display = 'block';
      if (imgPromptInput) imgPromptInput.focus();
      if (btnGenerateImg) btnGenerateImg.click();
    };

    function appendImageInChat(url, prompt) {
      const row = document.createElement("div");
      row.className = "bubble-row bubble-agroemeta";
      row.innerHTML = `
        <div class="avatar-tag">AGROEMETA</div>
        <div class="bubble-content">
          <div class="msg-img"><img src="${url}" alt="${prompt}"></div>
          <div class="msg-download"><button class="btn-img-download" onclick="downloadImage('${url}', '${prompt}')" title="Descargar imagen">⬇️ Descargar</button></div>
        </div>
      `;
      chatFeed.appendChild(row);
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    function appendDocumentInChat(url, name, text) {
      const row = document.createElement("div");
      row.className = "bubble-row bubble-agroemeta";
      row.innerHTML = `
        <div class="avatar-tag">AGROEMETA</div>
        <div class="bubble-content">
          <div class="doc-task-area">
            <div class="doc-task-header"><span class="doc-task-title">📄 ${name}</span></div>
            <div class="doc-task-content">${text}</div>
            <button class="btn-doc-download" onclick="downloadImage('${url}', '${name || 'documento'}')" title="Descargar documento">⬇️ Descargar</button>
          </div>
        </div>
      `;
      chatFeed.appendChild(row);
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    // ---------- Subtítulos ----------
    if (window.agroAudio) {
      window.agroAudio.showSubtitles = function(text, status) {
        const tEl = document.getElementById('subtitleText');
        const sEl = document.getElementById('subtitleStatus');
        const p = document.getElementById('subtitlesPanel');
        if (tEl) tEl.textContent = text;
        if (p) p.classList.add('visible');
        if (sEl) sEl.textContent = status || 'Hablando';
      };
      window.agroAudio.hideSubtitles = function() {
        const p = document.getElementById('subtitlesPanel');
        if (p) p.classList.remove('visible');
      };
    }

    // ---------- Eventos de voz ----------
    if (voicePauseBtn) voicePauseBtn.addEventListener("click", () => {
      window.agroAudio.pauseSpeaking();
      if (voiceStatusEl) { voiceStatusEl.textContent = "Pausado"; voiceStatusEl.style.color = "#f59e0b"; }
    });
    if (voiceResumeBtn) voiceResumeBtn.addEventListener("click", () => {
      window.agroAudio.resumeSpeaking();
      if (voiceStatusEl) { voiceStatusEl.textContent = "Hablando"; voiceStatusEl.style.color = "#38bdf8"; }
    });
    if (voiceStopBtn) voiceStopBtn.addEventListener("click", () => {
      window.agroAudio.stopSpeaking();
      if (voiceStatusEl) { voiceStatusEl.textContent = "Detenido"; voiceStatusEl.style.color = "#ef4444"; }
    });
    if (voiceSpeedSelect) voiceSpeedSelect.addEventListener("change", (e) => {
      window.agroAudio.setVoiceRate(e.target.value);
      if (voiceStatusEl) {
        voiceStatusEl.textContent = `Velocidad: ${e.target.value}x`;
        setTimeout(() => { voiceStatusEl.textContent = "Listo"; voiceStatusEl.style.color = ""; }, 1500);
      }
    });

    // ── Selector de voz JARVIS ──────────────────────────────────────────────
    const voiceSelector = document.getElementById("voiceSelector");
    function populateVoiceSelector() {
      if (!voiceSelector) return;
      const voices = window.agroAudio.getAvailableVoices
        ? window.agroAudio.getAvailableVoices()
        : (window.speechSynthesis ? window.speechSynthesis.getVoices().filter(v => v.lang.startsWith("es")) : []);
      if (voices.length === 0) return;
      voiceSelector.innerHTML = voices.map(v =>
        `<option value="${v.name}"${window.agroAudio.selectedVoice?.name === v.name ? " selected" : ""}>${v.name} (${v.lang})</option>`
      ).join("");
    }
    populateVoiceSelector();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => populateVoiceSelector();
    }
    setTimeout(populateVoiceSelector, 800);
    setTimeout(populateVoiceSelector, 2000);

    if (voiceSelector) voiceSelector.addEventListener("change", (e) => {
      if (window.agroAudio.setVoiceByName) window.agroAudio.setVoiceByName(e.target.value);
      showToast(`Voz seleccionada: ${e.target.value}`);
    });

    // ---------- Generar imagen ----------
    if (genImgBtn) genImgBtn.addEventListener("click", () => {
      const isVisible = imgGenPanel.style.display !== "none";
      imgGenPanel.style.display = isVisible ? "none" : "block";
      if (!isVisible && imgPromptInput) imgPromptInput.focus();
    });

    if (btnGenerateImg) btnGenerateImg.addEventListener("click", async () => {
      const prompt = imgPromptInput ? imgPromptInput.value.trim() : "";
      if (!prompt) { showToast("Ingresá una descripción para la imagen"); return; }
      btnGenerateImg.textContent = "Generando...";
      btnGenerateImg.disabled = true;
      try {
        const response = await fetch(`${ANTIGRAVITY_BACKEND_URL}/api/generate-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, mode: "default" })
        });
        const data = await response.json();
        if (response.ok && data.imageUrl) {
          const imgEntry = { url: data.imageUrl, prompt, timestamp: new Date().toISOString() };
          generatedImages.unshift(imgEntry);
          renderImageGallery();
          appendImageInChat(data.imageUrl, prompt);
          showToast("Imagen generada exitosamente");
          if (imgPromptInput) imgPromptInput.value = "";
        } else {
          const fallbackUrl = `https://placehold.co/600x400?text=${encodeURIComponent(prompt)}`;
          generatedImages.unshift({ url: fallbackUrl, prompt, timestamp: new Date().toISOString() });
          renderImageGallery();
          appendImageInChat(fallbackUrl, prompt);
          showToast("Imagen generada (vista previa)");
        }
      } catch (e) {
        const fallbackUrl = `https://placehold.co/600x400?text=${encodeURIComponent(prompt)}`;
        generatedImages.unshift({ url: fallbackUrl, prompt, timestamp: new Date().toISOString() });
        renderImageGallery();
        appendImageInChat(fallbackUrl, prompt);
        showToast("Imagen generada (vista previa)");
      } finally {
        btnGenerateImg.textContent = "Generar Imagen";
        btnGenerateImg.disabled = false;
      }
    });

    // ---------- Crear documento ----------
    if (createDocBtn) createDocBtn.addEventListener("click", () => {
      const isVisible = docTaskPanel.style.display !== "none";
      docTaskPanel.style.display = isVisible ? "none" : "block";
      if (!isVisible && docTaskInput) docTaskInput.focus();
    });

    if (btnSelectDocFile) btnSelectDocFile.addEventListener("click", () => {
      if (docTaskFileInput) docTaskFileInput.click();
    });

    if (docTaskFileInput) docTaskFileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          currentDocTask = {
            name: file.name,
            type: file.type,
            base64: event.target.result.split(",")[1],
            description: docTaskInput ? docTaskInput.value.trim() : ""
          };
          showToast(`Archivo seleccionado: ${file.name}`);
        };
        reader.readAsDataURL(file);
      }
    });

    if (btnCreateDocTask) btnCreateDocTask.addEventListener("click", async () => {
      const description = docTaskInput ? docTaskInput.value.trim() : "";
      if (!description && !currentDocTask) {
        showToast("Ingresá una descripción o seleccioná un archivo");
        return;
      }
      btnCreateDocTask.textContent = "Creando...";
      btnCreateDocTask.disabled = true;
      try {
        const response = await fetch(`${ANTIGRAVITY_BACKEND_URL}/api/create-document`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description, file: currentDocTask, mode: "default" })
        });
        const data = await response.json();
        if (response.ok && data.documentUrl) {
          appendMessage("AGROEMETA", `Documento creado: "${description}"`, "agroemeta");
          appendDocumentInChat(data.documentUrl, description, data.fileName || "documento.pdf");
          showToast("Documento creado exitosamente");
          if (docTaskInput) docTaskInput.value = "";
          currentDocTask = null;
          if (docTaskFileInput) docTaskFileInput.value = "";
          if (docTaskPanel) docTaskPanel.style.display = "none";
        } else {
          throw new Error("sin url");
        }
      } catch (e) {
        const docContent = `# ${description}\n\nGenerado por Agroemeta AGI\nFecha: ${new Date().toLocaleDateString()}\n`;
        const blob = new Blob([docContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        appendMessage("AGROEMETA", `Documento creado: "${description}"`, "agroemeta");
        appendDocumentInChat(url, description, `${description.replace(/\s+/g, "_")}.txt`);
        showToast("Documento creado (modo local)");
      } finally {
        btnCreateDocTask.textContent = "Crear Documento";
        btnCreateDocTask.disabled = false;
      }
    });

    // ---------- Mejorar texto ----------
    if (improveTextBtn) improveTextBtn.addEventListener("click", () => {
      const isVisible = improveTextPanel.style.display !== "none";
      improveTextPanel.style.display = isVisible ? "none" : "block";
      if (!isVisible && improveTextInput) improveTextInput.focus();
    });

    if (btnImproveText) btnImproveText.addEventListener("click", async () => {
      const text = improveTextInput ? improveTextInput.value.trim() : "";
      if (!text) { showToast("Ingresá el texto que querés mejorar"); return; }
      btnImproveText.textContent = "Mejorando...";
      btnImproveText.disabled = true;
      try {
        const response = await fetch(`${ANTIGRAVITY_BACKEND_URL}/api/improve-text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, mode: "default" })
        });
        const data = await response.json();
        if (response.ok && data.improvedText) {
          if (improveTextInput) improveTextInput.value = data.improvedText;
          showToast("Texto mejorado");
          appendMessage("AGROEMETA", `Texto mejorado:\n\n${data.improvedText}`, "agroemeta");
        } else {
          throw new Error("sin texto");
        }
      } catch (e) {
        try {
          const mejorado = await window.agroEngine.ask(`Mejora y corrige este texto de forma profesional manteniendo el sentido:\n\n${text}`);
          if (improveTextInput) improveTextInput.value = mejorado;
          appendMessage("AGROEMETA", `Texto mejorado:\n\n${mejorado}`, "agroemeta");
          showToast("Texto mejorado");
        } catch (_) {
          const improved = `${text}\n\n[Texto procesado por Agroemeta AGI]`;
          if (improveTextInput) improveTextInput.value = improved;
          appendMessage("AGROEMETA", `Texto procesado:\n\n${improved}`, "agroemeta");
          showToast("Texto procesado (modo local)");
        }
      } finally {
        btnImproveText.textContent = "Mejorar Texto";
        btnImproveText.disabled = false;
      }
    });

    // ---------- TAREA 3: CHAT PRINCIPAL CON RESILIENCIA Y MANEJO DE ERRORES ----------
    async function handleUserQuery(query) {
      if (window.agroAudio) window.agroAudio.playBeep(920, 0.06);
      appendMessage("USUARIO", query, "user");
      setThinkingState(true);

      const temporalInfo = getArgentinaDateTime();
      const lower = query.toLowerCase();

      // Detección: generar imagen
      if (lower.includes("genera una imagen") || lower.includes("generar imagen") || lower.includes("crea una imagen") || lower.includes("dibuja") || lower.includes("imagen de")) {
        const prompt = query
          .replace(/genera una imagen de/gi, '')
          .replace(/generar imagen de/gi, '')
          .replace(/crea una imagen de/gi, '')
          .replace(/dibuja/gi, '')
          .replace(/imagen de/gi, '')
          .trim();
        if (prompt) {
          setThinkingState(false);
          appendMessage("AGROEMETA", `Generando imagen: "${prompt}"...`, "agroemeta");
          if (!isVoiceMuted && window.agroAudio) window.agroAudio.speak(`Generando imagen de ${prompt}`);
          try {
            const response = await fetch(`${ANTIGRAVITY_BACKEND_URL}/api/generate-image`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt, mode: "default" })
            });
            const data = await response.json();
            if (response.ok && data.imageUrl) {
              generatedImages.unshift({ url: data.imageUrl, prompt, timestamp: new Date().toISOString() });
              renderImageGallery();
              appendImageInChat(data.imageUrl, prompt);
            } else {
              const fb = `https://placehold.co/600x400?text=${encodeURIComponent(prompt)}`;
              generatedImages.unshift({ url: fb, prompt, timestamp: new Date().toISOString() });
              renderImageGallery();
              appendImageInChat(fb, prompt);
            }
          } catch (e) {
            const fb = `https://placehold.co/600x400?text=${encodeURIComponent(prompt)}`;
            generatedImages.unshift({ url: fb, prompt, timestamp: new Date().toISOString() });
            renderImageGallery();
            appendImageInChat(fb, prompt);
          }
          return;
        }
      }

      // Detección: crear documento
      if (lower.includes("crea un documento") || lower.includes("crear documento") || lower.includes("haz un documento") || lower.includes("documento de")) {
        const description = query
          .replace(/crea un documento/gi, '')
          .replace(/crear documento/gi, '')
          .replace(/haz un documento/gi, '')
          .replace(/documento de/gi, '')
          .trim();
        if (description) {
          setThinkingState(false);
          appendMessage("AGROEMETA", `Creando documento: "${description}"...`, "agroemeta");
          if (!isVoiceMuted && window.agroAudio) window.agroAudio.speak(`Creando documento de ${description}`);
          try {
            const response = await fetch(`${ANTIGRAVITY_BACKEND_URL}/api/create-document`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ description, mode: "default" })
            });
            const data = await response.json();
            if (response.ok && data.documentUrl) {
              appendDocumentInChat(data.documentUrl, description, data.fileName || "documento.pdf");
            } else throw new Error("sin url");
          } catch (e) {
            const docContent = `# ${description}\n\nGenerado por Agroemeta AGI\nFecha: ${temporalInfo.fecha} ${temporalInfo.hora}\n`;
            const blob = new Blob([docContent], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            appendDocumentInChat(url, description, `${description.replace(/\s+/g, "_")}.txt`);
          }
          return;
        }
      }

      // ===== LÓGICA DE RESPUESTA: RESILIENCIA CON TRY/CATCH Y RETRY =====
      let answered = false;

      // 1. Intento con Backend Serverless (/api/chat)
      if (!window.location.origin.startsWith("file:")) {
        for (let intento = 1; intento <= 2 && !answered; intento++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 9500);

            const res = await fetch(`${ANTIGRAVITY_BACKEND_URL}/api/chat`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Accept": "application/json" },
              body: JSON.stringify({ query, temporal: temporalInfo, mode: "default" }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              const reply = data.response || data.text || data.message || "";
              if (reply && reply.trim().length > 3) {
                setThinkingState(false);
                appendMessage("AGROEMETA", reply, "agroemeta");
                if (!isVoiceMuted && window.agroAudio) window.agroAudio.speak(reply);
                answered = true;
                break;
              }
            }
          } catch (err) {
            // Si el primer intento falla por red, reintenta inmediatamente
            if (intento === 1) await new Promise(r => setTimeout(r, 400));
          }
        }
      }

      // 2. Fallback Transparente al Motor Cognitivo Local (agroEngine)
      if (!answered) {
        try {
          const localReply = await window.agroEngine.ask(query);
          setThinkingState(false);
          appendMessage("AGROEMETA", localReply, "agroemeta");
          if (!isVoiceMuted && window.agroAudio) window.agroAudio.speak(localReply);
          answered = true;
        } catch (localErr) {
          setThinkingState(false);
          const safeMessage = localErr.message && localErr.message.length > 10
            ? localErr.message
            : `Estoy en línea procesando tu consulta (${temporalInfo.hora}). Contame los datos específicos del tema y lo resolvemos juntos.`;
          appendMessage("AGROEMETA", safeMessage, "agroemeta");
          if (!isVoiceMuted && window.agroAudio) window.agroAudio.speak(safeMessage);
        }
      }
    }

    function setThinkingState(isThinking) {
      if (thinkingIndicator) thinkingIndicator.style.display = isThinking ? "flex" : "none";
      if (livingCore) {
        if (isThinking) livingCore.classList.add("thinking");
        else livingCore.classList.remove("thinking");
      }
      if (orbStateText) orbStateText.textContent = isThinking ? "Analizando con precisión..." : "En línea y listo para ayudarte";
    }

    function appendMessage(sender, text, type, saveToStorage = true) {
      const row = document.createElement("div");
      row.className = `bubble-row bubble-${type}`;

      // Formato Markdown básico
      let html = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/### (.+)/g, '<h4>$1</h4>')
        .replace(/## (.+)/g, '<h3>$1</h3>')
        .replace(/\n/g, '<br>');

      row.innerHTML = `
        <div class="avatar-tag">${sender}</div>
        <div class="bubble-content">${html}</div>
      `;
      chatFeed.appendChild(row);
      chatFeed.scrollTop = chatFeed.scrollHeight;

      if (saveToStorage && sender !== "AGROEMETA_INIT") {
        saveMessageToStorage(sender, text, type);
      }
    }

    // ---------- Eventos ----------
    if (voiceMuteBtn) voiceMuteBtn.addEventListener("click", () => {
      isVoiceMuted = !isVoiceMuted;
      const btnText = voiceMuteBtn.querySelector(".btn-text");
      if (btnText) btnText.textContent = isVoiceMuted ? "SILENCIADA" : "VOZ";
      if (isVoiceMuted) {
        voiceMuteBtn.classList.remove("active");
        if (window.agroAudio) window.agroAudio.stopSpeaking();
      } else {
        voiceMuteBtn.classList.add("active");
        if (window.agroAudio) window.agroAudio.playBeep(700, 0.08);
      }
    });

    if (sendBtn) sendBtn.addEventListener("click", submitText);
    if (userInput) userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitText();
      }
    });

    function submitText() {
      const text = userInput ? userInput.value.trim() : "";
      if (!text) return;
      userInput.value = "";
      handleUserQuery(text);
    }

    // ---------- Reacciones sobre el Núcleo AGI (Living Orb) ----------
    const livingOrb = document.getElementById("livingOrb");
    if (livingOrb) {
      livingOrb.style.cursor = "pointer";
      livingOrb.title = "Tocá para hablar con el micrófono";
      livingOrb.addEventListener("click", () => {
        if (window.agroAudio) window.agroAudio.toggleListening();
      });
    }

    if (window.agroAudio) {
      window.agroAudio.onListeningChange = (isListening) => {
        if (livingCore) {
          if (isListening) {
            livingCore.classList.add("listening");
            if (orbStateText) orbStateText.textContent = "🎙️ Escuchando... Hablá ahora";
          } else {
            livingCore.classList.remove("listening");
            if (orbStateText) orbStateText.textContent = "En línea y listo para ayudarte";
          }
        }
      };

      window.agroAudio.onSpeakingChange = (isSpeaking) => {
        if (livingCore) {
          if (isSpeaking) {
            livingCore.classList.add("speaking");
            if (orbStateText) orbStateText.textContent = "🔊 Agroemeta hablando...";
          } else {
            livingCore.classList.remove("speaking");
            if (orbStateText) orbStateText.textContent = "En línea y listo para ayudarte";
          }
        }
      };
    }

    if (micToggleBtn) micToggleBtn.addEventListener("click", () => {
      if (window.agroAudio) window.agroAudio.toggleListening();
    });

    // Cargar historial previo guardado en localStorage
    loadHistoryFromStorage();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runApp);
  } else {
    runApp();
  }
})();
