import { Link } from "react-router-dom";
import { ButtonLink, Container, Seo } from "@/components/ui";
import { TextScramble } from "@/components/TextScramble";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { siteConfig } from "@/config/site";

export default function NotFoundPage({ message = "The page you're looking for isn't here." }: { message?: string }) {
  return (
    <>
      <Seo title="Not found" />
      <section className="relative flex min-h-[70svh] items-center overflow-hidden pt-20 sm:min-h-[80svh] sm:pt-28">
        <div aria-hidden="true" className="blueprint absolute inset-0" />
        <Container className="relative">
          <p className="t-eyebrow text-accent">
            <TextScramble text="ERROR 404 · SIGNAL LOST" speed={25} />
          </p>
          <div className="mt-4 font-display text-[clamp(4rem,14vw,14rem)] leading-none text-accent/20 sm:mt-6" aria-hidden="true">
            <AnimatedCounter target={404} duration={1200} />
          </div>
          <h1 className="t-display -mt-8 relative">
            Off the <em className="text-metal"><TextScramble text="schematic." /></em>
          </h1>
          <p className="t-lead mt-6 max-w-lg text-ink-soft">{message}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink to="/">Return home</ButtonLink>
            <ButtonLink to="/projects" variant="ghost">Browse projects</ButtonLink>
          </div>
          <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {siteConfig.nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-ink">{n.label}</Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
