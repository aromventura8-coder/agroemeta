/**
 * AGROEMETA - Subsistema de Audio, Micrófono y Voz Jarvis
 */

class AgroAudioSystem {
  constructor() {
    this.audioCtx = null;
    this.recognition = null;
    this.synth = window.speechSynthesis;
    this.isListening = false;
    this.handsFreeMode = false;
    this.selectedVoice = null;
    this.onSpeechResult = null;
    this.onListeningChange = null;
    this.onSpeakingChange = null;
    this.onSubtitleChange = null;
    this.wakeWord = "agroemeta";
    this.currentUtterance = null;
    this.isPaused = false;
    this.isSpeaking = false;
    this.voiceRate = 1.0;
    this.voiceQueue = [];
    this.isProcessingQueue = false;
    this.subtitleElement = null;
    this.subtitleStatusElement = null;

    this.subtitlesPanel = document.getElementById('subtitlesPanel');
    this.subtitleTextEl = document.getElementById('subtitleText');
    this.subtitleStatusEl = document.getElementById('subtitleStatus');

    this.setupSubtitlePanel();
    this.initAudioContext();
    this.initVoices();
    this.initRecognition();
  }

  setupSubtitlePanel() {
    if (!this.subtitlesPanel) {
      this.subtitlesPanel = document.createElement('div');
      this.subtitlesPanel.id = 'subtitlesPanel';
      this.subtitlesPanel.className = 'subtitles-panel';
      this.subtitlesPanel.innerHTML = `
        <div class="subtitle-text" id="subtitleText">...</div>
        <div class="subtitle-status" id="subtitleStatus">Listo</div>
      `;
      document.body.appendChild(this.subtitlesPanel);
      this.subtitleTextEl = document.getElementById('subtitleText');
      this.subtitleStatusEl = document.getElementById('subtitleStatus');
    }
  }

  showSubtitles(text, status = 'Hablando') {
    if (this.subtitleTextEl) {
      this.subtitleTextEl.textContent = text;
      this.subtitlesPanel.classList.add('visible');
    }
    if (this.subtitleStatusEl) {
      this.subtitleStatusEl.textContent = status;
    }
    if (this.onSubtitleChange) {
      this.onSubtitleChange(text, status);
    }
  }

  hideSubtitles() {
    if (this.subtitlesPanel) {
      this.subtitlesPanel.classList.remove('visible');
    }
    if (this.onSubtitleChange) {
      this.onSubtitleChange('', 'Listo');
    }
  }

  initAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.audioCtx = new AudioContext();
    }
  }

  ensureAudioContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playBeep(freq = 880, duration = 0.1, type = "sine") {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio feedback error:", e);
    }
  }

  playJarvisBoot() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      [440, 659.25, 880, 1318.5].forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.07, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.35);
      });
    } catch (_) {}
  }

  playListeningChime() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (_) {}
  }

  playSuccessPing() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      [880, 1174.66].forEach((f, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.frequency.setValueAtTime(f, now + i * 0.1);
        gain.gain.setValueAtTime(0.08, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.2);
      });
    } catch (_) {}
  }

  initVoices() {
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      const esVoices = voices.filter(v => v.lang.startsWith("es"));
      const preferred = esVoices.find(v =>
        v.name.includes("Raul") ||
        v.name.includes("Pablo") ||
        v.name.includes("Alvaro") ||
        v.name.includes("Google español") ||
        v.name.includes("Natural") ||
        v.name.includes("Sabina") ||
        v.name.includes("Castilian")
      ) || esVoices[0] || voices[0];
      this.selectedVoice = preferred;
    };
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Reconocimiento de voz no soportado por este navegador.");
      return;
    }
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'es-ES';
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onListeningChange) this.onListeningChange(true);
    };
    this.recognition.onend = () => {
      this.isListening = false;
      if (this.handsFreeMode) {
        setTimeout(() => {
          try {
            if (this.handsFreeMode && !this.synth.speaking && !this.isPaused) {
              this.recognition.start();
            }
          } catch (_) {}
        }, 300);
      }
      if (this.onListeningChange) this.onListeningChange(false);
    };
    this.recognition.onerror = (event) => {
      console.warn("Error en reconocimiento de voz:", event.error);
      if (event.error === 'not-allowed') {
        this.handsFreeMode = false;
      }
    };
    this.recognition.onresult = (event) => {
      const lastIndex = event.results.length - 1;
      const transcript = event.results[lastIndex][0].transcript.trim();
      if (!transcript) return;
      this.playSuccessPing();
      if (this.onSpeechResult) {
        this.onSpeechResult(transcript);
      }
    };
  }

  toggleListening() {
    if (!this.recognition) {
      alert("Su navegador no soporta SpeechRecognition. Use Google Chrome o Microsoft Edge para el modo por voz.");
      return;
    }
    if (this.isListening) {
      this.handsFreeMode = false;
      this.recognition.stop();
    } else {
      this.handsFreeMode = true;
      this.playListeningChime();
      try {
        this.recognition.start();
      } catch (e) {
        console.warn("Inicio de reconocimiento falló o ya activo:", e);
      }
    }
  }

  setHandsFree(enabled) {
    this.handsFreeMode = enabled;
    if (enabled) {
      this.playListeningChime();
      try {
        if (!this.isListening && this.recognition) this.recognition.start();
      } catch (_) {}
    } else {
      if (this.recognition && this.isListening) this.recognition.stop();
    }
  }

  speak(text) {
    if (!this.synth) return;
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    let textToSpeak = text;
    if (text.includes("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")) {
      const segments = text.split("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      textToSpeak = segments[0] + (segments[2] ? " " + segments[2] : "");
    }

    const cleanText = textToSpeak
      .replace(/\[.*?\]/g, '')
      .replace(/[#*`_~━✦•]/g, '')
      .replace(/•/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    const wasListening = this.isListening;
    if (wasListening && this.recognition) {
      try { this.recognition.stop(); } catch (_) {}
    }

    this.voiceQueue = [];
    this.isProcessingQueue = false;
    this.addToQueue(cleanText);
    this.processQueue();
  }

  addToQueue(text) {
    this.voiceQueue.push(text);
  }

  async processQueue() {
    if (this.isProcessingQueue || this.voiceQueue.length === 0) return;
    this.isProcessingQueue = true;
    while (this.voiceQueue.length > 0) {
      const text = this.voiceQueue.shift();
      await this.speakUtterance(text);
    }
    this.isProcessingQueue = false;
  }

  speakUtterance(text) {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.lang = 'es-ES';
      utterance.rate = this.voiceRate;
      utterance.pitch = 0.95;
      this.isSpeaking = true;
      this.showSubtitles(text, 'Hablando');
      this.updateVoiceStatus('Hablando');

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (this.onSpeakingChange) this.onSpeakingChange(true);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.hideSubtitles();
        this.updateVoiceStatus('Listo');
        if (this.onSpeakingChange) this.onSpeakingChange(false);
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.hideSubtitles();
        this.updateVoiceStatus('Listo');
        if (this.onSpeakingChange) this.onSpeakingChange(false);
        resolve();
      };

      this.synth.speak(utterance);
      this.currentUtterance = utterance;
    });
  }

  pauseSpeaking() {
    if (this.synth && this.synth.speaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.hideSubtitles();
      this.updateVoiceStatus('Pausado');
      if (this.onSpeakingChange) this.onSpeakingChange(false);
    }
  }

  resumeSpeaking() {
    if (this.synth && this.synth.paused && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.updateVoiceStatus('Hablando');
      if (this.onSpeakingChange) this.onSpeakingChange(true);
    }
  }

  stopSpeaking() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.isPaused = false;
      this.isSpeaking = false;
      this.hideSubtitles();
      this.updateVoiceStatus('Listo');
      if (this.onSpeakingChange) this.onSpeakingChange(false);
    }
    this.voiceQueue = [];
    this.isProcessingQueue = false;
  }

  setVoiceRate(rate) {
    this.voiceRate = parseFloat(rate);
    if (this.currentUtterance) {
      this.currentUtterance.rate = this.voiceRate;
    }
  }

  updateVoiceStatus(status) {
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
      statusEl.textContent = status;
    }
  }

  getState() {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      isListening: this.isListening,
      voiceRate: this.voiceRate
    };
  }
}

window.agroAudio = new AgroAudioSystem();
