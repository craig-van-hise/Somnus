# Project State: Somnus

## 1. Architecture & Project Structure
```
/Users/vv2024/Documents/Repos - vv2024/Somnus
├── FAILURE_REPORT.md
├── Foundational Docs
│   ├── # 1 Somnus- A Generative Sleep Music Mobile Web Application- Product Goals & Vision Document.txt
│   ├── # 2 Somnus - Frontend & Architecture Specification Sheet- Somnus.txt
│   ├── # 3 Somnus - Generative Sleep Music Engine- Technical Specifications.txt
│   ├── # 4 Somnus - Software Specification Sheet- Generative Sleep Music Synthesis Engine.txt
│   ├── # 5 Somnus - Comprehensive Engineering Specification- 2OA Sleep FDN Reverb Engine.txt
│   ├── # Product Requirements Document- Somnus.txt
│   └── GUI mockup.png
├── PROJECT_CONTEXT_BUNDLE.md
├── PROJECT_STATE.md
├── PRPs
│   ├── # 16.md ... # 26.md
│   └── xOlder
├── README.md
├── index.html
├── llms.txt
├── package.json
├── public
│   ├── Nature Sounds Audio
│   │   ├── Ocean Waves
│   │   └── Rain
│   └── assets
│       ├── fdn-reverb-worklet.js
│       └── silence.wav
├── src
│   ├── App.jsx
│   ├── components
│   │   ├── AudioSuspendedOverlay.jsx
│   │   ├── PlayButton.jsx
│   │   ├── SettingsModal.jsx
│   │   └── Sliders.jsx
│   ├── context
│   │   └── AppContext.jsx
│   ├── engine
│   │   ├── GenerativeAudioController.js
│   │   ├── fdnReverbMath.js
│   │   ├── lifecycleRampEngine.js
│   │   ├── parameterCalculator.js
│   │   └── pitchEngine.js
│   ├── index.css
│   ├── main.jsx
│   ├── services
│   │   └── assetLoader.js
│   └── test
└── vite.config.js
```

## 2. Tech Stack
* **Frontend**: React (v18.3.1) SPA built with Vite.
* **Styling**: Tailwind CSS (v4.0.0).
* **Audio Engine**: Tone.js (v15.0.4) paired with Web Audio API & custom AudioWorklet.
* **Testing**: Vitest (v3.0.4) with JSDOM environment.

## 3. Current System Capabilities
* **Frontend GUI Skeleton**: Responsive glassmorphic UI with session controls ("Start Engine" / Pause, Reset), custom full-page scrollable Settings modal for iOS Safari, and touch-optimized slider handles (28px touch target with `touch-action: pan-y`).
* **State Management**: React AppContext holding visual and audio configuration parameters with a 100ms slider debouncing window.
* **Mathematical & Pitch Engine**: Derives BPM/volume ramp targets and pentatonic pitch selections based on sleep depth metrics.
* **3-Layer Synthesis Topography**: Instantiates Layer 1 Drone, Layer 2 Harmonic, and Layer 3 Melodic synths routed through `reverbInputBus`.
* **Nature Sound Ambience**: Incorporates dual-channel looped crossfading playbacks of Rain and Ocean Waves.
* **Base Path Awareness**: All preloads and worklets use the Vite base path prefix (`/Somnus/`) to support reliable assets on GitHub Pages.

---

## 4. Current Work-in-Progress & iOS Safari Issues
We are presently debugging mobile compatibility issues, specifically for iOS Safari (iPhone) when running in production on GitHub Pages:

1. **"Start Engine" Activation Lag/Freeze**:
   * **Symptom**: Pressing the "Start Engine" button locks up/hangs for a long duration with no UI indicator before audio starts or fails.
   * **Cause**: Tone.js's internal promise resolution structure (`Tone.loaded()`) hangs on iOS Safari when preloading audio files or while the browser's audio hardware context initializes under restrictive user gesture scopes.

2. **Nature Sounds Failing to Play**:
   * **Symptom**: In the production web version, the Rain and Ocean waves sounds fail to play.
   * **Cause**: iOS Safari has strict codec and loading requirements. Relative path routing or synchronous resource fetching of large wav/mp3 assets inside Tone.js's `Tone.Player` fails or falls back without resolving the promise on mobile.

3. **Background/Lock Screen Audio Interruption**:
   * **Symptom**: Audio cuts off instantly as soon as the iPhone screen locks or the browser tab goes into the background.
   * **Cause**: iOS Safari aggressively suspends active web audio contexts when tab visibility changes or device lock is triggered. The background keep-alive mechanism (e.g. dummy silent `<audio>` playback loops and `visibilitychange` listeners) needs alignment with native audio sessions.
