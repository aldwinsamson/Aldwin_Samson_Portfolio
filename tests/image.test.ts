import { describe, expect, it } from "vitest";
import { responsiveSrcSet } from "@/utils/image";

const pexels = "https://images.pexels.com/photos/123/pexels-photo-123.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1400&h=900";

describe("responsiveSrcSet", () => {
  it("builds a srcset of smaller sizes with the same aspect ratio for Pexels photos", () => {
    const set = responsiveSrcSet(pexels)!;
    const parts = set.split(", ");
    expect(parts).toHaveLength(5);
    expect(parts[0]).toContain("w=320&h=206");
    expect(parts[0].endsWith(" 320w")).toBe(true);
    expect(parts.at(-1)).toContain("w=1400&h=900");
  });

  it("leaves local images and unknown hosts alone", () => {
    expect(responsiveSrcSet("/images/projects/x/cover.webp")).toBeUndefined();
    expect(responsiveSrcSet("https://example.com/a.jpg?w=1400&h=900")).toBeUndefined();
  });

  it("skips Pexels URLs without a size", () => {
    expect(responsiveSrcSet("https://images.pexels.com/photos/1/pexels-photo-1.jpeg")).toBeUndefined();
  });
});
