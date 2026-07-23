/**
 * 4-Phase System Lifecycle & Automation Scheduling Engine
 * Implements linear BPM deceleration ramps during Descent and exponential volume fade ramps during Fade phase.
 */

/**
 * Calculates evaluated BPM at runtime t in minutes:
 * Phase 1 & 2 (Descent): 0 -> T_sol, linear ramp from BPM_start down to 50 BPM.
 * Phase 3 & 4 (Hold & Fade): T_sol -> T_total, locked at 50 BPM.
 *
 * @param {Object} params
 * @param {number} [params.bpmStart=70] - Starting tempo in BPM
 * @param {number} [params.solTargetMinutes=20] - T_sol target in minutes
 * @param {number} [params.timeMinutes=10] - Current elapsed time in minutes
 * @returns {number} evaluated BPM
 */
export const calculateBpmAtTime = ({ bpmStart = 70, solTargetMinutes = 20, timeMinutes = 10 } = {}) => {
  if (timeMinutes <= 0) return bpmStart;
  if (timeMinutes >= solTargetMinutes) return 50;

  const progress = timeMinutes / solTargetMinutes;
  return bpmStart - (bpmStart - 50) * progress;
};

/**
 * Calculates evaluated master volume in dB at runtime t in minutes:
 * Phase 1-3 (Descent & Hold): 0 -> (T_total - 10m), full normalization (0 dB).
 * Phase 4 (Fade): (T_total - 10m) -> T_total, exponential ramp down towards -Infinity.
 *
 * @param {Object} params
 * @param {number} [params.totalRuntimeMinutes=30] - T_total in minutes
 * @param {number} [params.timeMinutes=25] - Current elapsed time in minutes
 * @param {number} [params.initialVolumeDb=0] - Initial master volume in dB
 * @returns {number} evaluated volume in dB
 */
export const calculateVolumeAtTime = ({
  totalRuntimeMinutes = 30,
  timeMinutes = 25,
  initialVolumeDb = 0,
} = {}) => {
  const fadeStartMinutes = totalRuntimeMinutes - 10;

  if (timeMinutes <= fadeStartMinutes) {
    return initialVolumeDb;
  }

  if (timeMinutes >= totalRuntimeMinutes) {
    return -Infinity;
  }

  const fadeProgress = (timeMinutes - fadeStartMinutes) / 10.0;
  // Negative exponential curve towards -Infinity
  const volumeDb = initialVolumeDb - 60 * Math.pow(fadeProgress, 2);
  return volumeDb;
};

/**
 * Calculates binaural/isochronic entrainment frequency target over time
 */
export const calculateEntrainmentFrequency = (arg1, arg2, arg3) => {
  let currentState = 0;
  let timeMinutes = 0;
  let solTargetMinutes = 20;

  if (typeof arg1 === 'object' && arg1 !== null) {
    currentState = arg1.currentState ?? 0;
    timeMinutes = arg1.timeMinutes ?? 0;
    solTargetMinutes = arg1.solTargetMinutes ?? 20;
  } else {
    currentState = arg1 ?? 0;
    timeMinutes = arg2 ?? 0;
    solTargetMinutes = arg3 ?? 20;
  }

  if (timeMinutes >= solTargetMinutes) return 2;
  const startFreq = 10 - 6 * Math.min(1, Math.max(0, currentState));
  if (timeMinutes <= 0) return startFreq;
  const progress = timeMinutes / solTargetMinutes;
  return startFreq - (startFreq - 2) * progress;
};

/**
 * Calculates Master LPF cutoff frequency target over time (exponential decay to 300Hz)
 */
export const calculateLpfCutoff = (arg1, arg2, arg3) => {
  let currentState = 0;
  let timeMinutes = 0;
  let solTargetMinutes = 20;

  if (typeof arg1 === 'object' && arg1 !== null) {
    currentState = arg1.currentState ?? 0;
    timeMinutes = arg1.timeMinutes ?? 0;
    solTargetMinutes = arg1.solTargetMinutes ?? 20;
  } else {
    currentState = arg1 ?? 0;
    timeMinutes = arg2 ?? 0;
    solTargetMinutes = arg3 ?? 20;
  }

  if (timeMinutes >= solTargetMinutes) return 150;
  const startCutoff = 5000 - 3000 * Math.min(1, Math.max(0, currentState));
  if (timeMinutes <= 0) return startCutoff;
  const progress = timeMinutes / solTargetMinutes;
  return startCutoff * Math.pow(150 / startCutoff, progress);
};

