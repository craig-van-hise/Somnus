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
