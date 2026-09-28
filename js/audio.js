/**
 * KAUN BANEGA CROREPATI - AUDIO ENGINE
 * Integrates user-provided high quality MP3 tracks:
 * - KBC INTRO WITH MUSIC.mp3
 * - Kaun Banega Crorepati Q1-5, 6, 10, 11, 15 Starting Music.mp3
 * - KBC Timer music_2_second level music for KBC.mp3
 * Plus Web Audio API synthesizers for real-time SFX (Lock, Correct, Wrong, 50:50, Phone, Audience)
 */

class KBCAudioManager {
  constructor() {
    this.isMuted = false;
    this.volume = 0.85;

    // Audio elements for the user MP3s
    this.bgmIntro = new Audio('KBC INTRO WITH MUSIC.mp3');
    this.bgmQuestion = new Audio('Kaun Banega Crorepati Q1-5, 6, 10, 11, 15 Starting Music.mp3');
    this.bgmTimer = new Audio('KBC Timer music_2_second level music for KBC.mp3');

    this.bgmTimer.loop = true;

    // Apply default volumes
    [this.bgmIntro, this.bgmQuestion, this.bgmTimer].forEach(audio => {
      audio.volume = this.volume;
      audio.preload = 'auto';
    });

    // Web Audio API context for zero-latency reactive sound effects
    this.audioCtx = null;
    this.initWebAudioOnGesture();
  }

  initWebAudioOnGesture() {
    const unlock = () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };

    document.addEventListener('click', unlock, { once: false });
    document.addEventListener('keydown', unlock, { once: false });
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    [this.bgmIntro, this.bgmQuestion, this.bgmTimer].forEach(a => {
      a.volume = this.volume;
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    [this.bgmIntro, this.bgmQuestion, this.bgmTimer].forEach(a => {
      a.muted = this.isMuted;
    });
    return this.isMuted;
  }

  stopAllBgm() {
    [this.bgmIntro, this.bgmQuestion, this.bgmTimer].forEach(a => {
      a.pause();
      a.currentTime = 0;
    });
  }

  playIntro() {
    if (this.isMuted) return;
    this.stopAllBgm();
    this.bgmIntro.currentTime = 0;
    this.bgmIntro.play().catch(e => console.log('Intro autoplay prevented:', e));
  }

  playQuestionMusic() {
    if (this.isMuted) return;
    this.stopAllBgm();
    this.bgmQuestion.currentTime = 0;
    this.bgmQuestion.play().catch(e => console.log('Question music prevented:', e));
  }

  playTimerMusic() {
    if (this.isMuted) return;
    // Don't restart if already playing
    if (this.bgmTimer.paused) {
      this.bgmTimer.currentTime = 0;
      this.bgmTimer.play().catch(e => console.log('Timer music prevented:', e));
    }
  }

  stopTimerMusic() {
    this.bgmTimer.pause();
    this.bgmTimer.currentTime = 0;
  }

  pauseTimerMusic() {
    this.bgmTimer.pause();
  }

  resumeTimerMusic() {
    if (this.isMuted) return;
    this.bgmTimer.play().catch(e => console.log('Resume timer music error:', e));
  }

  // ==========================================
  // Web Audio API Synthesizers for Instant SFX
  // ==========================================

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Tension-building Lock Sound
  playLockSound() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Low sinister pulse + rising tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now); // A2
    osc.frequency.exponentialRampToValueAtTime(164.8, now + 0.35); // E3

    // Lowpass filter for broadcast warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4 * this.volume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.9);
  }

  // Triumphant Correct Answer Flourish
  playCorrectSound() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.stopTimerMusic();
    const now = ctx.currentTime;

    // Chord: C major / F major arpeggiated triumph
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.3 * this.volume, now + idx * 0.06 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 1.3);
    });
  }

  // Dramatic Wrong Answer Buzzer / Gong
  playWrongSound() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.stopTimerMusic();
    const now = ctx.currentTime;

    // Dissonant descending tritone
    const freqs = [138.59, 130.81, 92.50]; // Low C# to C and F#
    freqs.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 0.75, now + 1.2);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.45 * this.volume, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.5);
    });
  }

  // 50:50 Lifeline Dissolve Effect
  playLifeline5050() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.4);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Telephone Ring for Phone-a-Friend
  playPhoneRing() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Dual tone 440Hz + 480Hz
    [440, 480].forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = f;

      // Ring burst 1
      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.setValueAtTime(0.15 * this.volume, now + 0.4);
      gain.gain.setValueAtTime(0, now + 0.45);
      // Ring burst 2
      gain.gain.setValueAtTime(0.15 * this.volume, now + 0.65);
      gain.gain.setValueAtTime(0.15 * this.volume, now + 1.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.3);
    });
  }

  // Audience Drumroll / Tension
  playAudienceDrumroll() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.8);
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35 * this.volume, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.85);
  }
}

// Global audio singleton
const kbcAudio = new KBCAudioManager();
