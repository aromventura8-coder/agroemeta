/**
 * AGROEMETA - Subsistema de Audio, Micrófono Manos Libres y Voz Jarvis
 * Desarrollado con Web Audio API, SpeechRecognition y SpeechSynthesis
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
    this.wakeWord = "agroemeta";
    this.initAudioContext();
    this.initVoices();
    this.initRecognition();
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

  // Sonidos sintéticos de interfaz Jarvis
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
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
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

  // Inicializar voces en español
  initVoices() {
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      // Preferir voces masculinas o neutras en español para emular a Jarvis
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

  // Inicializar reconocimiento de voz
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
      // Si el modo manos libres está encendido, reiniciar automáticamente
      if (this.handsFreeMode) {
        setTimeout(() => {
          try {
            if (this.handsFreeMode && !this.synth.speaking) {
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
      
      // Si estamos en modo manos libres continuo, podemos responder o filtrar por wake-word
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

  // Habla Jarvis
  speak(text) {
    if (!this.synth) return;

    // Si el usuario habla o se solicita nueva habla, cancelar lo anterior
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    // Si contiene reporte técnico de error, hablar solo la parte principal para el usuario
    let textToSpeak = text;
    if (text.includes("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")) {
      const segments = text.split("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      textToSpeak = segments[0] + (segments[2] ? " " + segments[2] : "");
    }

    // Limpiar formatos markdown para la voz
    const cleanText = textToSpeak
      .replace(/\[.*?\]/g, '')
      .replace(/[#*`_~━]/g, '')
      .replace(/•/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    // Si el reconocimiento está escuchando, pausarlo temporalmente para que no se escuche a sí mismo
    const wasListening = this.isListening;
    if (wasListening && this.recognition) {
      try { this.recognition.stop(); } catch (_) {}
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = 'es-ES';
    utterance.rate = 1.05; // Cadencia inteligente y ágil
    utterance.pitch = 0.95; // Tono ligeramente grave, elegante como Jarvis

    utterance.onstart = () => {
      if (this.onSpeakingChange) this.onSpeakingChange(true);
    };

    utterance.onend = () => {
      if (this.onSpeakingChange) this.onSpeakingChange(false);
      // Reanudar escucha en modo manos libres
      if (this.handsFreeMode && this.recognition) {
        setTimeout(() => {
          try {
            this.recognition.start();
          } catch (_) {}
        }, 400);
      }
    };

    utterance.onerror = () => {
      if (this.onSpeakingChange) this.onSpeakingChange(false);
      if (this.handsFreeMode && this.recognition) {
        try { this.recognition.start(); } catch (_) {}
      }
    };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      if (this.onSpeakingChange) this.onSpeakingChange(false);
    }
  }
}

// Instancia global
window.agroAudio = new AgroAudioSystem();
