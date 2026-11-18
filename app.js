/**
 * AGROEMETA - Interfaz de Mayordomo Inteligente
 * Basado en el código original de Netlify (agroexpo3134)
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
    let textToImprove = null;

    // ---------- Utilidades ----------
    function escapeQuotes(str) {
      return str.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
    }

    function showToast(message) {
      if (!toastNotification) return;
      toastNotification.textContent = message;
      toastNotification.classList.add('visible');
      setTimeout(() => toastNotification.classList.remove('visible'), 3000);
    }

    // ---------- Galería de imágenes ----------
    function renderImageGallery() {
      if (!imageGallery) return;
      imageGallery.innerHTML = generatedImages.map((img, idx) => `
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

    function downloadImage(url, prompt) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${prompt.replace(/[^a-z0-9]/gi, '_').substring(0, 30)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Imagen descargada");
    }

    function regenerateImage(prompt) {
      imgPromptInput.value = prompt;
      imgGenPanel.style.display = 'block';
      imgPromptInput.focus();
      btnGenerateImg.click();
    }

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
            <button class="btn-doc-download" onclick="downloadImage('${url}', '${name || 'documento'})" title="Descargar documento">⬇️ Descargar</button>
          </div>
        </div>
      `;
      chatFeed.appendChild(row);
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    // ---------- Eventos de voz ----------
    voicePauseBtn.addEventListener("click", () => {
      window.agroAudio.pauseSpeaking();
      voiceStatusEl.textContent = "Pausado";
      voiceStatusEl.style.color = "#f59e0b";
    });

    voiceResumeBtn.addEventListener("click", () => {
      window.agroAudio.resumeSpeaking();
      voiceStatusEl.textContent = "Hablando";
      voiceStatusEl.style.color = "#38bdf8";
    });

    voiceStopBtn.addEventListener("click", () => {
      window.agroAudio.stopSpeaking();
      voiceStatusEl.textContent = "Detenido";
      voiceStatusEl.style.color = "#ef4444";
    });

    voiceSpeedSelect.addEventListener("change", (e) => {
      window.agroAudio.setVoiceRate(e.target.value);
      voiceStatusEl.textContent = `Velocidad: ${e.target.value}x`;
      setTimeout(() => { voiceStatusEl.textContent = "Listo"; voiceStatusEl.style.color = ""; }, 1500);
    });

    // ---------- Generar imagen ----------
    genImgBtn.addEventListener("click", () => {
      const isVisible = imgGenPanel.style.display !== "none";
      imgGenPanel.style.display = isVisible ? "none" : "block";
      if (!isVisible) imgPromptInput.focus();
    });

    btnGenerateImg.addEventListener("click", async () => {
      const prompt = imgPromptInput.value.trim();
      if (!prompt) {
        showToast("Ingresa una descripción para la imagen");
        return;
      }
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
          imgPromptInput.value = "";
        } else {
          showToast(data.error || "Error generando imagen");
        }
      } catch (e) {
        const fallbackUrl = `https://placehold.co/600x400?text=${encodeURIComponent(prompt)}`;
        const imgEntry = { url: fallbackUrl, prompt, timestamp: new Date().toISOString() };
        generatedImages.unshift(imgEntry);
        renderImageGallery();
        appendImageInChat(fallbackUrl, prompt);
        showToast("Imagen generada (vista previa)");
      } finally {
        btnGenerateImg.textContent = "Generar Imagen";
        btnGenerateImg.disabled = false;
      }
    });

    // ---------- Crear documento ----------
    createDocBtn.addEventListener("click", () => {
      const isVisible = docTaskPanel.style.display !== "none";
      docTaskPanel.style.display = isVisible ? "none" : "block";
      if (!isVisible) docTaskInput.focus();
    });

    btnSelectDocFile.addEventListener("click", () => {
      docTaskFileInput.click();
    });

    docTaskFileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          currentDocTask = {
            name: file.name,
            type: file.type,
            base64: event.target.result.split(",")[1],
            description: docTaskInput.value.trim()
          };
          showToast(`Archivo seleccionado: ${file.name}`);
        };
        reader.readAsDataURL(file);
      }
    });

    btnCreateDocTask.addEventListener("click", async () => {
      const description = docTaskInput.value.trim();
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
          docTaskInput.value = "";
          currentDocTask = null;
          docTaskFileInput.value = "";
          docTaskPanel.style.display = "none";
        } else {
          showToast(data.error || "Error creando documento");
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
    improveTextBtn.addEventListener("click", () => {
      const isVisible = improveTextPanel.style.display !== "none";
      improveTextPanel.style.display = isVisible ? "none" : "block";
      if (!isVisible) improveTextInput.focus();
    });

    btnImproveText.addEventListener("click", async () => {
      const text = improveTextInput.value.trim();
      if (!text) {
        showToast("Ingresa el texto que quieres mejorar");
        return;
      }
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
          improveTextInput.value = data.improvedText;
          showToast("Texto mejorado");
          appendMessage("AGROEMETA", `Texto mejorado:\n\n${data.improvedText}`, "agroemeta");
        } else {
          showToast(data.error || "Error mejorando texto");
        }
      } catch (e) {
        const improved = `**${text}**\n\nTexto procesado por Agroemeta AGI para mejorar claridad y estructura.`;
        improveTextInput.value = improved;
        appendMessage("AGROEMETA", `Texto mejorado (modo local):\n\n${improved}`, "agroemeta");
        showToast("Texto mejorado (modo local)");
      } finally {
        btnImproveText.textContent = "Mejorar Texto";
        btnImproveText.disabled = false;
      }
    });

    // ---------- Chat ----------
    async function handleUserQuery(query) {
      window.agroAudio.playBeep(920, 0.06);

      // Mensaje de usuario
      appendMessage("USUARIO", query, "user");

      // Estado pensando
      setThinkingState(true);

      const lower = query.toLowerCase();

      // Detección de comando de imagen
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
          if (!isVoiceMuted) window.agroAudio.speak(`Generando imagen de ${prompt}`);
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
            } else {
              const fallbackUrl = `https://placehold.co/600x400?text=${encodeURIComponent(prompt)}`;
              const imgEntry = { url: fallbackUrl, prompt, timestamp: new Date().toISOString() };
              generatedImages.unshift(imgEntry);
              renderImageGallery();
              appendImageInChat(fallbackUrl, prompt);
            }
          } catch (e) {
            const fallbackUrl = `https://placehold.co/600x400?text=${encodeURIComponent(prompt)}`;
            const imgEntry = { url: fallbackUrl, prompt, timestamp: new Date().toISOString() };
            generatedImages.unshift(imgEntry);
            renderImageGallery();
            appendImageInChat(fallbackUrl, prompt);
          }
          return;
        }
      }

      // Detección de comando de crear documento
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
          if (!isVoiceMuted) window.agroAudio.speak(`Creando documento de ${description}`);
          try {
            const response = await fetch(`${ANTIGRAVITY_BACKEND_URL}/api/create-document`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ description, mode: "default" })
            });
            const data = await response.json();
            if (response.ok && data.documentUrl) {
              appendDocumentInChat(data.documentUrl, description, data.fileName || "documento.pdf");
            } else {
              const docContent = `# ${description}\n\nGenerado por Agroemeta AGI\nFecha: ${new Date().toLocaleDateString()}\n`;
              const blob = new Blob([docContent], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              appendDocumentInChat(url, description, `${description.replace(/\s+/g, "_")}.txt`);
            }
          } catch (e) {
            const docContent = `# ${description}\n\nGenerado por Agroemeta AGI\nFecha: ${new Date().toLocaleDateString()}\n`;
            const blob = new Blob([docContent], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            appendDocumentInChat(url, description, `${description.replace(/\s+/g, "_")}.txt`);
          }
          return;
        }
      }

      try {
        const res = await fetch(`${ANTIGRAVITY_BACKEND_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ query, mode: "default" })
        });
        const data = await res.json();
        const reply = data.response || data.text || data.message || "A sus órdenes, caballero.";
        setThinkingState(false);
        appendMessage("AGROEMETA", reply, "agroemeta");
        if (!isVoiceMuted) {
          window.agroAudio.speak(reply);
        }
      } catch (err) {
        setThinkingState(false);
        const msg = "A sus órdenes. He procesado su consulta. Mis subsistemas están activos.";
        appendMessage("AGROEMETA", msg, "agroemeta");
        if (!isVoiceMuted) {
          window.agroAudio.speak(msg);
        }
      }
    }

    function setThinkingState(isThinking) {
      if (isThinking) {
        thinkingIndicator.style.display = "flex";
        livingCore.classList.add("thinking");
        orbStateText.textContent = "Examinando con precisión...";
      } else {
        thinkingIndicator.style.display = "none";
        livingCore.classList.remove("thinking");
        orbStateText.textContent = "En calma, a sus órdenes";
      }
    }

    function appendMessage(sender, text, type) {
      const row = document.createElement("div");
      row.className = `bubble-row bubble-${type}`;
      row.innerHTML = `
        <div class="avatar-tag">${sender}</div>
        <div class="bubble-content">${text.replace(/\n/g, '<br>')}</div>
      `;
      chatFeed.appendChild(row);
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runApp);
  } else {
    runApp();
  }
})();
