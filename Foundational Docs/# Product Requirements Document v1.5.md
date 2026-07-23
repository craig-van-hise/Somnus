
# Product Requirements Document (PRD): Somnus v1.5 - Acoustic Entrainment Subsystem

## 1. Executive Summary & Product Vision

Somnus is a mobile web application designed to provide a non-pharmacological, evidence-based auditory intervention to assist users with sleep induction and sleep maintenance. The platform is accessed directly through mobile web browsers, eliminating the friction of native app store downloads.

To guarantee clinical reliability and resolve spatial orientation artifacts, active development on the Generative Music Engine is temporarily paused. The v1.5 release pivots to establish a highly stable, 5-channel Acoustic Entrainment Subsystem. This foundation uses binaural beats, isochronic pulses, masking noise, and nature ambience to actively downregulate the sympathetic nervous system and shift autonomic balance toward parasympathetic control.

---

## 2. Problem Statement & Pivot Justification

The current landscape of sleep audio products suffers from several physiological and psychological pitfalls:

* 
**Cognitive Hyperarousal:** Everyday stress, anxiety, and rumination actively prolong sleep onset latency (SOL).


* 
**Predictive Decoding:** Pre-recorded sleep tracks or looping soundscapes fail because the primary auditory cortex actively seeks out patterns. Once a loop is memorized, the brain enters an alert state of predictive decoding.


* 
**REM Suppression:** Continuous broadband exposure inflicts a sensory load that cuts REM sleep.


* 
**Performance Anxiety:** Visible countdown timers trigger the Ascending Reticular Activating System (ARAS), creating acute alertness.



**The v1.5 Pivot:** The previous generative audio engine achieved functional frontend state management, but development was paused to address critical violations of the neurological design requirements, specifically unintended spatial panning artifacts that triggered the orienting reflex and low-frequency stagnation. By isolating pure, clinical acoustic entrainment elements combined with seamless nature ambiences, the system can achieve precise brainwave entrainment without introducing accidental spatial distractions.

---

## 3. Feature Requirements: Acoustic Entrainment Subsystem

### A. The 5-Channel Audio Mixer

The application will internally route five distinct audio channels.

* 
**Channel 1: Binaural Tones.** Pure sine waveforms, hard-panned left and right. The base carrier frequency is locked between 100 Hz and 250 Hz.


* 
**Channel 2: Isochronic Pulses.** Pink noise routed through an amplitude modulator. This pulses exactly at the target binaural frequency offset.


* 
**Channel 3: Blanket / Masking Noise.** Continuous, un-modulated noise (pink or brown). It acts as a static acoustic bed beneath the pulses and sine waves.


* 
**Channel 4: Nature Ambience.** Pre-recorded audio buffers of Rain and Ocean Waves.


* 
**Channel 5: Generative Music.** Currently paused, but its volume node is routed directly to the isolated 3D FDN Reverb pipeline for future testing.



### B. Nature Ambience Submixer & Seamless Looping

* 
**Inset Crossfade Looping:** Audio buffers loaded from the local Rain and Ocean Waves directories must utilize a crossfade buffer to overlap the loop. To prevent audible clicks or rhythmic recognition at the splice point, the `loopStart` and `loopEnd` must be inset to trim the physical head/tail of the files, combined with a substantial 2.0-second fade overlap.


* 
**Submixer Node:** A crossfade node specifically for the Rain and Waves buffers. This allows a single parameter to morph the ambient bed smoothly from 100% Rain to 100% Ocean Waves.



### C. Master Low-Pass Filter (LPF)

To simulate the acoustic dampening of a secure, quiet physical environment, a global `-24dB/octave` low-pass filter must be applied to the clinical entrainment mix.

* 
**Behavior:** The cutoff frequency dynamically shifts down as the session progresses. It starts wide open at **5000 Hz** (when the user is "Awake") to preserve the crisp, high-frequency timbre of the nature sounds, and decays exponentially down to a dark, submerged floor of **150 Hz** during Deep Sleep.



---

## 4. Parameter Mapping & The 3-Phase Lifecycle

The transition parameters are strictly governed by the "Current State" and "Session Duration" values selected on the frontend.

### Phase 1: Descent (Dynamic Ramp)

* 
**Duration:** Calculated automatically by the "Current State" slider. Wide Awake (0.00) triggers a maximum duration ramp; Deep Sleep (1.00) triggers a rapid 5-minute ramp.


* 
**Frequency Target:** Ramps down linearly from the starting state (up to 10 Hz Alpha) down to **2 Hz (Delta)**.


* **Master LPF Cutoff:** Starts open at 5000 Hz and ramps down exponentially to 150 Hz.

### Phase 2: Hold (Anchoring)

* 
**Duration:** `Session Duration - (Descent Phase + Fade Phase)`.


* 
**Frequency Target:** Static at **2 Hz**.


* **Master LPF Cutoff:** Static at **150 Hz**.
* 
**Behavior:** The system acts as a pure, unchanging physiological anchor to protect Slow-Wave Sleep.



### Phase 3: Fade (Preservation)

* 
**Duration:** The final 5 to 10 minutes of the total Session Duration.


* 
**Behavior:** The Master Gain node fades linearly to `-Infinity dB` to prevent REM suppression from continuous broadband exposure.



---

## 5. User Experience (UX) & Interface Requirements

The psychological interface must prioritize a frictionless setup to avoid performance anxiety and avoid triggering the Ascending Reticular Activating System (ARAS).

### Primary User Interface

* 
**Fluid Sliders:** The main screen features only the "Session Duration" (30–120 minutes) and "Current State" (Awake to Sleepy) sliders.


* 
**Hidden Timers:** The app internally calculates the targeted Sleep Onset Latency (SOL). All countdowns must remain strictly hidden to prevent time anxiety.



### Advanced Developer Controls

All mixing and manual target testing must be isolated inside the advanced settings modal, accessible only via the hidden cog icon. The settings modal will house:

* **Master Fade-In Time:** A configurable slider (e.g., 3 to 30 seconds) allowing the user to dictate how gently the application swells in volume upon hitting play, preventing sudden transients.
* 
**Diagnostic Inputs:** The 5-channel vertical volume sliders, the Nature Submixer crossfade slider, and a manual Master LPF cutoff override toggle for system testing.