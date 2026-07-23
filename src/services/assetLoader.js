/**
 * Asset preloading targeting physical MIT_KEMAR IR and OBR .wasm binaries
 */

const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL)
  ? import.meta.env.BASE_URL
  : '/';

export const fetchKemarImpulseResponse = async () => {
  try {
    const res = await fetch(`${BASE}assets/MIT_KEMAR.wav`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.arrayBuffer();
  } catch (err) {
    console.warn('MIT_KEMAR fetch fallback:', err.message);
    return new ArrayBuffer(1024);
  }
};

export const fetchObrWasmBinary = async () => {
  try {
    const res = await fetch(`${BASE}assets/obr_renderer.wasm`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.arrayBuffer();
  } catch (err) {
    console.warn('OBR WASM fetch fallback:', err.message);
    return new ArrayBuffer(2048);
  }
};

export const globalAssetCache = {
  rainBuffer: null,
  oceanBuffer: null,
};

export const fetchRainAmbience = async () => {
  try {
    const res = await fetch(`${BASE}Nature%20Sounds%20Audio/Rain/rain.wav`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    globalAssetCache.rainBuffer = buffer;
    return buffer;
  } catch (err) {
    console.warn('Rain fetch fallback:', err.message);
    const fallbackBuffer = new ArrayBuffer(1024);
    globalAssetCache.rainBuffer = fallbackBuffer;
    return fallbackBuffer;
  }
};

export const fetchOceanAmbience = async () => {
  try {
    const res = await fetch(`${BASE}Nature%20Sounds%20Audio/Ocean%20Waves/ocean.mp3`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    globalAssetCache.oceanBuffer = buffer;
    return buffer;
  } catch (err) {
    console.warn('Ocean Waves fetch fallback:', err.message);
    const fallbackBuffer = new ArrayBuffer(1024);
    globalAssetCache.oceanBuffer = fallbackBuffer;
    return fallbackBuffer;
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
