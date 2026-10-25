import type { MediaItem, Project } from "@/content/types";

/**
 * Geometry + content helpers for the 3D project ring (pure, unit-tested).
 * Convention: card i sits at rotateY(i·step) translateZ(R); the ring itself is rotated by `angle`.
 * A card faces the viewer when (i·step + angle) ≈ 0, i.e. i ≈ −angle / step.
 */

/** Radius at which `count` cards of `cardWidth` form a closed ring, plus an optional gap. */
export const ringRadius = (cardWidth: number, count: number, gap = 0) =>
  cardWidth / 2 / Math.tan(Math.PI / count) + gap;

/** Wraps any angle into (−180, 180]. 0 = directly facing the viewer. */
export const normalizeAngle = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

/** Index of the card currently facing the viewer. */
export const frontIndex = (angle: number, count: number) =>
  ((Math.round((-angle * count) / 360) % count) + count) % count;

/** Nearest angle at which a card sits exactly at the front. */
export const snapAngle = (angle: number, count: number) => {
  const step = 360 / count;
  return Math.round(angle / step) * step;
};

export type SlotKind = "cover" | "shot" | "stack" | "highlight";

export interface RingSlot {
  id: string;
  projectSlug: string;
  kind: SlotKind;
  media?: MediaItem;
}

const MIN_SLOTS = 8;

/**
 * Turns projects into ring faces. Every project contributes its cover, its gallery images, a stack card
 * and a highlight card (awards / outcome) — so the ring is built only from real project content.
 */
export function buildSlots(projects: readonly Project[]): RingSlot[] {
  const slots: RingSlot[] = [];
  for (const p of projects) {
    slots.push({ id: `${p.slug}-cover`, projectSlug: p.slug, kind: "cover", media: p.cover });
    p.gallery.forEach((m, i) => slots.push({ id: `${p.slug}-shot-${i}`, projectSlug: p.slug, kind: "shot", media: m }));
    slots.push({ id: `${p.slug}-stack`, projectSlug: p.slug, kind: "stack" });
    slots.push({ id: `${p.slug}-highlight`, projectSlug: p.slug, kind: "highlight" });
  }
  const base = slots.length;
  if (base === 0) return slots;
  for (let k = 0; slots.length < MIN_SLOTS; k++) {
    const src = slots[k % base];
    slots.push({ ...src, id: `${src.id}-r${k}` });
  }
  return slots;
}
