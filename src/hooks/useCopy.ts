import { useCallback, useEffect, useRef, useState } from "react";

/** Copy text with graceful fallback. `status` drives accessible feedback. */
export function useCopy(resetMs = 2200) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          const ok = document.execCommand("copy");
          document.body.removeChild(ta);
          if (!ok) throw new Error("copy failed");
        }
        setStatus("copied");
      } catch {
        setStatus("error");
      }
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setStatus("idle"), resetMs);
    },
    [resetMs],
  );

  return { copy, status };
}
