/**
 * AGROEMETA - Subsistema de Audio JARVIS
 * Voz grave, clara y natural en español. Micrófono integrado al chat.
 */

class AgroAudioSystem {
  constructor() {
    this.audioCtx       = null;
    this.recognition    = null;
    this.synth          = window.speechSynthesis;
    this.isListening    = false;
    this.handsFreeMode  = false;
    this.selectedVoice  = null;
    this.currentUtterance = null;
    this.isPaused       = false;
    this.voiceRate      = 0.92;   // Ritmo JARVIS: ligeramente más lento que lo normal
    this.voicePitch     = 0.80;   // Tono grave estilo JARVIS
    this.voiceVolume    = 1.0;
    this.isSpeaking     = false;

    // Callbacks
    this.onSpeechResult    = null;
    this.onListeningChange = null;
    this.onSpeakingChange  = null;
    this.showSubtitles     = null;
    this.hideSubtitles     = null;

    this.initAudioContext();
    this.initVoices();
    this.initRecognition();
  }

  // ─── AudioContext ───────────────────────────────────────────────────────────
  initAudioContext() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) this.audioCtx = new AC();
  }

  ensureAudioContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // ─── Sonidos JARVIS ─────────────────────────────────────────────────────────
  playBeep(freq = 880, duration = 0.08, type = "sine") {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;
      const osc  = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.07, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (_) {}
  }

  // Secuencia de arranque JARVIS: cuatro notas ascendentes
  playJarvisBoot() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      [330, 440, 554, 659].forEach((freq, i) => {
        const osc  = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.07, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.3);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.3);
      });
    } catch (_) {}
  }

  // Chime de micrófono activado
  playListeningChime() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;
      const now  = this.audioCtx.currentTime;
      const osc  = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (_) {}
  }

  // Ping de confirmación (resultado de voz recibido)
  playSuccessPing() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      [660, 880].forEach((f, i) => {
        const osc  = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.frequency.setValueAtTime(f, now + i * 0.1);
        gain.gain.setValueAtTime(0.07, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.18);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.18);
      });
    } catch (_) {}
  }

  // ─── Voces JARVIS ───────────────────────────────────────────────────────────
  // Prioridad: voces masculinas graves en español
  selectBestVoice(voices) {
    const es = voices.filter(v => v.lang.startsWith("es"));
    const all = voices;

    // Lista de preferencia por nombre (grave, masculino, natural)
    const priority = [
      "Microsoft Raul",       // Windows 11 - es-MX (muy buena)
      "Microsoft Raul Online",
      "Raul",
      "Jorge",                // macOS español
      "Microsoft Pablo",
      "Pablo",
      "Microsoft Alvaro",
      "Alvaro",
      "Google español",
      "Google Spanish",
      "Microsoft Carlos",
      "Carlos",
      "Miguel",
      "Diego",
    ];

    for (const name of priority) {
      const found = all.find(v => v.name.includes(name));
      if (found) return found;
    }

    // Si no encuentra ninguna preferida, tomar la primera en español
    return es[0] || all[0] || null;
  }

  initVoices() {
    const load = () => {
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        this.selectedVoice = this.selectBestVoice(voices);
        console.log("[AGROEMETA Audio] Voz seleccionada:", this.selectedVoice?.name || "default");
      }
    };
    if (typeof this.synth.onvoiceschanged !== "undefined") {
      this.synth.onvoiceschanged = load;
    }
    load();
    // Segundo intento por si las voces tardan en cargar
    setTimeout(load, 500);
    setTimeout(load, 1500);
  }

  // Devuelve las voces disponibles en español para que el usuario pueda elegir
  getAvailableVoices() {
    const voices = this.synth.getVoices();
    return voices.filter(v => v.lang.startsWith("es") || v.lang.startsWith("ES"));
  }

  setVoiceByName(name) {
    const voices = this.synth.getVoices();
    const found = voices.find(v => v.name === name);
    if (found) {
      this.selectedVoice = found;
      console.log("[AGROEMETA Audio] Voz cambiada a:", found.name);
    }
  }

  // ─── Reconocimiento de voz (Micrófono) ─────────────────────────────────────
  initRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      console.warn("[AGROEMETA Audio] SpeechRecognition no soportado. Usa Chrome o Edge.");
      return;
    }

    this.recognition = new SR();
    this.recognition.lang           = 'es-AR'; // Español argentino primero
    this.recognition.continuous     = false;    // Un turno a la vez (más estable)
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      this._setMicBtn(true);
      if (this.onListeningChange) this.onListeningChange(true);
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      if (!transcript) return;
      this.playSuccessPing();
      this._setMicBtn(false);
      this.isListening = false;
      if (this.onListeningChange) this.onListeningChange(false);

      // Enviar al chat directamente
      const input = document.getElementById('userInput');
      if (input) {
        input.value = transcript;
        // Disparar el envío automáticamente
        setTimeout(() => {
          const sendBtn = document.getElementById('sendBtn');
          if (sendBtn) sendBtn.click();
        }, 100);
      }

      if (this.onSpeechResult) this.onSpeechResult(transcript);
    };

    this.recognition.onerror = (event) => {
      console.warn("[AGROEMETA Audio] Error micrófono:", event.error);
      this.isListening = false;
      this._setMicBtn(false);
      if (this.onListeningChange) this.onListeningChange(false);

      if (event.error === 'not-allowed') {
        this._showMicPermissionAlert();
      } else if (event.error === 'no-speech') {
        // Sin habla detectada — no hacer nada, el usuario puede intentar de nuevo
      }
    };

    this.recognition.onend = () => {
      // Si era manos libres y no está hablando, reiniciar la escucha
      if (this.handsFreeMode && !this.isSpeaking) {
        setTimeout(() => {
          if (this.handsFreeMode && !this.isSpeaking) {
            try { this.recognition.start(); } catch (_) {}
          }
        }, 400);
      } else {
        this.isListening = false;
        this._setMicBtn(false);
        if (this.onListeningChange) this.onListeningChange(false);
      }
    };
  }

  // Alterna micrófono: un toque activa, otro desactiva
  toggleListening() {
    if (!this.recognition) {
      this._showMicPermissionAlert();
      return;
    }
    this.ensureAudioContext();

    if (this.isListening) {
      this.handsFreeMode = false;
      try { this.recognition.stop(); } catch (_) {}
      this._setMicBtn(false);
    } else {
      this.handsFreeMode = true;
      this.playListeningChime();
      try { this.recognition.start(); } catch (e) {
        console.warn("[AGROEMETA Audio] No se pudo iniciar el micrófono:", e);
      }
    }
  }

  _setMicBtn(active) {
    const btn = document.getElementById('micToggleBtn');
    if (!btn) return;
    if (active) {
      btn.classList.add('mic-active');
      btn.querySelector('span') && (btn.querySelector('span').textContent = '🔴');
      btn.title = "Micrófono activo - Hablá ahora";
    } else {
      btn.classList.remove('mic-active');
      btn.querySelector('span') && (btn.querySelector('span').textContent = '🎙️');
      btn.title = "Activar micrófono";
    }
  }

  _showMicPermissionAlert() {
    const chatFeed = document.getElementById('chatFeed');
    if (chatFeed) {
      const row = document.createElement('div');
      row.className = 'bubble-row bubble-agroemeta';
      row.innerHTML = `
        <div class="avatar-tag">AGROEMETA</div>
        <div class="bubble-content">
          Para usar el micrófono necesito permiso del navegador. Fijate en la barra de direcciones: aparece un ícono de cámara/micrófono — hacé clic ahí y seleccioná <strong>Permitir</strong>. Después intentá de nuevo.
        </div>
      `;
      chatFeed.appendChild(row);
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }
  }

  // ─── Síntesis de voz (Hablar) ───────────────────────────────────────────────
  speak(text) {
    if (!this.synth || !text) return;

    // Limpiar texto técnico antes de leer
    const clean = this._cleanForSpeech(text);
    if (!clean || clean.length < 2) return;

    // Parar reconocimiento mientras habla (para no escucharse a sí mismo)
    if (this.isListening && this.recognition) {
      try { this.recognition.stop(); } catch (_) {}
    }

    // Cancelar cualquier habla previa
    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel();
    }

    // Esperar un tick para que el cancel surta efecto en Safari/Edge
    setTimeout(() => this._doSpeak(clean), 60);
  }

  _doSpeak(text) {
    // Texto muy largo: cortarlo en oraciones para que suene natural
    const chunks = this._splitIntoChunks(text, 220);
    let idx = 0;

    const speakNext = () => {
      if (idx >= chunks.length) {
        this.isSpeaking = false;
        this._onSpeechEnd();
        return;
      }
      const chunk = chunks[idx++];
      const utt = new SpeechSynthesisUtterance(chunk);

      if (this.selectedVoice) utt.voice = this.selectedVoice;
      utt.lang   = 'es-AR';
      utt.rate   = this.voiceRate;
      utt.pitch  = this.voicePitch;
      utt.volume = this.voiceVolume;

      utt.onstart = () => {
        this.isSpeaking = true;
        this.currentUtterance = utt;
        if (this.onSpeakingChange) this.onSpeakingChange(true);
        // Mostrar subtítulos
        if (this.showSubtitles) this.showSubtitles(chunk, 'Hablando');
        this._updateStatus('Hablando');
      };

      utt.onend = () => {
        speakNext();
      };

      utt.onerror = () => {
        this.isSpeaking = false;
        this._onSpeechEnd();
      };

      this.synth.speak(utt);
    };

    this.isSpeaking = true;
    speakNext();
  }

  _onSpeechEnd() {
    if (this.hideSubtitles) this.hideSubtitles();
    this._updateStatus('Listo');
    if (this.onSpeakingChange) this.onSpeakingChange(false);
    this.currentUtterance = null;

    // Reactivar micrófono en modo manos libres
    if (this.handsFreeMode && this.recognition) {
      setTimeout(() => {
        if (this.handsFreeMode && !this.isSpeaking) {
          try { this.recognition.start(); } catch (_) {}
        }
      }, 500);
    }
  }

  // Divide texto en chunks respetando oraciones
  _splitIntoChunks(text, maxLen) {
    if (text.length <= maxLen) return [text];
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks = [];
    let current = '';
    for (const s of sentences) {
      if ((current + ' ' + s).trim().length <= maxLen) {
        current = (current + ' ' + s).trim();
      } else {
        if (current) chunks.push(current);
        current = s;
      }
    }
    if (current) chunks.push(current);
    return chunks.length ? chunks : [text.substring(0, maxLen)];
  }

  // Limpia el texto para que suene natural al leerlo
  _cleanForSpeech(text) {
    return text
      .replace(/```[\s\S]*?```/g, '')          // bloques de código
      .replace(/`[^`]+`/g, '')                  // código inline
      .replace(/\[.*?\]\(.*?\)/g, '')           // links markdown
      .replace(/#{1,4}\s*/g, '')                // títulos markdown
      .replace(/\*\*(.+?)\*\*/g, '$1')          // **negrita**
      .replace(/\*(.+?)\*/g, '$1')              // *cursiva*
      .replace(/━+/g, '')                       // líneas decorativas
      .replace(/[•✦▪▸→←↑↓]/g, '')             // bullets decorativos
      .replace(/\[DIAGNÓSTICO.*?\]/g, '')        // etiquetas técnicas
      .replace(/\[ANÁLISIS.*?\]/g, '')
      .replace(/\[PROTOCOLO.*?\]/g, '')
      .replace(/\[ALERTA.*?\]/g, '')
      .replace(/\[CÁLCULO.*?\]/g, '')
      .replace(/\[MANEJO.*?\]/g, '')
      .replace(/\[REGULACIÓN.*?\]/g, '')
      .replace(/\[EDAFOLOGÍA.*?\]/g, '')
      .replace(/\[TELEMETRÍA.*?\]/g, '')
      .replace(/\n{2,}/g, '. ')                 // saltos de línea múltiples
      .replace(/\n/g, ' ')                       // saltos de línea simples
      .replace(/\s{2,}/g, ' ')                  // espacios múltiples
      .replace(/📍|🧭|⬇️|🔊|🎙️|📄|🎨|✨/g, '') // emojis
      .trim();
  }

  pauseSpeaking() {
    if (this.synth && this.synth.speaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      if (this.hideSubtitles) this.hideSubtitles();
      this._updateStatus('Pausado');
    }
  }

  resumeSpeaking() {
    if (this.synth && this.synth.paused && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this._updateStatus('Hablando');
    }
  }

  stopSpeaking() {
    if (this.synth) this.synth.cancel();
    this.isPaused   = false;
    this.isSpeaking = false;
    if (this.hideSubtitles) this.hideSubtitles();
    this._updateStatus('Listo');
    if (this.onSpeakingChange) this.onSpeakingChange(false);
  }

  setVoiceRate(rate) {
    this.voiceRate = parseFloat(rate);
  }

  setVoicePitch(pitch) {
    this.voicePitch = parseFloat(pitch);
  }

  _updateStatus(text) {
    const el = document.getElementById('voiceStatus');
    if (el) el.textContent = text;
  }

  getState() {
    return {
      isSpeaking:  this.isSpeaking,
      isPaused:    this.isPaused,
      isListening: this.isListening,
      voiceRate:   this.voiceRate,
      voicePitch:  this.voicePitch,
      voice:       this.selectedVoice?.name || 'default'
    };
  }
}

// ─── Instancia global ───────────────────────────────────────────────────────
window.agroAudio = new AgroAudioSystem();
