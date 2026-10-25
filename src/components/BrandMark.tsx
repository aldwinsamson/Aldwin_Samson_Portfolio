import { cn } from "@/utils/cn";

/**
 * The personal gold monogram, in two tonal versions so it always has contrast:
 * bright gold on the dark theme, deep bronze on the light theme (switched in CSS — no flash, no JS).
 * `variant="dark"` forces the bright version for surfaces that are always dark (preloader).
 */
export function BrandMark({
  className,
  eager = false,
  variant = "auto",
}: {
  className?: string;
  eager?: boolean;
  variant?: "auto" | "dark";
}) {
  const common = {
    alt: "",
    "aria-hidden": true as const,
    width: 256,
    height: 256,
    loading: eager ? ("eager" as const) : ("lazy" as const),
    decoding: "async" as const,
    draggable: false,
  };
  return (
    <>
      {variant === "auto" && (
        <img
          {...common}
          src="/images/logo-mark-light-256.webp"
          srcSet="/images/logo-mark-light-128.webp 128w, /images/logo-mark-light-256.webp 256w, /images/logo-mark-light-512.webp 512w"
          sizes="48px"
          className={cn("brand-light select-none object-contain", className)}
        />
      )}
      <img
        {...common}
        src="/images/logo-mark-256.webp"
        srcSet="/images/logo-mark-128.webp 128w, /images/logo-mark-256.webp 256w, /images/logo-mark-512.webp 512w"
        sizes="48px"
        className={cn(variant === "auto" ? "brand-dark" : "block", "select-none object-contain drop-shadow-[0_1px_8px_rgba(201,174,124,0.28)]", className)}
      />
    </>
  );
}
