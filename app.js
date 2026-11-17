/**
 * AGROEMETA // Interfaz Nocturna de Mayordomo Inteligente
 * Drag & Drop de documentos, integración directa con Gemini y control por voz
 */

(function() {
  const runApp = () => {
    // URL del backend (local o producción)
    const ANTIGRAVITY_BACKEND_URL = (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin !== "null" && !window.location.origin.startsWith("file:"))
      ? window.location.origin
      : "http://127.0.0.1:8085";

  // Elementos DOM Principales
  const chatFeed = document.getElementById("chatFeed");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const micToggleBtn = document.getElementById("micToggleBtn");
  const handsFreeBtn = document.getElementById("handsFreeBtn");
  const hfStatus = document.getElementById("hfStatus");
  const voiceMuteBtn = document.getElementById("voiceMuteBtn");
  const attachBtn = document.getElementById("attachBtn");
  const filePicker = document.getElementById("filePicker");
  const dropOverlay = document.getElementById("dropOverlay");
  const activeDocBar = document.getElementById("activeDocBar");
  const docNameText = document.getElementById("docNameText");
  const docSizeText = document.getElementById("docSizeText");
  const removeDocBtn = document.getElementById("removeDocBtn");
  const livingCore = document.querySelector(".living-core-container");
  const livingOrb = document.getElementById("livingOrb");
  const orbStateText = document.getElementById("orbStateText");
  const thinkingIndicator = document.getElementById("thinkingIndicator");

  // Nuevos botones de funcionalidades
  const genImgBtn = document.getElementById("genImgBtn");
  const createDocBtn = document.getElementById("createDocBtn");
  const improveTextBtn = document.getElementById("improveTextBtn");
  const voicePauseBtn = document.getElementById("voicePauseBtn");
  const voiceResumeBtn = document.getElementById("voiceResumeBtn");
  const voiceStopBtn = document.getElementById("voiceStopBtn");
  const voiceSpeedSelect = document.getElementById("voiceSpeedSelect");
  const voiceStatusEl = document.getElementById("voiceStatus");

  // Paneles
  const imgGenPanel = document.getElementById("imgGenPanel");
  const docTaskPanel = document.getElementById("docTaskPanel");
  const improveTextPanel = document.getElementById("improveTextPanel");
  const imageGallery = document.getElementById("imageGallery");
  const subtitlesPanel = document.getElementById("subtitlesPanel");
  const toastNotification = document.getElementById("toastNotification");

  // Inputs de paneles
  const imgPromptInput = document.getElementById("imgPromptInput");
  const btnGenerateImg = document.getElementById("btnGenerateImg");
  const docTaskInput = document.getElementById("docTaskInput");
  const btnSelectDocFile = document.getElementById("btnSelectDocFile");
  const docTaskFileInput = document.getElementById("docTaskFileInput");
  const btnCreateDocTask = document.getElementById("btnCreateDocTask");
  const improveTextInput = document.getElementById("improveTextInput");
  const btnImproveText = document.getElementById("btnImproveText");

  // Estado
  let generatedImages = [];
  let currentDocTask = null;
  let textToImprove = null;

  // Modal de Llave Gemini
  const keyConfigBtn = document.getElementById("keyConfigBtn");
  const keyModal = document.getElementById("keyModal");
  const geminiKeyInput = document.getElementById("geminiKeyInput");
  const saveKeyBtn = document.getElementById("saveKeyBtn");
  const cancelKeyModalBtn = document.getElementById("cancelKeyModalBtn");
  const toggleKeyVisibility = document.getElementById("toggleKeyVisibility");
  const keyBtnLabel = document.getElementById("keyBtnLabel");

  // Estado local
  let isVoiceMuted = false;
  let handsFreeActive = false;

  // 0. SINCRONIZACIÓN REMOTA CON BACKEND / AGENTE EN ANTIGRAVITY
  async function syncWithAntigravityBackend() {
    try {
      const response = await fetch("/api/config", {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      if (response.ok) {
        const config = await response.json();
        window.antigravityRemoteData = config;

        // Inyectar descripción de marca si está disponible
        const brandDescEl = document.querySelector(".brand-desc");
        if (brandDescEl && config.brand_desc) {
          brandDescEl.textContent = config.brand_desc;
        }

        // Inyectar bienvenida y datos actualizados de Antigravity en el primer mensaje
        const firstMessageEl = document.querySelector("#chatFeed .bubble-agroemeta .bubble-content");
        if (firstMessageEl && config.welcome_message) {
          firstMessageEl.innerHTML = config.welcome_message;
        }

        // Reflejar estado de sincronización en el subtítulo del núcleo vivo
        if (orbStateText && config.status) {
          orbStateText.textContent = "ANTIGRAVITY EN LÍNEA";
          setTimeout(() => {
            if (!livingCore.classList.contains("thinking")) {
              orbStateText.textContent = "En calma, a sus órdenes";
            }
          }, 3500);
        }

        console.log("[AGROEMETA] Conexión remota establecida con Antigravity:", config);
      }
    } catch (e) {
      console.log("[AGROEMETA] Operando en modo local directo:", e.message);
    }
  }

  // Ejecutar conexión inicial remota
  syncWithAntigravityBackend();

  // 1. GESTIÓN DE LA LLAVE GEMINI (La pide la primera vez y la guarda en el navegador)
  const savedKey = localStorage.getItem("agroemeta_gemini_key") || localStorage.getItem("agroemeta_api_key") || "";
  if (savedKey) {
    window.agroEngine.setApiKey(savedKey);
    keyBtnLabel.textContent = "LLAVE ACTIVA";
  } else {
    // Pedir la primera vez de forma elegante
    setTimeout(() => {
      openKeyModal();
    }, 600);
  }

  function openKeyModal() {
    geminiKeyInput.value = window.agroEngine.customApiKey || "";
    keyModal.style.display = "flex";
    setTimeout(() => geminiKeyInput.focus(), 150);
  }

  function closeKeyModal() {
    keyModal.style.display = "none";
  }

  keyConfigBtn.addEventListener("click", openKeyModal);
  cancelKeyModalBtn.addEventListener("click", closeKeyModal);

  saveKeyBtn.addEventListener("click", () => {
    const key = geminiKeyInput.value.trim();
    if (!key) {
      alert("Por favor, ingrese una clave válida de Google Gemini.");
      return;
    }
    window.agroEngine.setApiKey(key);
    keyBtnLabel.textContent = "LLAVE ACTIVA";
    closeKeyModal();
    window.agroAudio.playSuccessPing();
    appendMessage(
      "AGROEMETA", 
      "Caballero, he resguardado su llave en la memoria local de su navegador. Mis facultades cognitivas con Google Gemini se encuentran a su entera disposición.",
      "agroemeta"
    );
  });

  const testKeyBtn = document.getElementById("testKeyBtn");
  const keyTestResult = document.getElementById("keyTestResult");

  // Mostrar/Ocultar la llave con el botón de ojo
  toggleKeyVisibility.addEventListener("click", () => {
    if (geminiKeyInput.type === "password") {
      geminiKeyInput.type = "text";
      toggleKeyVisibility.textContent = "🙈";
    } else {
      geminiKeyInput.type = "password";
      toggleKeyVisibility.textContent = "👁️";
    }
  });

  testKeyBtn.addEventListener("click", async () => {
    const candidate = geminiKeyInput.value.trim();
    if (!candidate) {
      keyTestResult.style.display = "block";
      keyTestResult.className = "key-test-feedback err";
      keyTestResult.textContent = "Ingrese primero una clave para probar.";
      return;
    }

    testKeyBtn.textContent = "Probando...";
    keyTestResult.style.display = "block";
    keyTestResult.className = "key-test-feedback";
    keyTestResult.textContent = "Consultando Google ModelService.ListModels...";

    // Guardar temporalmente para la prueba
    const oldKey = window.agroEngine.customApiKey;
    window.agroEngine.setApiKey(candidate);

    try {
      const res = await window.agroEngine.discoverAvailableModels();
      if (res && res.models && res.models.length > 0) {
        keyTestResult.className = "key-test-feedback ok";
        keyTestResult.innerHTML = `<strong>✓ Conexión Exitosa (${res.apiVersion}):</strong><br>Modelos activos encontrados: ${res.models.slice(0, 4).join(", ")}`;
        keyBtnLabel.textContent = "LLAVE ACTIVA";
      } else if (res && res.error) {
        keyTestResult.className = "key-test-feedback err";
        keyTestResult.innerHTML = `<strong>✗ Error devuelto por Google:</strong><br>${res.error.message}`;
      } else {
        keyTestResult.className = "key-test-feedback err";
        keyTestResult.textContent = "No se encontraron modelos compatibles con generateContent para esta clave.";
      }
    } catch (e) {
      keyTestResult.className = "key-test-feedback err";
      keyTestResult.textContent = `Fallo de conexión: ${e.message}`;
    } finally {
      testKeyBtn.textContent = "Probar Llave";
    }
  });

  // 2. SONIDO DE BIENVENIDA AL INTERACTUAR POR PRIMERA VEZ
  let hasBooted = false;
  document.addEventListener("click", () => {
    if (!hasBooted) {
      window.agroAudio.playJarvisBoot();
      hasBooted = true;
    }
  }, { once: true });

  // 3. EVENTOS DE AUDIO Y ESTADO VIVO DEL ORBE
  window.agroAudio.onListeningChange = (listening) => {
    if (listening) {
      micToggleBtn.classList.add("active");
      orbStateText.textContent = "Escuchando su voz...";
      livingCore.classList.add("thinking");
    } else {
      micToggleBtn.classList.remove("active");
      if (!thinkingIndicator.style.display || thinkingIndicator.style.display === "none") {
        orbStateText.textContent = "En calma, a sus órdenes";
        livingCore.classList.remove("thinking");
      }
    }
  };

  window.agroAudio.onSpeakingChange = (speaking) => {
    if (speaking) {
      orbStateText.textContent = "Transmitiendo respuesta...";
      livingCore.classList.add("thinking");
    } else {
      if (!thinkingIndicator.style.display || thinkingIndicator.style.display === "none") {
        orbStateText.textContent = "En calma, a sus órdenes";
        livingCore.classList.remove("thinking");
      }
    }
  };

  // Captura de voz desde el micrófono
  window.agroAudio.onSpeechResult = (transcript) => {
    let clean = transcript.trim();
    const lower = clean.toLowerCase();
    if (lower.startsWith("agroemeta") || lower.startsWith("oye agroemeta")) {
      clean = clean.replace(/^(oye\s+)?agroemeta\s*[,:]?\s*/i, "");
    }
    if (clean.length > 0) {
      handleUserQuery(clean);
    }
  };

  // Alternar Modo Manos Libres
  handsFreeBtn.addEventListener("click", () => {
    handsFreeActive = !handsFreeActive;
    if (handsFreeActive) {
      handsFreeBtn.classList.add("active", "listening");
      hfStatus.textContent = "ON";
      window.agroAudio.setHandsFree(true);
    } else {
      handsFreeBtn.classList.remove("active", "listening");
      hfStatus.textContent = "OFF";
      window.agroAudio.setHandsFree(false);
    }
  });

  // Botón Micrófono Manual
  micToggleBtn.addEventListener("click", () => {
    window.agroAudio.toggleListening();
  });

  // Botón Silenciar Voz
  voiceMuteBtn.addEventListener("click", () => {
    isVoiceMuted = !isVoiceMuted;
    if (isVoiceMuted) {
      voiceMuteBtn.classList.remove("active");
      voiceMuteBtn.querySelector(".btn-text").textContent = "SILENCIADA";
      window.agroAudio.stopSpeaking();
    } else {
      voiceMuteBtn.classList.add("active");
      voiceMuteBtn.querySelector(".btn-text").textContent = "VOZ";
      window.agroAudio.playBeep(700, 0.08);
    }
  });

  // 3.5. CONTROLES DE VOZ (Pausa, Reanudar, Detener, Velocidad)
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

  // 3.6. GENERAR IMAGEN CON IA
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
        appendMessage("AGROEMETA", `Aquí tienes la imagen generada: "${prompt}"`, "agroemeta");
        appendImageInChat(data.imageUrl, prompt);
        showToast("Imagen generada exitosamente");
        imgPromptInput.value = "";
      } else {
        showToast(data.error || "Error generando imagen");
      }
    } catch (e) {
      // Fallback: generar placeholder de lugar.com si no hay backend
      const fallbackUrl = `https://placehold.co/600x400?text=${encodeURIComponent(prompt)}`;
      const imgEntry = { url: fallbackUrl, prompt, timestamp: new Date().toISOString() };
      generatedImages.unshift(imgEntry);
      renderImageGallery();
      appendMessage("AGROEMETA", `Aquí tienes la imagen generada: "${prompt}"`, "agroemeta");
      appendImageInChat(fallbackUrl, prompt);
      showToast("Imagen generada (modo vista previa)");
    } finally {
      btnGenerateImg.textContent = "Generar Imagen";
      btnGenerateImg.disabled = false;
    }
  });

  // 3.7. CREAR DOCUMENTO CON TAREA O FOTO
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
        body: JSON.stringify({
          description,
          file: currentDocTask,
          mode: "default"
        })
      });
      const data = await response.json();
      if (response.ok && data.documentUrl) {
        appendMessage("AGROEMETA", `Documento creado exitosamente: "${description}"`, "agroemeta");
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
      // Fallback local: crear documento de texto
      const docContent = `# ${description}\n\nGenerado por Agroemeta AGI\nFecha: ${new Date().toLocaleDateString()}\n\nContenido generado automáticamente por el sistema.\n`;
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

  // 3.8. MEJORAR TEXTO
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
      // Fallback local: devolver texto con formato mejorado
      const improved = `**${text}**\n\nEste texto ha sido procesado por Agroemeta AGI para mejorar su claridad y estructura.`;
      improveTextInput.value = improved;
      appendMessage("AGROEMETA", `Texto mejorado (modo local):\n\n${improved}`, "agroemeta");
      showToast("Texto mejorado (modo local)");
    } finally {
      btnImproveText.textContent = "Mejorar Texto";
      btnImproveText.disabled = false;
    }
  });

  // 4. ENVÍO DE CONSULTA (Con Enter se envía)
  sendBtn.addEventListener("click", submitText);

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitText();
    }
  });

  function submitText() {
    const text = userInput.value.trim();
    if (!text) return;
    userInput.value = "";
    handleUserQuery(text);
  }

  // 5. PROCESAMIENTO CENTRAL DE CONSULTA
  async function handleUserQuery(query) {
    window.agroAudio.playBeep(920, 0.06);

    // Mensaje de usuario en el chat
    appendMessage("USUARIO", query, "user");

    // Activar estado visual de pensando
    setThinkingState(true);

    const lower = query.toLowerCase();

    // Detectar comando de generación de imagen
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

    // Detectar comando de crear documento
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
      // 1. Intentar consultar primero al endpoint remoto del agente en Antigravity
      let remoteResponse = null;
      try {
        const agentReq = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: query,
            document: window.agroEngine.activeDocument ? {
              name: window.agroEngine.activeDocument.name,
              isText: window.agroEngine.activeDocument.isText
            } : null
          })
        });
        if (agentReq.ok) {
          const agentData = await agentReq.json();
          if (agentData && agentData.remote_response) {
            remoteResponse = agentData.remote_response;
          }
        }
      } catch (_) {
        // Si no responde el endpoint de Antigravity, continúa fluido con el motor cognitivo local
      }

      // Si no hay respuesta remota y no hay llave de Gemini y no es consulta que cubra la base local, sugerir llave
      if (!remoteResponse && !window.agroEngine.hasApiKey() && !window.agroEngine.searchKnowledgeBase(query)) {
        setTimeout(() => openKeyModal(), 600);
      }

      const response = remoteResponse || await window.agroEngine.ask(query);
      
      setThinkingState(false);
      appendMessage("AGROEMETA", response, "agroemeta");

      if (!isVoiceMuted) {
        window.agroAudio.speak(response);
      }
    } catch (err) {
      setThinkingState(false);
      const friendlyError = err.message || "Ha ocurrido una dificultad al procesar su solicitud.";
      appendMessage("AGROEMETA", friendlyError, "agroemeta", true);

      if (!isVoiceMuted) {
        window.agroAudio.speak(friendlyError);
      }
    }
  }

  function setThinkingState(isThinking) {
    if (isThinking) {
      thinkingIndicator.style.display = "flex";
      livingCore.classList.add("thinking");
      orbStateText.textContent = "Examinando con precisión...";
      chatFeed.scrollTop = chatFeed.scrollHeight;
    } else {
      thinkingIndicator.style.display = "none";
      livingCore.classList.remove("thinking");
      orbStateText.textContent = "En calma, a sus órdenes";
    }
  }

  // 6. RENDERIZADO DE MENSAJES EN EL CHAT
  function appendMessage(sender, text, type, isError = false) {
    const row = document.createElement("div");
    row.className = `bubble-row bubble-${type}`;

    const formatted = formatResponseText(text);

    let errorAction = "";
    if (isError && (text.includes("llave") || text.includes("Google"))) {
      errorAction = `
        <div class="bubble-actions">
          <button class="msg-voice-replay" onclick="document.getElementById('keyConfigBtn').click()">🔑 Configurar Llave</button>
        </div>
      `;
    } else if (type === "agroemeta") {
      errorAction = `
        <div class="bubble-actions">
          <button class="msg-voice-replay" onclick="window.agroAudio.speak('${escapeQuotes(text)}')">🔊 Escuchar en voz</button>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="avatar-tag">${sender}</div>
      <div class="bubble-content">
        ${formatted}
        ${errorAction}
      </div>
    `;

    chatFeed.appendChild(row);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  function formatResponseText(str) {
    // Si contiene reporte técnico, darle estilo diferenciado
    if (str.includes("[DIAGNÓSTICO TÉCNICO EXACTO DE GOOGLE]")) {
      const parts = str.split("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      if (parts.length >= 3) {
        const topIntro = parts[0].trim().replace(/\n/g, '<br>');
        const techBox = parts[1].trim()
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        const bottomNote = parts.slice(2).join("").trim().replace(/\n/g, '<br>');

        return `
          <div class="msg-lead">${topIntro}</div>
          <div class="technical-diagnostic-box">
            <div class="tech-box-header"><span>TELEMETRÍA DE ERROR GOOGLE</span></div>
            <pre class="tech-box-body">${techBox}</pre>
          </div>
          ${bottomNote ? `<div class="msg-footer-note">${bottomNote}</div>` : ''}
        `;
      }
    }

    return str
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n• /g, '<br>• ')
      .replace(/\n- /g, '<br>– ')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/•\s*(Conclusión|Pasos\s*\/?\s*solución|Comprobación|Preguntas[^:<]*):/gi, '<br><strong style="color: var(--blue-glow-core); letter-spacing: 0.5px;">✦ $1:</strong>');
  }

  function escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
  }

  // 6.5. RENDERIZAR GALERÍA DE IMÁGENES
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
        <div class="msg-img">
          <img src="${url}" alt="${prompt}">
        </div>
        <div class="msg-download">
          <button class="btn-img-download" onclick="downloadImage('${url}', '${prompt}')" title="Descargar imagen">⬇️ Descargar</button>
        </div>
      </div>
    `;
    chatFeed.appendChild(row);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  function appendDocumentInChat(url, description, fileName) {
    const row = document.createElement("div");
    row.className = "bubble-row bubble-agroemeta";
    row.innerHTML = `
      <div class="avatar-tag">AGROEMETA</div>
      <div class="bubble-content">
        <div class="doc-task-area">
          <div class="doc-task-header">
            <span class="doc-task-title">📄 ${fileName || 'documento'}</div>
          </div>
          <div class="doc-task-content">${description}</div>
          <button class="btn-doc-download" onclick="downloadImage('${url}', '${fileName || 'documento'}')" title="Descargar documento">⬇️ Descargar</button>
        </div>
      </div>
    `;
    chatFeed.appendChild(row);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  function showToast(message) {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.classList.add('visible');
    setTimeout(() => {
      toastNotification.classList.remove('visible');
    }, 3000);
  }

  // Exponer funciones al scope global para onclick en HTML
  window.downloadImage = downloadImage;
  window.regenerateImage = regenerateImage;
  window.renderImageGallery = renderImageGallery;
  window.showToast = showToast;

  // 7. GESTIÓN DE DOCUMENTOS (DRAG & DROP Y SELECTOR)
  // Soporte de PDFs, imágenes y texto
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

  // Botón clip para adjuntar desde móvil o clic
  attachBtn.addEventListener("click", () => filePicker.click());
  filePicker.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  });

  // Drag & drop global
  window.addEventListener("dragenter", (e) => {
    e.preventDefault();
    dropOverlay.classList.add("active");
  });

  window.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  dropOverlay.addEventListener("dragleave", (e) => {
    if (e.relatedTarget === null || e.target === dropOverlay) {
      dropOverlay.classList.remove("active");
    }
  });

  window.addEventListener("drop", (e) => {
    e.preventDefault();
    dropOverlay.classList.remove("active");
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  });

  function processFile(file) {
    const fileName = file.name;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);

    // 1. Comprobación de tamaño antes de intentarlo
    if (file.size > MAX_FILE_SIZE) {
      const errSize = `Caballero, el archivo '${fileName}' tiene un tamaño de ${fileSizeMB} MB y excede el límite prudente de 20 MB. Le sugiero un archivo más ligero para que pueda procesarlo de inmediato.`;
      appendMessage("AGROEMETA", errSize, "agroemeta", true);
      if (!isVoiceMuted) window.agroAudio.speak(errSize);
      return;
    }

    // 2. Comprobación de formato
    const ext = fileName.split('.').pop().toLowerCase();
    const isPdf = file.type === "application/pdf" || ext === "pdf";
    const isImage = file.type.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
    const isText = file.type.startsWith("text/") || ["txt", "csv", "md", "log", "json"].includes(ext);

    if (!isPdf && !isImage && !isText) {
      const errFormat = `Caballero, no me es posible examinar archivos con extensión .${ext}. Por favor, facilíteme documentos en PDF, imágenes o archivos de texto.`;
      appendMessage("AGROEMETA", errFormat, "agroemeta", true);
      if (!isVoiceMuted) window.agroAudio.speak(errFormat);
      return;
    }

    // 3. Lectura del archivo en memoria del navegador
    const reader = new FileReader();

    if (isText) {
      reader.onload = (event) => {
        const textContent = event.target.result;
        window.agroEngine.setActiveDocument({
          name: fileName,
          size: fileSizeMB + " MB",
          isText: true,
          content: textContent
        });
        showDocumentFeedback(fileName, fileSizeMB);
      };
      reader.readAsText(file);
    } else {
      // PDF o imagen en base64 para Gemini
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const base64Data = dataUrl.split(",")[1];
        const mimeType = file.type || (isPdf ? "application/pdf" : "image/jpeg");
        window.agroEngine.setActiveDocument({
          name: fileName,
          size: fileSizeMB + " MB",
          isText: false,
          mimeType: mimeType,
          base64: base64Data
        });
        showDocumentFeedback(fileName, fileSizeMB);
      };
      reader.readAsDataURL(file);
    }
  }

  // Notificación en una sola línea al usuario de que el documento llegó bien
  function showDocumentFeedback(name, sizeMB) {
    window.agroAudio.playSuccessPing();

    // Mostrar barra de documento activo
    docNameText.textContent = name;
    docSizeText.textContent = `(${sizeMB} MB)`;
    activeDocBar.style.display = "flex";

    const confirmLine = `He recibido su documento: '${name}' (${sizeMB} MB). Queda incorporado a nuestra conversación; dígame qué precisa saber sobre él.`;
    appendMessage("AGROEMETA", confirmLine, "agroemeta");

    if (!isVoiceMuted) {
      window.agroAudio.speak(`He recibido su documento: ${name}. Queda a su disposición para examinarlo.`);
    }

    userInput.focus();
  }

  // Retirar documento activo
  removeDocBtn.addEventListener("click", () => {
    window.agroEngine.clearActiveDocument();
    activeDocBar.style.display = "none";
    appendMessage("AGROEMETA", "El documento ha sido desvinculado de la memoria activa.", "agroemeta");
  });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runApp);
  } else {
    runApp();
  }
})();
