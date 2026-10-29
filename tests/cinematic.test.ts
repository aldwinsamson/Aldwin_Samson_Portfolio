import { describe, expect, it } from "vitest";
import { mulberry32, sampleParticles } from "@/features/hero/particles";
import { angleForIndex, frontIndex, normalizeAngle, ringGeometryCount, ringRadius, ringStep, snapAngle } from "@/features/projects/ringMath";

/** Builds an RGBA buffer: left half opaque white, right half transparent. */
function halfImage(size: number) {
  const buf = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = (y * size + x) * 4;
      const opaque = x < size / 2;
      buf[o] = buf[o + 1] = buf[o + 2] = 255;
      buf[o + 3] = opaque ? 255 : 0;
    }
  }
  return buf;
}

describe("sampleParticles", () => {
  it("returns the requested count, only on opaque pixels, inside [-1, 1]", () => {
    const d = sampleParticles(halfImage(32), 32, 500, "dark");
    expect(d.count).toBe(500);
    for (let i = 0; i < d.count; i++) {
      const x = d.target[i * 2];
      const y = d.target[i * 2 + 1];
      expect(x).toBeLessThanOrEqual(0); // left half only
      expect(x).toBeGreaterThanOrEqual(-1);
      expect(Math.abs(y)).toBeLessThanOrEqual(1);
    }
  });

  it("is deterministic for the same seed", () => {
    const a = sampleParticles(halfImage(16), 16, 50, "dark", 3);
    const b = sampleParticles(halfImage(16), 16, 50, "dark", 3);
    expect(Array.from(a.target)).toEqual(Array.from(b.target));
  });

  it("returns nothing for a fully transparent image", () => {
    expect(sampleParticles(new Uint8ClampedArray(16 * 16 * 4), 16, 100, "light").count).toBe(0);
  });

  it("favours bright pixels in dark mode and dark pixels in light mode", () => {
    const size = 16;
    const buf = new Uint8ClampedArray(size * size * 4);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const o = (y * size + x) * 4;
        const v = x < size / 2 ? 255 : 0; // left bright, right dark
        buf[o] = buf[o + 1] = buf[o + 2] = v;
        buf[o + 3] = 255;
      }
    const leftShare = (mode: "dark" | "light") => {
      const d = sampleParticles(buf, size, 4000, mode);
      let left = 0;
      for (let i = 0; i < d.count; i++) if (d.target[i * 2] < 0) left++;
      return left / d.count;
    };
    expect(leftShare("dark")).toBeGreaterThan(0.6);
    expect(leftShare("light")).toBeLessThan(0.4);
  });
});

describe("mulberry32", () => {
  it("stays in [0, 1)", () => {
    const r = mulberry32(1);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("ring math", () => {
  it("computes the polygon apothem so neighbouring flat cards meet edge to edge", () => {
    const r = ringRadius(240, 12);
    // A regular N-gon with apothem r has side length 2·r·tan(π/N) — that side is the card width.
    expect(2 * r * Math.tan(Math.PI / 12)).toBeCloseTo(240, 5);
    expect(ringRadius(240, 12, 20)).toBeCloseTo(r + 20, 5);
  });

  it("normalizes angles into (-180, 180]", () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(190)).toBeCloseTo(-170);
    expect(normalizeAngle(-190)).toBeCloseTo(170);
    expect(normalizeAngle(720)).toBeCloseTo(0);
  });

  it("finds the front card as the ring turns", () => {
    expect(frontIndex(0, 12)).toBe(0);
    expect(frontIndex(-30, 12)).toBe(1);
    expect(frontIndex(-360, 12)).toBe(0);
    expect(frontIndex(30, 12)).toBe(11);
    expect(frontIndex(-14, 12)).toBe(0); // rounds to nearest card
  });

  it("snaps to a card boundary", () => {
    expect(snapAngle(-44, 12)).toBeCloseTo(-30);
    expect(snapAngle(-46, 12)).toBeCloseTo(-60);
  });

  it("gives every project exactly one slot, evenly spaced", () => {
    expect(ringStep(3)).toBe(120);
    expect(ringStep(8)).toBe(45);
    expect(ringStep(1)).toBe(360);
  });

  it("sizes the radius for at least 8 cards so tiny wheels aren't cramped", () => {
    expect(ringGeometryCount(2)).toBe(8);
    expect(ringGeometryCount(3)).toBe(8);
    expect(ringGeometryCount(10)).toBe(10);
  });

  it("finds the shortest rotation that brings a card to the front", () => {
    // 5 cards (72° apart). From rest, card 1 needs -72°.
    expect(angleForIndex(1, 0, 5)).toBeCloseTo(-72);
    // Already turned to card 4 (-288°): going to card 0 is a short +72° hop forward, not a long way back.
    expect(angleForIndex(0, -288, 5)).toBeCloseTo(-360);
    // The result always faces the requested card.
    for (let i = 0; i < 5; i++) expect(frontIndex(angleForIndex(i, 123.4, 5), 5)).toBe(i);
  });
});
