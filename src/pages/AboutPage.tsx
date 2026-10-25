import { Container, Reveal, SectionHeader, Seo, ButtonLink } from "@/components/ui";
import { TextScramble } from "@/components/TextScramble";
import { WordReveal } from "@/components/WordReveal";
import { GlowCard } from "@/components/GlowCard";
import { MagneticWrap } from "@/components/MagneticWrap";
import { HeroImage } from "@/features/hero/HeroImage";
import { heroImage } from "@/config/hero";
import { profile } from "@/content/profile";

export default function AboutPage() {
  return (
    <>
      <Seo title="About" description={profile.about.short} />
      <section className="pt-24 sm:pt-36 lg:pt-44">
        <Container>
          <SectionHeader as="h1" label="About" title={<>Cloud, hardware, <em className="text-metal"><TextScramble text="and the space between." /></em></>} />
          <div className="grid gap-10 sm:gap-14 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <figure>
                <div className="relative mx-auto max-w-[280px] overflow-hidden rounded-t-[999px] rounded-b-[24px] sm:max-w-sm" style={{ aspectRatio: String(heroImage.aspectRatio) }}>
                  <HeroImage cfg={{ ...heroImage, initialScale: 1.02 }} isMobile={false} />
                </div>
                {heroImage.isPlaceholder && (
                  <figcaption className="t-meta mt-3 text-center text-[0.62rem] text-muted">Placeholder portrait — replace in src/config/hero.ts</figcaption>
                )}
              </figure>
            </Reveal>
            <div>
              <WordReveal
                text={profile.about.short}
                as="p"
                className="font-display text-[clamp(1.5rem,2.6vw,2.6rem)] leading-[1.25]"
              />
              <div className="mt-6 space-y-5 sm:mt-10 sm:space-y-6">
                {profile.about.paragraphs.map((p, i) => (
                  <Reveal key={i} delay={i * 0.05}>
                    <p className="t-lead text-ink-soft">{p}</p>
                  </Reveal>
                ))}
              </div>
              <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-3">
                {profile.about.values.map((v, i) => (
                  <Reveal key={v.title} delay={i * 0.1}>
                    <GlowCard glowColor="var(--tech)">
                      <div className="p-6">
                        <span className="t-meta text-accent">{String(i + 1).padStart(2, "0")}</span>
                        <p className="mt-3 font-display text-xl">
                          {v.title}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{v.detail}</p>
                      </div>
                    </GlowCard>
                  </Reveal>
                ))}
              </div>
              <div className="mt-12 flex flex-wrap gap-3">
                <MagneticWrap>
                  <ButtonLink to="/projects">See the work</ButtonLink>
                </MagneticWrap>
                <MagneticWrap>
                  <ButtonLink to="/contact" variant="ghost">Get in touch</ButtonLink>
                </MagneticWrap>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
