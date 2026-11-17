/**
 * AGROEMETA - Subsistema de Audio y Voz
 */

class AgroAudioSystem {
  constructor() {
    this.audioCtx = null;
    this.recognition = null;
    this.synth = window.speechSynthesis;
    this.isListening = false;
    this.handsFreeMode = false;
    this.selectedVoice = null;
    this.currentUtterance = null;
    this.isPaused = false;
    this.initAudioContext();
    this.initVoices();
    this.initRecognition();
  }

  initAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) this.audioCtx = new AudioContext();
  }

  ensureAudioContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();
  }

  playBeep(freq = 880, duration = 0.1) {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  initVoices() {
    const load = () => {
      const voices = this.synth.getVoices();
      const es = voices.filter(v => v.lang.startsWith("es"));
      this.selectedVoice = es.find(v => v.name.includes("Raul") || v.name.includes("Pablo") || v.name.includes("Google")) || es[0] || voices[0];
    };
    if (this.synth.onvoiceschanged !== undefined) this.synth.onvoiceschanged = load;
    load();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'es-ES';
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.onresult = (e) => {
      const t = e.results[e.results.length - 1][0].transcript.trim();
      if (t && this.onSpeechResult) this.onSpeechResult(t);
    };
  }

  toggleListening() {
    if (!this.recognition) return;
    if (this.isListening) {
      this.handsFreeMode = false;
      this.recognition.stop();
    } else {
      this.handsFreeMode = true;
      this.playBeep(650, 0.12);
      try { this.recognition.start(); } catch (_) {}
    }
  }

  setHandsFree(enabled) {
    this.handsFreeMode = enabled;
    if (enabled) {
      this.playBeep(650, 0.12);
      try { if (!this.isListening && this.recognition) this.recognition.start(); } catch (_) {}
    } else {
      if (this.recognition && this.isListening) this.recognition.stop();
    }
  }

  speak(text) {
    if (!this.synth) return;
    if (this.synth.speaking) this.synth.cancel();
    const clean = text.replace(/\[.*?\]/g, '').replace(/[#*`_~━✦•]/g, '').replace(/\n+/g, '. ').trim();
    if (!clean) return;
    const u = new SpeechSynthesisUtterance(clean);
    if (this.selectedVoice) u.voice = this.selectedVoice;
    u.lang = 'es-ES';
    u.rate = 1.05;
    u.pitch = 0.95;
    this.isPaused = false;
    this.synth.speak(u);
    this.currentUtterance = u;
  }

  pauseSpeaking() {
    if (this.synth && this.synth.speaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  resumeSpeaking() {
    if (this.synth && this.synth.paused && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  stopSpeaking() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.isPaused = false;
    }
  }
}

window.agroAudio = new AgroAudioSystem();
