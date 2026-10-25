import { Link } from "react-router-dom";
import { siteConfig } from "@/config/site";
import { heroImage } from "@/config/hero";
import { profile, socials } from "@/content/profile";
import { Container, ExternalLink } from "./ui";
import { BrandMark } from "./BrandMark";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="theme-fade relative mt-16 border-t border-line sm:mt-24">
      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 sm:gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark className="size-12" />
              <span className="font-display text-2xl italic">{profile.name}</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              Cloud & DevOps engineering with an embedded and hardware foundation. Reliable systems, from device to cloud.
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="t-eyebrow text-muted">Navigate</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[...siteConfig.nav, { label: "Contact", to: "/contact" }].map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-ink-soft transition-colors hover:text-accent">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="t-eyebrow text-muted">Elsewhere</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {socials.map((s) => (
                <li key={s.id}>
                  <ExternalLink href={s.href} className="text-ink-soft transition-colors hover:text-accent">
                    {s.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rule mt-12" aria-hidden="true" />
        <div className="t-meta mt-6 flex flex-col gap-2 text-[0.58rem] text-muted sm:gap-3 sm:text-[0.66rem] md:flex-row md:items-center md:justify-between">
          <p>© {year} {profile.name}. All rights reserved.</p>
          <p>
            No trackers · No cookies ·{" "}
            {heroImage.isPlaceholder && heroImage.credit && (
              <>
                Hero placeholder by{" "}
                <ExternalLink href={heroImage.credit.url} className="underline underline-offset-2 hover:text-ink">
                  {heroImage.credit.name}
                </ExternalLink>{" "}
                · Imagery via Pexels
              </>
            )}
          </p>
        </div>
      </Container>
    </footer>
  );
}
