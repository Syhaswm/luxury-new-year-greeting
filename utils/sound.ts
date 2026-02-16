/**
 * A lightweight sound synthesizer to avoid external assets.
 * Creates pops, sparkles, and whoosh sounds using Web Audio API.
 */
class SoundFX {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch (e) {
      console.error("AudioContext not supported");
    }
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      // Pre-generate noise buffer for explosions to improve performance
      if (!this.noiseBuffer) {
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      }
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1, slideTo: number | null = null, delay: number = 0) {
    if (!this.ctx || this.isMuted) return;
    
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
    }

    // Envelope: Attack -> Decay
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02); // Short attack
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  public playPop() {
    // Red envelope opening sound - Layered and Impactful
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Layer 1: The Snap (High pitched noise burst for the seal breaking)
    // Uses the noise buffer to simulate paper tearing/crackle
    if (this.noiseBuffer) {
      const snapSrc = this.ctx.createBufferSource();
      snapSrc.buffer = this.noiseBuffer;
      const snapGain = this.ctx.createGain();
      const snapFilter = this.ctx.createBiquadFilter();

      snapFilter.type = 'highpass';
      snapFilter.frequency.value = 3000;
      snapFilter.Q.value = 1;

      snapGain.gain.setValueAtTime(0.5, t);
      snapGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05); // Very quick snap

      snapSrc.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapSrc.start(t);
      snapSrc.stop(t + 0.1);
    }

    // Layer 2: The Body (Richer tone using triangle wave)
    // Triangle wave gives it a "thicker" sound than sine
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(250, t);
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.15); // Upward slide "Bloop"

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);

    // Layer 3: Low Thud (Sine wave)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(150, t);
    subOsc.frequency.linearRampToValueAtTime(100, t + 0.1);

    subGain.gain.setValueAtTime(0.3, t);
    subGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.15);
  }

  public playFireworkLaunch() {
    // Whistle up - Distinct rising tone
    this.playTone(300, 'sine', 0.5, 0.15, 1500);
  }

  public playFireworkExplosion() {
    if (!this.ctx || this.isMuted || !this.noiseBuffer) return;
    const t = this.ctx.currentTime;

    // Layer 1: The Crack (High frequency snap) - Makes it crisp
    const crackSrc = this.ctx.createBufferSource();
    crackSrc.buffer = this.noiseBuffer;
    const crackGain = this.ctx.createGain();
    const crackFilter = this.ctx.createBiquadFilter();
    
    crackFilter.type = 'highpass';
    crackFilter.frequency.value = 1500; // Only highs

    crackGain.gain.setValueAtTime(0.8, t);
    crackGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); // Very short

    crackSrc.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(this.ctx.destination);
    crackSrc.start(t);
    crackSrc.stop(t + 0.1);

    // Layer 2: The Body (Mid-Low frequency) - Gives it punch
    const bodySrc = this.ctx.createBufferSource();
    bodySrc.buffer = this.noiseBuffer;
    const bodyGain = this.ctx.createGain();
    const bodyFilter = this.ctx.createBiquadFilter();

    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(800, t); // Allow some mids for punch

    bodyGain.gain.setValueAtTime(0.5, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    bodySrc.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(this.ctx.destination);
    bodySrc.start(t);
    bodySrc.stop(t + 0.6);

    // Layer 3: The Rumble (Sub-bass) - Gives it weight (optional, keeps it deep)
    const rumbleSrc = this.ctx.createBufferSource();
    rumbleSrc.buffer = this.noiseBuffer;
    const rumbleGain = this.ctx.createGain();
    const rumbleFilter = this.ctx.createBiquadFilter();

    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.value = 200;

    rumbleGain.gain.setValueAtTime(0.6, t);
    rumbleGain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);

    rumbleSrc.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.ctx.destination);
    rumbleSrc.start(t);
    rumbleSrc.stop(t + 1.2);
  }

  public playSparkle() {
    // Magical chime - Arpeggio of sine waves
    // Uses a pentatonic scale-ish structure for a pleasant sound
    const baseFreq = 880; // A5
    const notes = [1, 1.25, 1.5, 2, 2.5]; // Major intervals
    
    notes.forEach((ratio, i) => {
        // Stagger the notes
        this.playTone(baseFreq * ratio, 'sine', 0.5, 0.1, null, i * 0.06);
    });
    
    // Add a little "ting" at the end
    this.playTone(baseFreq * 4, 'sine', 0.8, 0.05, null, 0.3);
  }
}

export const soundFX = new SoundFX();