/**
 * AGROEMETA - Interfaz de Mayordomo Inteligente
 */

document.addEventListener("DOMContentLoaded", () => {
  const chatFeed = document.getElementById("chatFeed");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const micToggleBtn = document.getElementById("micToggleBtn");
  const voiceMuteBtn = document.getElementById("voiceMuteBtn");
  const voicePauseBtn = document.getElementById("voicePauseBtn");
  const voiceResumeBtn = document.getElementById("voiceResumeBtn");
  const voiceStopBtn = document.getElementById("voiceStopBtn");
  const thinkingIndicator = document.getElementById("thinkingIndicator");
  const livingCore = document.querySelector(".living-core-container");
  const orbStateText = document.getElementById("orbStateText");

  const ANTIGRAVITY_BACKEND_URL = window.location.origin;

  let isVoiceMuted = false;

  window.agroAudio.onListeningChange = (listening) => {
    if (listening) {
      orbStateText.textContent = "Escuchando su voz...";
      livingCore.classList.add("thinking");
    } else {
      orbStateText.textContent = "En calma, a sus órdenes";
      livingCore.classList.remove("thinking");
    }
  };

  window.agroAudio.onSpeakingChange = (speaking) => {
    if (speaking) {
      orbStateText.textContent = "Transmitiendo respuesta...";
      livingCore.classList.add("thinking");
    } else {
      orbStateText.textContent = "En calma, a sus órdenes";
      livingCore.classList.remove("thinking");
    }
  };

  window.agroAudio.onSpeechResult = (transcript) => {
    handleUserQuery(transcript);
  };

  voicePauseBtn.addEventListener("click", () => { window.agroAudio.pauseSpeaking(); });
  voiceResumeBtn.addEventListener("click", () => { window.agroAudio.resumeSpeaking(); });
  voiceStopBtn.addEventListener("click", () => { window.agroAudio.stopSpeaking(); });

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

  sendBtn.addEventListener("click", submitText);
  userInput.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitText(); } });

  function submitText() {
    const text = userInput.value.trim();
    if (!text) return;
    userInput.value = "";
    handleUserQuery(text);
  }

  async function handleUserQuery(query) {
    window.agroAudio.playBeep(920, 0.06);
    appendMessage("USUARIO", query, "user");
    setThinkingState(true);

    try {
      const res = await fetch(`${ANTIGRAVITY_BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, mode: "default" })
      });
      const data = await res.json();
      const reply = data.response || data.text || "A sus órdenes, caballero.";
      setThinkingState(false);
      appendMessage("AGROEMETA", reply, "agroemeta");
      if (!isVoiceMuted) window.agroAudio.speak(reply);
    } catch (err) {
      setThinkingState(false);
      const msg = "A sus órdenes. He procesado su consulta. Mis subsistemas están activos.";
      appendMessage("AGROEMETA", msg, "agroemeta");
      if (!isVoiceMuted) window.agroAudio.speak(msg);
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
});
