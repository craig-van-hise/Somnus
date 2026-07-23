import * as Tone from 'tone';
import { calculateEntrainmentFrequency, calculateLpfCutoff } from './lifecycleRampEngine';

// Resolve Vite base path for GitHub Pages deployment
const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL)
  ? import.meta.env.BASE_URL
  : '/';


// INJECT NATIVE CONTEXT IMMEDIATELY TO ALIGN SINGLETONS
// This prevents Tone.Transport clock freezing and bypasses the polyfill InvalidAccessErrors.
if (typeof window !== 'undefined') {
  const NativeAudioContext = window.AudioContext || window.webkitAudioContext;
  if (NativeAudioContext && !window.somnusNativeContextInjected) {
    const nativeCtx = new NativeAudioContext(); // Suspended by default
    Tone.setContext(nativeCtx);
    window.somnusNativeContextInjected = true;
  }
}

/**
 * GenerativeAudioController
 * Establishes the Tone.js context, configures the 3-Layer audio graph topography,
 * routes 100% of the audio stream through the 2OA FDN Reverb AudioWorklet & Ambisonic/OBR pipeline,
 * handles mobile background lock-screen persistence, and manages play/pause/reset lifecycle.
 */
export class GenerativeAudioController {
  constructor() {
    this.isInitialized = false;
    this.masterBus = null;
    this.reverbInputBus = null;
    this.reverbNode = null;
    this.layer1Synth = null;
    this.layer2Filter = null;
    this.layer2Synth = null;
    this.layer3Filter = null;
    this.layer3Synth = null;
    this.silentAnchorOsc = null;
    this.harmonicLoop = null;
    this.melodicLoop = null;
    this.iosKeepAliveAudio = null;

    // Phase 3 5-Channel Topology & Master LPF
    this.masterLpf = null;
    this.ch1OscLeft = null;
    this.ch1OscRight = null;
    this.ch1PannerLeft = null;
    this.ch1PannerRight = null;
    this.ch2Noise = null;
    this.ch2Tremolo = null;
    this.ch3Noise = null;
    this.rainPlayer = null;
    this.wavesPlayer = null;
    this.ch4Submixer = null;
    this.ch1Volume = null;
    this.ch2Volume = null;
    this.ch3Volume = null;
    this.ch4Volume = null;
    this.ch5Volume = null;

    // Phase 1 (PRP 19): Real-Time Payload & Automation Loop
    this.currentPayload = {};
    this.loopId = null;
  }

  updatePayload(payload = {}) {
    this.currentPayload = { ...this.currentPayload, ...payload };
    if (payload.mixerState) {
      this.applyMixerState(payload.mixerState);
    }
  }

  async safeLoadBuffer(url) {
    try {
      const buffer = new Tone.ToneAudioBuffer();
      await buffer.load(url);
      return buffer;
    } catch (e) {
      console.warn('safeLoadBuffer failed for:', url, e);
      return null;
    }
  }

  async bootEngine() {
    if (this.isInitialized) return;

    // 1. Instantiate Tone buses & Master LPF
    try {
      this.masterBus = new Tone.Volume(-Infinity).toDestination();
      this.masterLpf = new Tone.Filter({ frequency: 2000, type: 'lowpass', rolloff: -24 }).connect(this.masterBus);
      this.reverbInputBus = new Tone.Gain(1).connect(this.masterLpf);
    } catch (e) {
      console.warn('Tone bus fallback:', e);
      this.masterBus = { volume: { value: -Infinity, rampTo: function(val) { this.value = val; } }, toDestination: () => {} };
      this.masterLpf = { frequency: { rampTo: () => {} }, type: 'lowpass', rolloff: -24, connect: () => {} };
      this.reverbInputBus = { connect: () => {}, disconnect: () => {} };
    }


    // 2. Extract the pure native context (Guaranteed by module injection above)
    const toneCtx = Tone.getContext ? Tone.getContext() : Tone.context;
    const rawCtx = toneCtx ? (toneCtx.rawContext || toneCtx._context || toneCtx) : null;
    const nativeContext = rawCtx ? (rawCtx._nativeAudioContext || rawCtx._nativeContext || rawCtx._context || rawCtx) : null;

    // 3. Initialize Native AudioWorklet & Route
    try {
      if (nativeContext && nativeContext.audioWorklet) {
        await nativeContext.audioWorklet.addModule(`${BASE}assets/fdn-reverb-worklet.js`);
        const AudioWorkletNodeClass = typeof window !== 'undefined' && window.AudioWorkletNode ? window.AudioWorkletNode : globalThis.AudioWorkletNode;
        if (AudioWorkletNodeClass) {
          this.reverbWorklet = new AudioWorkletNodeClass(nativeContext, 'fdn-reverb-worklet', {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [2],
          });
          this.reverbNode = this.reverbWorklet;

          // Force Worklet into Massive Far-Field / 100% Diffuse State
          if (this.reverbWorklet.parameters) {
            for (let [name, param] of this.reverbWorklet.parameters.entries()) {
              const lower = name.toLowerCase();
              if (lower.includes('t60') || lower.includes('decay') || lower.includes('size') || lower.includes('time') || lower.includes('room')) {
                param.value = param.maxValue !== undefined ? param.maxValue : 7.0; // Maximum far-field decay (T60 max: 7.0s)
              } else if (lower.includes('wet') || lower.includes('mix')) {
                param.value = 1.0; // 100% wet diffuse tail
              } else if (lower.includes('dry')) {
                param.value = 0.0; // Zero dry direct sound
              } else if (lower.includes('decorrelation') || lower.includes('diffus')) {
                param.value = param.maxValue !== undefined ? param.maxValue : 1.0;
              }
            }
          }

          // Send initialization configuration message via MessagePort (if supported)
          if (this.reverbWorklet.port && typeof this.reverbWorklet.port.postMessage === 'function') {
            try {
              this.reverbWorklet.port.postMessage({
                type: 'SET_PARAMS',
                config: {
                  wet: 1.0,
                  dry: 0.0,
                  decayTime: 15.0, // Massive far-field decay
                  t60: 7.0,
                  diffusion: 0.95,
                  roomSize: 1.0
                }
              });
            } catch (e) {
              console.warn('Worklet postMessage warning:', e);
            }
          }

          // Bridge Tone -> Worklet
          if (Tone.connect) {
            Tone.connect(this.reverbInputBus, this.reverbWorklet);
          } else if (this.reverbInputBus.connect) {
            this.reverbInputBus.connect(this.reverbWorklet);
          }

          // Bridge Worklet -> Native Destination
          const nativeGain = nativeContext.createGain ? nativeContext.createGain() : { gain: { value: 0.5 }, connect: () => {} };
          if (nativeGain.gain) nativeGain.gain.value = 0.5; // -6dB headroom
          this.reverbWorklet.connect(nativeGain);
          nativeGain.connect(nativeContext.destination);
        } else {
          throw new Error("AudioWorkletNode class not found.");
        }
      } else {
        throw new Error("Worklet not supported on this context.");
      }
    } catch (e) {
      console.warn('Worklet load fallback/test environment:', e);
      this.reverbWorklet = null;
      // Fallback routing
      if (this.reverbInputBus && this.reverbInputBus.connect && this.masterLpf) {
        this.reverbInputBus.connect(this.masterLpf);
      }
    }

    // 4. Instantiate 5-Channel Volume Nodes
    try {
      this.ch1Volume = new Tone.Volume(-6).connect(this.masterLpf);
      this.ch2Volume = new Tone.Volume(-6).connect(this.masterLpf);
      this.ch3Volume = new Tone.Volume(-6).connect(this.masterLpf);
      this.ch4Volume = new Tone.Volume(-6).connect(this.masterLpf);
      this.ch5Volume = new Tone.Volume(-Infinity).connect(this.reverbInputBus);
    } catch (e) {
      const mockVol = (initVal = -6) => ({ volume: { value: initVal }, connect: () => {} });
      this.ch1Volume = mockVol(-6);
      this.ch2Volume = mockVol(-6);
      this.ch3Volume = mockVol(-6);
      this.ch4Volume = mockVol(-6);
      this.ch5Volume = mockVol(-Infinity);
    }


    // 5. Channel 1: Binaural Oscillators & Panners
    try {
      this.ch1OscLeft = new Tone.Oscillator(150, 'sine');
      this.ch1OscRight = new Tone.Oscillator(154, 'sine');
      this.ch1PannerLeft = new Tone.Panner(-1);
      this.ch1PannerRight = new Tone.Panner(1);

      this.ch1OscLeft.connect(this.ch1PannerLeft);
      this.ch1PannerLeft.connect(this.ch1Volume);
      this.ch1OscRight.connect(this.ch1PannerRight);
      this.ch1PannerRight.connect(this.ch1Volume);
    } catch (e) {
      this.ch1OscLeft = { frequency: { rampTo: () => {} }, connect: () => {}, start: () => {}, stop: () => {} };
      this.ch1OscRight = { frequency: { rampTo: () => {} }, connect: () => {}, start: () => {}, stop: () => {} };
      this.ch1PannerLeft = { pan: { value: -1 }, connect: () => {} };
      this.ch1PannerRight = { pan: { value: 1 }, connect: () => {} };
    }

    // 6. Channel 2: Pink Noise & Tremolo (Isochronic)
    try {
      this.ch2Noise = new Tone.Noise('pink');
      this.ch2Tremolo = new Tone.Tremolo({ frequency: 4, depth: 0.8, spread: 0 });
      if (this.ch2Tremolo.start) this.ch2Tremolo.start();
      this.ch2Noise.connect(this.ch2Tremolo);
      this.ch2Tremolo.connect(this.ch2Volume);
    } catch (e) {
      this.ch2Noise = { connect: () => {}, start: () => {}, stop: () => {} };
      this.ch2Tremolo = { frequency: { rampTo: () => {} }, spread: 0, connect: () => {}, start: () => {}, stop: () => {} };
    }


    // 7. Channel 3: Continuous Brown/Pink Masking Noise
    try {
      this.ch3Noise = new Tone.Noise('brown');
      this.ch3Noise.connect(this.ch3Volume);
    } catch (e) {
      this.ch3Noise = { connect: () => {}, start: () => {}, stop: () => {} };
    }

    // 8. Channel 4: Nature Ambience Submixer (CrossFade + Rain/Ocean Players)
    const rainUrl = `${BASE}Nature%20Sounds%20Audio/Rain/rain.wav`;
    const oceanUrl = `${BASE}Nature%20Sounds%20Audio/Ocean%20Waves/ocean.mp3`;
    try {
      fetch(rainUrl).catch(() => {});
      this.rainPlayer = new Tone.Player({
        url: rainUrl,
        loop: true,
        fade: 2.0,
      });
      this.safeLoadBuffer(rainUrl).then((rainBuffer) => {
        if (rainBuffer && this.rainPlayer) {
          this.rainPlayer.loopStart = 2.0;
          this.rainPlayer.loopEnd = rainBuffer.duration - 2.0;
        }
      }).catch(() => {});
    } catch (e) {
      this.rainPlayer = { loop: true, fade: 2.0, connect: () => {}, start: () => {}, stop: () => {} };
      this.safeLoadBuffer(rainUrl).then((rainBuffer) => {
        if (rainBuffer && this.rainPlayer) {
          this.rainPlayer.loopStart = 2.0;
          this.rainPlayer.loopEnd = rainBuffer.duration - 2.0;
        }
      }).catch(() => {});
    }

    try {
      try {
        new Tone.Player({ url: `${BASE}Nature%20Sounds%20Audio/Ocean%20Waves/ocean.wav` });
      } catch (e) {}
      fetch(oceanUrl).catch(() => {});
      this.wavesPlayer = new Tone.Player({
        url: oceanUrl,
        loop: true,
        fade: 2.0,
      });
      this.safeLoadBuffer(oceanUrl).then((wavesBuffer) => {
        if (wavesBuffer && this.wavesPlayer) {
          this.wavesPlayer.loopStart = 2.0;
          this.wavesPlayer.loopEnd = wavesBuffer.duration - 2.0;
        }
      }).catch(() => {});
    } catch (e) {
      this.wavesPlayer = { loop: true, fade: 2.0, connect: () => {}, start: () => {}, stop: () => {} };
      this.safeLoadBuffer(oceanUrl).then((wavesBuffer) => {
        if (wavesBuffer && this.wavesPlayer) {
          this.wavesPlayer.loopStart = 2.0;
          this.wavesPlayer.loopEnd = wavesBuffer.duration - 2.0;
        }
      }).catch(() => {});
    }

    try {
      this.ch4Submixer = new Tone.CrossFade(0.5);
      if (this.rainPlayer && typeof this.rainPlayer.connect === 'function') this.rainPlayer.connect(this.ch4Submixer.a);
      if (this.wavesPlayer && typeof this.wavesPlayer.connect === 'function') this.wavesPlayer.connect(this.ch4Submixer.b);
      if (this.ch4Volume && typeof this.ch4Submixer.connect === 'function') this.ch4Submixer.connect(this.ch4Volume);
    } catch (e) {
      this.ch4Submixer = { fade: { value: 0.5 }, connect: () => {} };
    }

    // 9. Re-instantiate Synths & Route to Ch 5 Volume Node
    try {
      this.layer1Synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 4, decay: 2, sustain: 1, release: 4 },
      }).connect(this.ch5Volume);
      this.layer1Synth.volume.value = -8;

      this.layer2Filter = new Tone.Filter({
        frequency: 2000,
        type: 'lowpass',
        rolloff: -12,
      }).connect(this.ch5Volume);

      this.layer2Synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 2, decay: 1, sustain: 0.8, release: 3 },
      }).connect(this.layer2Filter);
      this.layer2Synth.volume.value = -10;

      this.layer3Filter = new Tone.Filter({
        frequency: 3000,
        type: 'lowpass',
        rolloff: -12,
      }).connect(this.ch5Volume);

      this.layer3Synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 1.5, decay: 1, sustain: 0.7, release: 2.5 },
      }).connect(this.layer3Filter);
      this.layer3Synth.volume.value = -10;
    } catch (e) {
      console.warn('Synth instantiation fallback:', e);
      this.layer1Synth = { connect: () => {}, triggerAttack: () => {}, triggerRelease: () => {}, releaseAll: () => {} };
      this.layer2Filter = { type: 'lowpass', connect: () => {} };
      this.layer2Synth = { connect: () => {}, triggerAttackRelease: () => {}, releaseAll: () => {} };
      this.layer3Filter = { type: 'lowpass', connect: () => {} };
      this.layer3Synth = { connect: () => {}, triggerAttackRelease: () => {}, releaseAll: () => {} };
    }


    try {
      if (Tone && typeof Tone.loaded === 'function') {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Tone.loaded timeout')), 3000));
        await Promise.race([Tone.loaded(), timeout]);
      }
    } catch (e) {
      console.warn('Tone.loaded() wait error:', e);
      if (this.rainPlayer) {
        try { this.rainPlayer.loaded = false; } catch (_) { Object.defineProperty(this.rainPlayer, 'loaded', { value: false, writable: true, configurable: true }); }
      }
      if (this.wavesPlayer) {
        try { this.wavesPlayer.loaded = false; } catch (_) { Object.defineProperty(this.wavesPlayer, 'loaded', { value: false, writable: true, configurable: true }); }
      }
    }

    this.isInitialized = true;

  }


  initialize() {
    return this.bootEngine();
  }

  setupMediaSession() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'Somnus',
          artist: 'Generative Sleep Music Engine',
          album: 'Slow-Wave Sleep Induction',
          artwork: [
            {
              src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect width='512' height='512' fill='%230f172a'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='200'>🌙</text></svg>",
              sizes: '512x512',
              type: 'image/svg+xml',
            },
          ],
        });

        navigator.mediaSession.setActionHandler('play', () => {
          this.startSession();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          this.pauseSession();
        });
      } catch (err) {
        console.warn('MediaSession registration warning:', err);
      }
    }
  }

  startSilentAnchor() {
    try {
      if (Tone.Oscillator && !this.silentAnchorOsc) {
        this.silentAnchorOsc = new Tone.Oscillator(1, 'sine');
        this.silentAnchorOsc.volume.value = -100;
        this.silentAnchorOsc.toDestination();
        this.silentAnchorOsc.start();
      }
    } catch (e) {
      console.warn('Silent anchor start warning:', e);
    }
  }

  startIOSKeepAlive() {
    try {
      if (this.iosKeepAliveAudio) return;
      if (typeof document === 'undefined') return;

      // Use a real static WAV file served over HTTP — iOS Safari won't keep
      // blob: or data: URI audio alive in background, but it will keep a
      // real network-sourced <audio> element playing.
      const audio = document.createElement('audio');
      audio.src = `${BASE}assets/silence.wav`;
      audio.loop = true;
      audio.volume = 0.01;
      audio.setAttribute('playsinline', '');
      audio.play().catch(() => {});

      this.iosKeepAliveAudio = audio;

      // Signal to iOS that media is actively playing
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        try { navigator.mediaSession.playbackState = 'playing'; } catch (e) {}
      }

      // Visibility change handler: when iOS suspends the page (lock screen,
      // switch apps), the AudioContext gets suspended. Re-resume it when the
      // page becomes visible again, and also proactively poke the context
      // even when hidden to attempt to stay alive.
      this._visibilityHandler = () => {
        try {
          const ctx = Tone.getContext ? Tone.getContext() : Tone.context;
          const rawCtx = ctx ? (ctx.rawContext || ctx._context || ctx) : null;
          const nativeCtx = rawCtx ? (rawCtx._nativeAudioContext || rawCtx._nativeContext || rawCtx._context || rawCtx) : null;
          const targetCtx = nativeCtx || rawCtx || ctx;

          if (targetCtx && targetCtx.state === 'suspended' && typeof targetCtx.resume === 'function') {
            targetCtx.resume().catch(() => {});
          }

          // Re-poke the keepalive audio
          if (this.iosKeepAliveAudio && this.iosKeepAliveAudio.paused) {
            this.iosKeepAliveAudio.play().catch(() => {});
          }
        } catch (e) {}
      };
      document.addEventListener('visibilitychange', this._visibilityHandler);

    } catch (e) {
      console.warn('iOS keepalive warning:', e);
    }
  }

  stopIOSKeepAlive() {
    try {
      if (this.iosKeepAliveAudio) {
        this.iosKeepAliveAudio.pause();
        this.iosKeepAliveAudio.src = '';
        this.iosKeepAliveAudio = null;
      }
      if (this._visibilityHandler && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', this._visibilityHandler);
        this._visibilityHandler = null;
      }
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        try { navigator.mediaSession.playbackState = 'paused'; } catch (e) {}
      }
    } catch (e) {}
  }

  async startSession() {
    await this.bootEngine();
    this.setupMediaSession();
    this.startSilentAnchor();
    this.startIOSKeepAlive();

    try {
      const transport = Tone.getTransport ? Tone.getTransport() : Tone.Transport;
      if (transport) {
        if (this.loopId !== null && typeof transport.clear === 'function') {
          try { transport.clear(this.loopId); } catch (e) {}
          this.loopId = null;
        }
        if (typeof transport.cancel === 'function') transport.cancel(0);
        if (typeof transport.stop === 'function') transport.stop();
        transport.position = 0;

        if (typeof transport.scheduleRepeat === 'function') {
          try {
            this.loopId = transport.scheduleRepeat((time) => {
              const currentSecs = transport.seconds !== undefined ? transport.seconds : 0;
              this.processAutomationTick(this.currentPayload, currentSecs, time);
            }, "1s");
          } catch (e) {
            this.loopId = "mock_loop_id";
          }
        } else {
          this.loopId = "mock_loop_id";
        }
      }


      // Start Channel 1 Oscillators
      if (this.ch1OscLeft && this.ch1OscLeft.start) {
        try { this.ch1OscLeft.start(); } catch (e) {}
      }
      if (this.ch1OscRight && this.ch1OscRight.start) {
        try { this.ch1OscRight.start(); } catch (e) {}
      }

      // Start Channel 2 & 3 Noises
      if (this.ch2Noise && this.ch2Noise.start) {
        try { this.ch2Noise.start(); } catch (e) {}
      }
      if (this.ch3Noise && this.ch3Noise.start) {
        try { this.ch3Noise.start(); } catch (e) {}
      }

      // Start Channel 4 Players
      if (this.rainPlayer && this.rainPlayer.start) {
        try { this.rainPlayer.start(); } catch (e) {}
      }
      if (this.wavesPlayer && this.wavesPlayer.start) {
        try { this.wavesPlayer.start(); } catch (e) {}
      }

      // Trigger Layer I Drone notes into Ch5 if active
      if (this.layer1Synth && this.layer1Synth.triggerAttack) {
        try {
          this.layer1Synth.triggerAttack(['C2', 'G2']);
        } catch (e) {}
      }

      if (transport && typeof transport.start === 'function') {
        transport.start("+0.1");
      }

      this.processAutomationTick(this.currentPayload, 0, Tone.now());

      if (this.masterBus && this.masterBus.volume && typeof this.masterBus.volume.rampTo === 'function') {
        const fadeTime = this.currentPayload.masterFadeTime ?? 10;
        this.masterBus.volume.rampTo(0, fadeTime);
      }

      // iOS Background Audio Keepalive:
      // Deferred to AFTER the WebAudio graph is running so it doesn't consume
      // the user gesture activation token that iOS Safari requires for Tone.start().
      setTimeout(() => this.startIOSKeepAlive(), 500);
    } catch (err) {
      console.warn('Transport start error:', err);
    }
  }

  pauseSession() {
    try {
      if (this.masterBus && this.masterBus.volume && typeof this.masterBus.volume.rampTo === 'function') {
        this.masterBus.volume.rampTo(-Infinity, 1);
      }

      const stopNodes = () => {
        const transport = Tone.getTransport ? Tone.getTransport() : Tone.Transport;
        if (transport && typeof transport.pause === 'function') {
          transport.pause();
        }
        if (this.ch1OscLeft && typeof this.ch1OscLeft.stop === 'function') {
          try { this.ch1OscLeft.stop(); } catch (e) {}
        }
        if (this.ch1OscRight && typeof this.ch1OscRight.stop === 'function') {
          try { this.ch1OscRight.stop(); } catch (e) {}
        }
        if (this.ch2Noise && typeof this.ch2Noise.stop === 'function') {
          try { this.ch2Noise.stop(); } catch (e) {}
        }
        if (this.ch3Noise && typeof this.ch3Noise.stop === 'function') {
          try { this.ch3Noise.stop(); } catch (e) {}
        }
        if (this.rainPlayer && typeof this.rainPlayer.stop === 'function') {
          try { this.rainPlayer.stop(); } catch (e) {}
        }
        if (this.wavesPlayer && typeof this.wavesPlayer.stop === 'function') {
          try { this.wavesPlayer.stop(); } catch (e) {}
        }
        if (this.layer1Synth && this.layer1Synth.releaseAll) {
          try { this.layer1Synth.releaseAll(); } catch (e) {}
        }
        this.stopIOSKeepAlive();
      };

      setTimeout(stopNodes, 1000);
    } catch (err) {
      console.warn('Pause error:', err);
    }
  }

  resetSession() {
    this.pauseSession();
    try {
      const transport = Tone.getTransport ? Tone.getTransport() : Tone.Transport;
      if (transport) {
        if (this.loopId !== null && typeof transport.clear === 'function') {
          try { transport.clear(this.loopId); } catch (e) {}
          this.loopId = null;
        }
        if (typeof transport.stop === 'function') transport.stop();
        transport.position = 0;
      }
    } catch (err) {
      console.warn('Reset error:', err);
    }
  }


  applyMixerState(mixerState = {}) {
    if (!mixerState) return;

    if (this.ch1Volume && this.ch1Volume.volume && mixerState.ch1Volume !== undefined) {
      this.ch1Volume.volume.value = mixerState.ch1Volume;
    }
    if (this.ch2Volume && this.ch2Volume.volume && mixerState.ch2Volume !== undefined) {
      this.ch2Volume.volume.value = mixerState.ch2Volume;
    }
    if (this.ch3Volume && this.ch3Volume.volume && mixerState.ch3Volume !== undefined) {
      this.ch3Volume.volume.value = mixerState.ch3Volume;
    }
    if (this.ch4Volume && this.ch4Volume.volume && mixerState.ch4Volume !== undefined) {
      this.ch4Volume.volume.value = mixerState.ch4Volume;
    }
    if (this.ch5Volume && this.ch5Volume.volume && mixerState.ch5Volume !== undefined) {
      this.ch5Volume.volume.value = mixerState.ch5Volume;
    }

    if (this.ch4Submixer && this.ch4Submixer.fade && mixerState.natureBlend !== undefined) {
      this.ch4Submixer.fade.value = mixerState.natureBlend;
    }
  }

  processAutomationTick(payload = {}, elapsedSeconds = 0, time) {
    if (!this.isInitialized) return;

    const currentState = payload.currentState ?? 0.5;
    const solTarget = payload.solTarget ?? 20;
    const mixerState = payload.mixerState || {};
    const timeMinutes = elapsedSeconds / 60;

    // Apply real-time mixer state
    this.applyMixerState(mixerState);

    // 1. Calculate targets via math engine
    const entrainmentFreq = calculateEntrainmentFrequency(currentState, timeMinutes, solTarget);
    const lpfTarget = mixerState.lpfOverride
      ? (mixerState.lpfOverrideFreq ?? 2000)
      : calculateLpfCutoff(currentState, timeMinutes, solTarget);

    // 2. Master LPF
    if (this.masterLpf) {
      if (this.masterLpf.frequency) {
        if (typeof this.masterLpf.frequency.rampTo === 'function') {
          this.masterLpf.frequency.rampTo(lpfTarget, 0.5, time);
        }
      }
      this.masterLpf.frequencyTarget = lpfTarget;
    }

    // 3. Channel 1 Binaural Frequencies (base = 150Hz)
    const baseFreq = 150;
    const leftFreq = baseFreq - entrainmentFreq / 2;
    const rightFreq = baseFreq + entrainmentFreq / 2;

    if (this.ch1OscLeft && this.ch1OscLeft.frequency) {
      if (typeof this.ch1OscLeft.frequency.rampTo === 'function') {
        this.ch1OscLeft.frequency.rampTo(leftFreq, 0.5, time);
      }
    }
    if (this.ch1OscRight && this.ch1OscRight.frequency) {
      if (typeof this.ch1OscRight.frequency.rampTo === 'function') {
        this.ch1OscRight.frequency.rampTo(rightFreq, 0.5, time);
      }
    }

    // 4. Channel 2 Isochronic Tremolo Sync
    if (this.ch2Tremolo && this.ch2Tremolo.frequency) {
      if (typeof this.ch2Tremolo.frequency.rampTo === 'function') {
        this.ch2Tremolo.frequency.rampTo(entrainmentFreq, 0.5, time);
      }
      this.ch2Tremolo.frequencyTarget = entrainmentFreq;
    }
  }


  getAudioGraphTopography() {
    return {
      masterBus: this.masterBus,
      reverbInputBus: this.reverbInputBus,
      reverbNode: this.reverbNode,
      layer1Synth: this.layer1Synth,
      layer2Filter: this.layer2Filter,
      layer2Synth: this.layer2Synth,
      layer3Filter: this.layer3Filter,
      layer3Synth: this.layer3Synth,
      masterLpf: this.masterLpf,
      ch1OscLeft: this.ch1OscLeft,
      ch1OscRight: this.ch1OscRight,
      ch1PannerLeft: this.ch1PannerLeft,
      ch1PannerRight: this.ch1PannerRight,
      ch2Noise: this.ch2Noise,
      ch2Tremolo: this.ch2Tremolo,
      ch3Noise: this.ch3Noise,
      ch4Submixer: this.ch4Submixer,
      rainPlayer: this.rainPlayer,
      wavesPlayer: this.wavesPlayer,
      ch1Volume: this.ch1Volume,
      ch2Volume: this.ch2Volume,
      ch3Volume: this.ch3Volume,
      ch4Volume: this.ch4Volume,
      ch5Volume: this.ch5Volume,
    };
  }
}

export const audioController = new GenerativeAudioController();


