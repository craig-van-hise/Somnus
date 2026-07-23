/**
 * 2OA FDN Reverb Mathematical Operators & Helpers
 * Implements the 9-channel Householder matrix mixing operator and T60 gain scaling.
 */

export const DELAY_LINE_PRIMES = [1601, 1801, 1999, 2203, 2401, 2603, 2801, 3001, 3203];

/**
 * Computes the 9-channel Householder matrix transformation:
 * y_i = x_i - (0.22222... * sum(x))
 *
 * @param {number[]} x - 9-channel input array
 * @returns {number[]} y - 9-channel output array
 */
export const householderMatrixMix = (x) => {
  let sum = 0;
  // Performs exactly 1 sum loop
  for (let i = 0; i < x.length; i++) {
    sum += x[i];
  }
  const scalar = (2.0 / 9.0) * sum;
  const y = new Array(x.length);
  for (let i = 0; i < x.length; i++) {
    y[i] = x[i] - scalar;
  }
  return y;
};

/**
 * Computes the loop gain scalar for a delay line of length d_i:
 * g_0 = 10^(-3 * d_i / (T60 * fs))
 *
 * @param {number} t60 - Reverb decay time in seconds (e.g. 2.5)
 * @param {number} fs - Sampling rate in Hz (e.g. 48000)
 * @param {number} d0 - Delay line length in samples (e.g. 1601)
 * @returns {number} g0 - Loop gain scalar
 */
export const calculateT60GainScalar = (t60, fs, d0) => {
  const exponent = (-3.0 * d0) / (t60 * fs);
  return Math.pow(10, exponent);
};
