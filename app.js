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
    const livingCore = document.querySelector(".living-core-container");
    const orbStateText = document.getElementById("orbStateText");
    const thinkingIndicator = document.getElementById("thinkingIndicator");
    const subtitlesPanel = document.getElementById("subtitlesPanel");
    const subtitleTextEl = document.getElementById("subtitleText");
    const subtitleStatusEl = document.getElementById("subtitleStatus");
    const toastNotification = document.getElementById("toastNotification");

    // Estado local
    let isVoiceMuted = false;
    let currentResponseMode = 'default';

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

    // ---------- Funciones de voz ----------
    window.agroAudio.showSubtitles = function(text, status) {
      if (subtitleTextEl) subtitleTextEl.textContent = text;
      if (subtitlesPanel) subtitlesPanel.classList.add('visible');
      if (subtitleStatusEl) subtitleStatusEl.textContent = status || 'Hablando';
    };

    window.agroAudio.hideSubtitles = function() {
      if (subtitlesPanel) subtitlesPanel.classList.remove('visible');
    };

    // ---------- Controles de voz ----------
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

    voiceMuteBtn.addEventListener("click", () => {
      isVoiceMuted = !isVoiceMuted;
      voiceMuteBtn.querySelector(".btn-text").textContent = isVoiceMuted ? "SILENCIADA" : "VOZ";
      if (isVoiceMuted) {
        voiceMuteBtn.classList.remove("active");
        window.agroAudio.stopSpeaking();
      } else {
        voiceMuteBtn.classList.add("active");
        window.agroAudio.playBeep(700, 0.08);
      }
    });

    // ---------- Envío de consulta ----------
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

    // ---------- Manejo de consulta ----------
    async function handleUserQuery(query) {
      window.agroAudio.playBeep(920, 0.06);

      // Mensaje de usuario
      appendMessage("USUARIO", query, "user");

      // Estado pensando
      setThinkingState(true);

      try {
        const res = await fetch(`${ANTIGRAVITY_BACKEND_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ query: query, mode: "default" })
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

    // ---------- Estado pensando ----------
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

    // ---------- Renderizar mensaje ----------
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
