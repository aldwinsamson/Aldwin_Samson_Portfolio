const MIN_SLOTS = 8;

export function normalizeAngle(angle: number): number {
  const wrapped = ((angle % 360) + 360) % 360;
  return wrapped > 180 ? wrapped - 360 : wrapped;
}

export function ringStep(count: number): number {
  return count > 0 ? 360 / count : 0;
}

export function ringGeometryCount(count: number): number {
  return Math.max(MIN_SLOTS, count);
}

export function ringRadius(cardWidth: number, count: number, gap = 0): number {
  return cardWidth / (2 * Math.tan(Math.PI / Math.max(3, count))) + gap;
}

export function frontIndex(angle: number, count: number): number {
  if (count <= 0) return 0;
  const i = Math.round(-angle / ringStep(count));
  return ((i % count) + count) % count;
}

export function snapAngle(angle: number, count: number): number {
  const step = ringStep(count);
  return step === 0 ? 0 : Math.round(angle / step) * step;
}

export function angleForIndex(index: number, current: number, count: number): number {
  const target = -index * ringStep(count);
  return current + normalizeAngle(target - current);
}
