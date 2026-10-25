import type { Project } from "@/content/types";
import { SmartImage } from "@/components/ui";
import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/utils/cn";

/**
 * A project's cover image — or, if the project has none yet, a tasteful placeholder,
 * so a new project never shows a broken image.
 */
export function ProjectCover({
  project,
  ratio,
  className,
  imgClassName,
  eager,
  label,
}: {
  project: Project;
  ratio?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  label?: string;
}) {
  if (project.cover) {
    return (
      <SmartImage
        src={project.cover.src}
        alt={project.cover.alt}
        ratio={ratio}
        className={className}
        imgClassName={imgClassName}
        eager={eager}
        label={label}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      style={{
        aspectRatio: ratio,
        background:
          "radial-gradient(120% 90% at 30% 20%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 60%), linear-gradient(135deg, var(--bg-sunken), var(--bg-elev))",
      }}
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
    >
      <BrandMark className="size-16 opacity-50" />
    </div>
  );
}
