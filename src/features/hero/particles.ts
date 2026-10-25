/**
 * Particle sampling for the hero portrait.
 * Pure functions (no DOM / WebGL) so they can be unit-tested in Node.
 *
 * The portrait is turned into a "stipple": particles are placed on opaque pixels, weighted by tone.
 *  - dark theme  → brighter areas get more particles (light on black)
 *  - light theme → darker areas get more particles (ink on paper)
 */

export type ParticleMode = "dark" | "light";

export interface ParticleData {
  count: number;
  /** x,y pairs in the range [-1, 1] (y up). */
  target: Float32Array;
  /** Tone 0..1 per particle (1 = bright). */
  lum: Float32Array;
  /** Three random numbers per particle, used for stagger / scatter in the shader. */
  seed: Float32Array;
}

/** Small deterministic PRNG so the portrait looks identical on every load. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleParticles(
  rgba: ArrayLike<number>,
  size: number,
  count: number,
  mode: ParticleMode,
  seed = 7,
): ParticleData {
  const cells = size * size;
  const cumulative = new Float64Array(cells);
  const tone = new Float32Array(cells);
  let total = 0;

  for (let i = 0; i < cells; i++) {
    const o = i * 4;
    const alpha = rgba[o + 3] / 255;
    const lum = (0.2126 * rgba[o] + 0.7152 * rgba[o + 1] + 0.0722 * rgba[o + 2]) / 255;
    tone[i] = lum;
    if (alpha > 0.5) {
      total += mode === "dark" ? 0.04 + Math.pow(lum, 2.6) : 0.24 + Math.pow(1 - lum, 1.3);
    }
    cumulative[i] = total;
  }

  if (total === 0 || count <= 0) {
    return { count: 0, target: new Float32Array(0), lum: new Float32Array(0), seed: new Float32Array(0) };
  }

  const rnd = mulberry32(seed);
  const target = new Float32Array(count * 2);
  const lumOut = new Float32Array(count);
  const seedOut = new Float32Array(count * 3);

  for (let n = 0; n < count; n++) {
    const r = rnd() * total;
    // Binary search for the first cell whose cumulative weight exceeds r.
    let lo = 0;
    let hi = cells - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] > r) hi = mid;
      else lo = mid + 1;
    }
    const px = lo % size;
    const py = (lo / size) | 0;
    target[n * 2] = ((px + rnd()) / size) * 2 - 1;
    target[n * 2 + 1] = -(((py + rnd()) / size) * 2 - 1);
    lumOut[n] = tone[lo];
    seedOut[n * 3] = rnd();
    seedOut[n * 3 + 1] = rnd();
    seedOut[n * 3 + 2] = rnd();
  }

  return { count, target, lum: lumOut, seed: seedOut };
}
