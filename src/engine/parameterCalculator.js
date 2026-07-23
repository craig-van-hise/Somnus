/**
 * Somnus Engine Mathematics & Parameter Mapping
 * Derives audio engine runtime targets from UI inputs, supporting manual SOL Target overrides.
 *
 * @param {Object} params
 * @param {number} params.durationNormalized - D in [0.0, 1.0] or duration in minutes (30..120)
 * @param {number} params.currentState - S in [0.0, 1.0] (0.0 = Awake, 1.0 = Sleepy)
 * @param {boolean} [params.debugMode=false] - When true, overrides outputs to compressed values for rapid testing
 * @param {number|null} [params.solTargetOverride=null] - Manual SOL target in minutes (if overridden by user)
 */
export const calculateEngineParameters = ({
  durationNormalized = 0.333,
  currentState = 0.5,
  debugMode = false,
  solTargetOverride = null,
} = {}) => {
  // Normalize D if passed in raw minutes (30 to 120)
  let D = typeof durationNormalized === 'number' ? durationNormalized : 0.0;
  if (D > 1.0) {
    D = (D - 30) / 90;
  }
  D = Math.max(0.0, Math.min(1.0, D));

  const S = Math.max(0.0, Math.min(1.0, typeof currentState === 'number' ? currentState : 0.0));

  if (debugMode) {
    return {
      totalRuntimeMinutes: 3,
      solTargetMinutes: 1,
      startingBpm: 80 - (20 * S),
      startingComplexity: 1.0 - (0.5 * S),
      isDebugMode: true,
    };
  }

  const totalRuntimeMinutes = 30 + (90 * D);
  const solTargetMinutes = typeof solTargetOverride === 'number' && solTargetOverride > 0
    ? solTargetOverride
    : (25 - (15 * S));
  const startingBpm = 80 - (20 * S);
  const startingComplexity = 1.0 - (0.5 * S);

  return {
    totalRuntimeMinutes,
    solTargetMinutes,
    startingBpm,
    startingComplexity,
    isDebugMode: false,
  };
};
