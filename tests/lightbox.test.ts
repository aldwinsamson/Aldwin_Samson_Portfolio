import { describe, expect, it } from "vitest";
import { swipeDirection, wrapIndex } from "@/utils/lightbox";

describe("wrapIndex", () => {
  it("keeps in-range indices unchanged", () => {
    expect(wrapIndex(0, 4)).toBe(0);
    expect(wrapIndex(3, 4)).toBe(3);
  });

  it("wraps past either end", () => {
    expect(wrapIndex(4, 4)).toBe(0);
    expect(wrapIndex(-1, 4)).toBe(3);
    expect(wrapIndex(-5, 4)).toBe(3);
  });

  it("returns 0 for an empty list", () => {
    expect(wrapIndex(2, 0)).toBe(0);
  });
});

describe("swipeDirection", () => {
  it("maps a left drag to next and a right drag to previous", () => {
    expect(swipeDirection(-90, 4)).toBe(1);
    expect(swipeDirection(90, -4)).toBe(-1);
  });

  it("ignores short drags", () => {
    expect(swipeDirection(20, 0)).toBe(0);
  });

  it("ignores mostly vertical drags so page scrolling is not hijacked", () => {
    expect(swipeDirection(60, 120)).toBe(0);
  });
});
