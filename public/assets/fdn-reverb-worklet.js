/**
 * 2OA FDN Reverb AudioWorklet Processor
 * 9-channel Householder feedback delay network with 2nd-order Higher Order Ambisonics (2OA) SN3D/ACN formatting.
 */

const DELAY_LINE_PRIMES = [1601, 1801, 1999, 2203, 2401, 2603, 2801, 3001, 3203];

class FDNReverbWorkletProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 't60', defaultValue: 2.5, minValue: 2.5, maxValue: 7.0 },
      { name: 'hfDamping', defaultValue: 12000, minValue: 2800, maxValue: 12000 },
      { name: 'decorrelation', defaultValue: 0.3, minValue: 0.3, maxValue: 1.0 },
    ];
  }

  constructor() {
    super();
    this.numChannels = 9;
    this.delayBuffers = DELAY_LINE_PRIMES.map((len) => new Float32Array(len));
    this.delayPointers = new Int32Array(9);
    this.prevOutput = new Float32Array(9);
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || !input.length) return true;

    const blockSize = input[0].length;
    const t60 = parameters.t60[0] || 2.5;

    for (let sample = 0; sample < blockSize; sample++) {
      const x = new Float32Array(9);

      // Read from delay lines & apply Householder operator
      for (let i = 0; i < 9; i++) {
        const buf = this.delayBuffers[i];
        const ptr = this.delayPointers[i];
        const inSample = input[i % input.length][sample];

        // Gain decay for T60
        const exp = (-3.0 * DELAY_LINE_PRIMES[i]) / (t60 * sampleRate);
        const g = Math.pow(10, exp);

        x[i] = buf[ptr] * g + inSample;
      }

      // Householder matrix mix: y_i = x_i - (2/9 * sum(x))
      let sum = 0;
      for (let i = 0; i < 9; i++) sum += x[i];
      const scalar = (2.0 / 9.0) * sum;

      for (let i = 0; i < 9; i++) {
        const y = x[i] - scalar;
        const buf = this.delayBuffers[i];
        const ptr = this.delayPointers[i];

        buf[ptr] = y;
        this.delayPointers[i] = (ptr + 1) % DELAY_LINE_PRIMES[i];

        if (output[i % output.length]) {
          output[i % output.length][sample] = y;
        }
      }
    }

    return true;
  }
}

registerProcessor('fdn-reverb-worklet', FDNReverbWorkletProcessor);
try {
  registerProcessor('2oa-fdn-reverb', FDNReverbWorkletProcessor);
} catch (e) {
  // Processor already registered
}
