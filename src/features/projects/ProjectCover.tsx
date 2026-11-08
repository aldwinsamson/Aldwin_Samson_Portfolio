import type { Project } from "@/content/types";
import { SmartImage } from "@/components/ui";
import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/utils/cn";

export function ProjectCover({
  project,
  ratio,
  className,
  imgClassName,
  eager,
  label,
  sizes,
}: {
  project: Project;
  ratio?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  label?: string;
  sizes?: string;
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
        sizes={sizes}
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
