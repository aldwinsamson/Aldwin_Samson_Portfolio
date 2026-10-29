// pure geometry for the 3d wheel (home page + mobile nav). no react in here so it's easy to unit-test.
// every angle is in DEGREES, because that's what css rotateY() takes.

/** the wheel never packs fewer than this many slots, so 2-3 cards don't get a tiny cramped radius */
const MIN_SLOTS = 8;

/** wraps any angle into (-180, 180] — 0 means "facing the viewer" */
export function normalizeAngle(angle: number): number {
  const wrapped = ((angle % 360) + 360) % 360;
  return wrapped > 180 ? wrapped - 360 : wrapped;
}

/** degrees between neighbouring cards: one slot each, evenly spaced */
export function ringStep(count: number): number {
  return count > 0 ? 360 / count : 0;
}

/** how many slots the radius is sized for (at least MIN_SLOTS) */
export function ringGeometryCount(count: number): number {
  return Math.max(MIN_SLOTS, count);
}

/**
 * distance from the centre to each flat card (the polygon's apothem), so neighbours meet edge to edge:
 * a regular n-gon with apothem r has side 2·r·tan(π/n), and that side is the card width. `gap` pushes cards apart.
 */
export function ringRadius(cardWidth: number, count: number, gap = 0): number {
  return cardWidth / (2 * Math.tan(Math.PI / Math.max(3, count))) + gap;
}

/** which card is at the front when the wheel is turned by `angle` (card i sits at i·step + angle) */
export function frontIndex(angle: number, count: number): number {
  if (count <= 0) return 0;
  const i = Math.round(-angle / ringStep(count));
  return ((i % count) + count) % count;
}

/** nearest angle where a card sits squarely at the front */
export function snapAngle(angle: number, count: number): number {
  const step = ringStep(count);
  return step === 0 ? 0 : Math.round(angle / step) * step;
}

/** the angle that brings card `index` to the front from `current`, taking the shortest way round */
export function angleForIndex(index: number, current: number, count: number): number {
  const target = -index * ringStep(count);
  return current + normalizeAngle(target - current);
}
