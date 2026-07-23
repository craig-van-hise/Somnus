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
|  └── assets
|     └── fdn-reverb-worklet.js
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
|     ├── phase2.test.js
|     ├── phase3.test.jsx
|     ├── phase4.test.js
|     ├── phase5.test.js
|     ├── phase6.test.js
|     └── setup.js
└── vite.config.js

directory: 489 file: 4244

ignored: directory (72)


[2K[1G

### FILE: PROJECT_STATE.md

# Project State: Somnus

## 1. Architecture & Project Structure
```
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
├── PRPs
|  ├── # 0.md ... # 16.md
├── README.md
├── index.html
├── llms.txt
├── package.json
├── public
|  └── assets
|     └── fdn-reverb-worklet.js
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
└── vite.config.js
```

## 2. Tech Stack
* **Frontend**: React (v18.3.1) SPA built with Vite.
* **Styling**: Tailwind CSS (v4.0.0).
* **Audio Engine**: Tone.js (v15.0.4) paired with Web Audio API & custom AudioWorklet.
* **Testing**: Vitest (v3.0.4) with JSDOM environment.

## 3. Current System Capabilities
* **Frontend GUI Skeleton**: Responsive glassmorphic UI with session controls (Play/Pause, Reset) and parameter sliders.
* **State Management**: React AppContext holding visual parameters with 100ms debouncing.
* **Mathematical & Pitch Engine**: Derives BPM/volume ramp targets and pentatonic pitch selections.
* **3-Layer Synthesis Topography**: Instantiates Layer 1 Drone, Layer 2 Harmonic, and Layer 3 Melodic synths routed through `reverbInputBus`.

---

## 4. Current Status: Development Paused (Sub-MVP State)
Development has been explicitly paused. While unit tests pass and basic audio routing functions without crashing, the audio generation and spatial processing have not reached MVP standards.

### Unresolved Audio Engine & Neurological Design Issues:
1. **Bass Notes Stagnation**: Bass / drone notes are static and not progressing or moving as intended by the generative sleep engine specifications.
2. **Reverb Spatiality & Room Size**: The FDN reverb tail output remains perceptually small/dry rather than providing the intended massive, 100% wet, diffuse far-field acoustic space.
3. **Unintended Spatial Panning / Movement**: Auditory elements are perceived as moving or panning across the stereo image. This violates the core Neurological Design Principle of Somnus (spatial movement activates the brain's orienting reflex and cortical hyperarousal, inhibiting Slow-Wave Sleep induction).

### Next Steps Upon Resuming Development:
* Audit synthesis layer scheduling and pitch engine transitions for low frequencies.
* Re-evaluate the 2OA FDN Reverb AudioWorklet parameter mapping and spatialization pipeline.
* Enforce strict static monophonic/centered spatial balance across all audio channels.


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


