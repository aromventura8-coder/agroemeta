/**
 * AGROEMETA - Interfaz de Mayordomo Inteligente
 * Con generación de imágenes, crear documentos, mejorar texto, controles de voz y subtítulos
 */

(function() {
  const runApp = () => {
    const ANTIGRAVITY_BACKEND_URL = (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin !== "null" && !window.location.origin.startsWith("file:"))
      ? window.location.origin
      : "http://127.0.0.1:8085";

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

    // ---------- Utilidades ----------
    function showToast(message) {
      if (!toastNotification) return;
      toastNotification.textContent = message;
      toastNotification.classList.add('visible');
      setTimeout(() => toastNotification.classList.remove('visible'), 3000);
    }

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
    // Reintentar cuando las voces carguen (browser las carga async)
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
      if (!prompt) { showToast("Ingresa una descripción para la imagen"); return; }
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
        showToast("Ingresa una descripción o selecciona un archivo");
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
      if (!text) { showToast("Ingresa el texto que quieres mejorar"); return; }
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
        // Fallback local via agroEngine
        try {
          const mejorado = await window.agroEngine.ask(`Mejora y corrige este texto de forma profesional:\n\n${text}`);
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

    // ---------- Chat principal ----------
    async function handleUserQuery(query) {
      if (window.agroAudio) window.agroAudio.playBeep(920, 0.06);
      appendMessage("USUARIO", query, "user");
      setThinkingState(true);

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
            const docContent = `# ${description}\n\nGenerado por Agroemeta AGI\nFecha: ${new Date().toLocaleDateString()}\n`;
            const blob = new Blob([docContent], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            appendDocumentInChat(url, description, `${description.replace(/\s+/g, "_")}.txt`);
          }
          return;
        }
      }

      // ===== LÓGICA PRINCIPAL DE CONSULTA CON TRIPLE FALLBACK =====
      // 1º intento: serverless /api/chat (Netlify/Vercel)
      // 2º intento: motor cognitivo local window.agroEngine (siempre disponible)

      let answered = false;

      // Intento 1: Backend serverless
      if (!window.location.origin.startsWith("file:")) {
        try {
          const res = await fetch(`${ANTIGRAVITY_BACKEND_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ query, mode: "default" })
          });
          if (res.ok) {
            const data = await res.json();
            const reply = data.response || data.text || data.message || "";
            if (reply && reply.trim().length > 3) {
              setThinkingState(false);
              appendMessage("AGROEMETA", reply, "agroemeta");
              if (!isVoiceMuted && window.agroAudio) window.agroAudio.speak(reply);
              answered = true;
            }
          }
        } catch (_) { /* cae al motor local */ }
      }

      // Intento 2: Motor cognitivo local (siempre como fallback)
      if (!answered) {
        try {
          const localReply = await window.agroEngine.ask(query);
          setThinkingState(false);
          appendMessage("AGROEMETA", localReply, "agroemeta");
          if (!isVoiceMuted && window.agroAudio) window.agroAudio.speak(localReply);
          answered = true;
        } catch (localErr) {
          setThinkingState(false);
          const errMsg = localErr.message && localErr.message.length > 10
            ? localErr.message
            : "Estoy procesando tu consulta. Si ingresaste una clave Gemini, verificala. Si no, puedo ayudarte con mi base de conocimiento interna sobre agronomia, maquinaria y la escuela.";
          appendMessage("AGROEMETA", errMsg, "agroemeta");
          if (!isVoiceMuted && window.agroAudio) window.agroAudio.speak(errMsg);
        }
      }
    }

    function setThinkingState(isThinking) {
      if (thinkingIndicator) thinkingIndicator.style.display = isThinking ? "flex" : "none";
      if (livingCore) {
        if (isThinking) livingCore.classList.add("thinking");
        else livingCore.classList.remove("thinking");
      }
      if (orbStateText) orbStateText.textContent = isThinking ? "Examinando con precision..." : "En linea y listo para ayudarte";
    }

    function appendMessage(sender, text, type) {
      const row = document.createElement("div");
      row.className = `bubble-row bubble-${type}`;
      // Renderizar markdown básico: **negrita**, saltos de línea
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

    // ---------- Reacciones de voz y micrófono sobre el Núcleo AGI (Living Orb) ----------
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
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runApp);
  } else {
    runApp();
  }
})();
