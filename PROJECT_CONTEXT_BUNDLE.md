### FILE: project_tree.txt


/Users/vv2024/Documents/Repos - vv2024/Somnus
├── FAILURE_REPORT.md
├── Foundational Docs
|  ├── # 1 Somnus- A Generative Sleep Music Mobile Web Application- Product Goals & Vision Document.txt
|  ├── # 2 Somnus - Frontend & Architecture Specification Sheet- Somnus.txt
|  ├── # 3 Somnus - Generative Sleep Music Engine- Technical Specifications.txt
|  ├── # 4 Somnus - Software Specification Sheet- Generative Sleep Music Synthesis Engine.txt
|  ├── # 5 Somnus - Comprehensive Engineering Specification- 2OA Sleep FDN Reverb Engine.txt
|  ├── # Product Requirements Document- Somnus.txt
|  └── GUI mockup.png
├── PROJECT_CONTEXT_BUNDLE.md
├── PROJECT_STATE.md
├── README.md
├── index.html
├── llms.txt
├── package-lock.json
├── package.json
├── project_tree.txt
├── public
|  ├── Nature Sounds Audio
|  |  ├── Ocean Waves
|  |  |  └── ocean.mp3
|  |  └── Rain
|  |     └── rain.wav
|  └── assets
|     ├── fdn-reverb-worklet.js
|     └── silence.wav
├── src
|  ├── App.jsx
|  ├── components
|  |  ├── AudioSuspendedOverlay.jsx
|  |  ├── PlayButton.jsx
|  |  ├── SettingsModal.jsx
|  |  └── Sliders.jsx
|  ├── context
|  |  └── AppContext.jsx
|  ├── engine
|  |  ├── GenerativeAudioController.js
|  |  ├── fdnReverbMath.js
|  |  ├── lifecycleRampEngine.js
|  |  ├── parameterCalculator.js
|  |  └── pitchEngine.js
|  ├── index.css
|  ├── main.jsx
|  ├── services
|  |  └── assetLoader.js
|  └── test
|     ├── phase1.test.jsx
|     ├── phase1_clock_integrity.test.jsx
|     ├── phase1_custom_fade.test.jsx
|     ├── phase1_decoding.test.jsx
|     ├── phase1_extension.test.jsx
|     ├── phase1_hydration.test.jsx
|     ├── phase1_loop.test.jsx
|     ├── phase1_lpf_floor.test.js
|     ├── phase1_lpf_math.test.js
|     ├── phase2.test.js
|     ├── phase2_app_bridge.test.jsx
|     ├── phase2_buffer_insetting.test.jsx
|     ├── phase2_gentle_fade.test.jsx
|     ├── phase2_lifecycle.test.jsx
|     ├── phase2_pretick.test.jsx
|     ├── phase2_timing.test.jsx
|     ├── phase2_vite_config.test.js
|     ├── phase3.test.jsx
|     ├── phase3_buffers.test.jsx
|     ├── phase3_cicd_pipeline.test.js
|     ├── phase3_persistence.test.jsx
|     ├── phase3_pretick.test.jsx
|     ├── phase3_reverb_routing.test.jsx
|     ├── phase3_url_encoding.test.jsx
|     ├── phase4.test.js
|     ├── phase4_prp17.test.jsx
|     ├── phase5.test.js
|     ├── phase5_prp17.test.jsx
|     ├── phase6.test.js
|     ├── prp18_phase1.test.js
|     ├── prp18_phase2.test.jsx
|     ├── prp18_phase3.test.js
|     └── setup.js
└── vite.config.js

directory: 493 file: 4283

ignored: directory (72)


[2K[1G

### FILE: PROJECT_STATE.md

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


### FILE: README.md

# Somnus — Generative Sleep Music Mobile Web Application

Somnus is a mobile web application designed to provide a non-pharmacological auditory intervention for sleep induction and maintenance. It uses a generative music engine to personalize an audio stream that smoothly guides users from cognitive hyperarousal into Slow-Wave Sleep (SWS) by stabilizing the cortical environment.

## Quick Start

### Installation
Ensure you have Node.js (v18+) installed. Clone the repository and install dependencies:
```bash
npm install
```

### Run Locally (Development Server)
Launch the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) (or the port specified in console) in your browser.

### Run Automated Tests
Execute the Vitest TDD suites across all 6 phases:
```bash
npm test
```

## Project Structure
```
├── Foundational Docs       # Technical & Product Specifications
├── PRPs                    # Phased Development Plan steps
├── public/assets           # Static assets, AudioWorklets, & WebAssembly binaries
└── src
    ├── components          # UI elements (PlayButton, Sliders, Overlays)
    ├── context             # Centralized React state management (AppContext)
    ├── engine              # Audio generation, pitch Markov, & lifecycle engines
    ├── services            # Asset preloading Gatekeeper services
    └── test                # Phase-by-phase TDD Vitest suites
```


