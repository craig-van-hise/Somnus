/**
 * Asset preloading targeting physical MIT_KEMAR IR and OBR .wasm binaries
 */
export const fetchKemarImpulseResponse = async () => {
  try {
    const res = await fetch('/assets/MIT_KEMAR.wav');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.arrayBuffer();
  } catch (err) {
    console.warn('MIT_KEMAR fetch fallback:', err.message);
    return new ArrayBuffer(1024);
  }
};

export const fetchObrWasmBinary = async () => {
  try {
    const res = await fetch('/assets/obr_renderer.wasm');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.arrayBuffer();
  } catch (err) {
    console.warn('OBR WASM fetch fallback:', err.message);
    return new ArrayBuffer(2048);
  }
};

export const fetchRainAmbience = async () => {
  try {
    const res = await fetch('/Nature Sounds Audio/Rain/rain.wav');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.arrayBuffer();
  } catch (err) {
    console.warn('Rain fetch fallback:', err.message);
    return new ArrayBuffer(1024);
  }
};

export const fetchOceanAmbience = async () => {
  try {
    const res = await fetch('/Nature Sounds Audio/Ocean Waves/ocean.mp3');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.arrayBuffer();
  } catch (err) {
    console.warn('Ocean Waves fetch fallback:', err.message);
    return new ArrayBuffer(1024);
  }
};

export const preloadAssets = (customLoaders = null) => {
  if (customLoaders) {
    return Promise.all(customLoaders);
  }
  return Promise.all([
    fetchKemarImpulseResponse(),
    fetchObrWasmBinary(),
    fetchRainAmbience(),
    fetchOceanAmbience(),
  ]);
};

