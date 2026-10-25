import { describe, expect, it } from "vitest";
import { decideQualityTier, type CapabilitySignals } from "@/hooks/useDeviceCapability";

const desktop: CapabilitySignals = {
  webgl: true,
  reducedMotion: false,
  saveData: false,
  coarsePointer: false,
  smallScreen: false,
  cores: 8,
  memoryGB: 8,
  disable3DOnMobile: true,
  feature3DEnabled: true,
};

describe("decideQualityTier", () => {
  it("gives capable desktops the high tier", () => {
    expect(decideQualityTier(desktop)).toBe("high");
  });
  it("always respects reduced motion with a static hero", () => {
    expect(decideQualityTier({ ...desktop, reducedMotion: true })).toBe("static");
  });
  it("falls back to image parallax without WebGL", () => {
    expect(decideQualityTier({ ...desktop, webgl: false })).toBe("low");
  });
  it("respects Save-Data", () => {
    expect(decideQualityTier({ ...desktop, saveData: true })).toBe("low");
  });
  it("disables 3D on phones when configured", () => {
    expect(decideQualityTier({ ...desktop, coarsePointer: true, smallScreen: true })).toBe("low");
  });
  it("uses the medium tier for mid-range hardware", () => {
    expect(decideQualityTier({ ...desktop, cores: 4 })).toBe("medium");
    expect(decideQualityTier({ ...desktop, coarsePointer: true, disable3DOnMobile: false })).toBe("medium");
  });
  it("honours the feature flag", () => {
    expect(decideQualityTier({ ...desktop, feature3DEnabled: false })).toBe("low");
  });
});
