/**
 * Responsive images for remote stock photos.
 *
 * Pexels can resize on request (`?w=…&h=…`). Project covers are written once at 1400×900, but a card
 * on the homepage wheel is only ~220px wide — downloading 1400px for it wastes bandwidth and slows
 * decoding. `responsiveSrcSet` builds a srcset so the browser picks the smallest sufficient file.
 * Local images (anything not on images.pexels.com) are returned unchanged (undefined = no srcset).
 */
const PEXELS = /^https:\/\/images\.pexels\.com\/photos\/\d+\//;
const WIDTHS = [320, 480, 720, 1000];

export function responsiveSrcSet(src: string): string | undefined {
  if (!PEXELS.test(src)) return undefined;
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return undefined;
  }
  const w = Number(url.searchParams.get("w"));
  const h = Number(url.searchParams.get("h"));
  if (!w || !h) return undefined;

  const widths = [...WIDTHS.filter((x) => x < w), w];
  return widths
    .map((x) => {
      const u = new URL(src);
      u.searchParams.set("w", String(x));
      u.searchParams.set("h", String(Math.round((x * h) / w)));
      return `${u.toString()} ${x}w`;
    })
    .join(", ");
}
