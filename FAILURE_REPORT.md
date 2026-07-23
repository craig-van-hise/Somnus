
# Technical Failure Report: Somnus Audio Graph Graph Contamination

## 1. Executive Summary

During the integration testing phase of the Somnus MVP, the application failed to output audio. The developer console consistently surfaces a fatal browser exception: `InvalidAccessError` thrown by the `AudioWorkletNode` subsystem during the invocation of `GenerativeAudioController.setupReverbWorklet()`. Despite sequential interventions targeting context extraction and caching behaviors, the audio graph remains entirely broken and silent.

## 2. The Core Technical Problem

An `InvalidAccessError` within the W3C Web Audio API specification occurs almost exclusively due to **Cross-Context Contamination**. In browser audio routing, you cannot plug a node belonging to `AudioContext_A` into a node belonging to `AudioContext_B`.

In this application, `Tone.js` acts as an abstraction layer over the browser's native `AudioContext`. When the custom 2OA FDN Reverb `AudioWorkletNode` is instantiated, the browser detects that the source node (`this.reverbInputBus`) and the target destination (`this.reverbWorklet`) do not share the exact same underlying hardware context memory space, causing the browser to throw a security/access exception and completely kill the audio stream.

---

## 3. Chronological Log of Remediation Attempts & Failures

### Attempt 1: Context Property Extraction Optimization

* **What was tried:** The initial error indicated that a Tone.js context wrapper wrapper object was passed directly into the native browser constructor (`parameter 1 is not of type 'BaseAudioContext'`). The agent attempted to extract the raw context via `Tone.getContext().rawContext`.
* **Why it failed:** It resulted in the immediate emergence of the `InvalidAccessError`. While the type mismatch was bypassed, the extracted context did not functionally align with the operational context used by the synthesis layers.

### Attempt 2: Strict Node-Level Context Alignment

* **What was tried:** To eliminate global context drift, the routing logic was modified to extract the context pointer directly from the source node itself: `const toneCtx = this.reverbInputBus.context; const nativeContext = toneCtx.rawContext`.
* **Why it failed:** The `InvalidAccessError` persisted at line 143. This confirmed that `Tone.js` handles node instantiation dynamically (likely spinning up or resuming an isolated context upon `Tone.start()`) which completely breaks standard reference bindings.

### Attempt 3: Singleton Cache Eviction

* **What was tried:** Assuming that the Vite dev server's Hot Module Replacement (HMR) was caching a "zombie" Worklet instance tied to a destroyed context from a previous compile, the function was refactored to explicitly wipe the cache (`this.reverbWorklet = null`) and reconstruct the nodes natively from scratch on every session start.
* **Why it failed:** Even with complete cache eviction and a hard browser refresh, the native `AudioWorkletNode` threw the identical `InvalidAccessError` upon attempting the `Tone.connect()` or native `.connect()` bridge.

---

## 4. Unresolved Architectural Hypotheses

If a human developer or advanced debugger steps in, the root cause is highly likely restricted to these two scenarios:

1. **The Dynamic Proxy Trap:** `Tone.js` uses dynamic proxies or internal shimmed contexts to handle mobile autoplay policies. The `this.reverbInputBus.context.rawContext` property is returning a parent context, while the actual web audio nodes are being bound to a hidden, locked sub-context.
2. **Asynchronous Initialization Race Condition:** `setupReverbWorklet` is an asynchronous function (`await nativeContext.audioWorklet.addModule`). During the `await` window, the underlying browser context state changes, meaning by the time `new AudioWorkletNode` executes, the context reference has drifted from the one assigned to the synchronous `reverbInputBus`.

## 5. Current System State

* **Dev Server Status:** Vite active at localhost.
* **Test Suite:** 13/13 passing (failing to catch the error because environment test runners utilize a mocked/synthetic global audio context that ignores cross-context memory boundaries).
* **Audio State:** Dry, zero output, hard-blocked by browser exception.