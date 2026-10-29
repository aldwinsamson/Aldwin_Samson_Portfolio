import { Link } from "react-router-dom";
import { Award, MessageCircle } from "lucide-react";
import { Hero } from "@/features/hero/Hero";
import { ProjectRing } from "@/features/projects/ProjectRing";
import { ExperienceRows } from "@/features/experience/Timeline";
import { StackGrid } from "@/features/stack/StackGrid";
import { ContactSection } from "@/features/contact/ContactSection";
import { useGuide } from "@/features/guide/PortfolioGuide";
import { Container, Reveal, SectionHeader, Seo } from "@/components/ui";
import { TextScramble } from "@/components/TextScramble";
import { WordReveal } from "@/components/WordReveal";
import { LineReveal } from "@/components/LineReveal";
import { GlowCard } from "@/components/GlowCard";
import { MagneticWrap } from "@/components/MagneticWrap";
import { SectionTransition } from "@/components/SectionTransition";
import { profile } from "@/content/profile";
import { experience } from "@/content/experience";
import { skillGroups } from "@/content/skills";
import { projects } from "@/content/projects";

/** The four cards under the introduction: only the most important experience and achievements. */
const highlights = [
  {
    kind: "Experience",
    title: "Cloud & DevOps Engineer Intern",
    org: "Stratpoint Technologies",
    period: "Jun — Sep 2026",
    note: "Multi-AZ AWS with Terraform, GitLab CI/CD, ArgoCD and an observability stack.",
  },
  {
    kind: "Experience",
    title: "Hardware Engineer Intern",
    org: "USHER Technologies Inc.",
    period: "Jan — Mar 2026",
    note: "Multi-layer PCB design and ESP32 firmware with MQTT/REST device-to-cloud telemetry.",
  },
  {
    kind: "Leadership",
    title: "Thesis Group Leader",
    org: "Project L.I.G.T.A.S.",
    period: "Aug 2025 — May 2026",
    note: "Led a five-member team and served as lead hardware developer.",
  },
  {
    kind: "Achievement",
    title: "Top 2 Best Thesis",
    org: "PLM Thesis Exhibition",
    period: "2026",
    note: "Also won Best Thesis Paper, Best Booth and Best Poster.",
  },
];

export default function HomePage() {
  const guide = useGuide();
  const ligtas = projects.find((p) => p.slug === "ligtas");

  return (
    <>
      <Seo />
      <Hero />

      {/* 01 — Introduction (pulled up on desktop so it rises while the hero is still fading — no empty screen between them) */}
      <SectionTransition className="lg:-mt-[45svh]">
        <section id="introduction" aria-labelledby="intro-title" className="pb-16 pt-12 sm:pb-24 sm:pt-16 lg:pb-32 lg:pt-16">
          <Container>
            <SectionHeader
              index="01"
              label="Introduction"
              id="intro-title"
              title={
                <>
                  Where software meets{" "}
                  <em className="text-metal">
                    <TextScramble text="physical systems." className="inline" />
                  </em>
                </>
              }
              link={{ to: "/about", label: "More about me" }}
            />
            <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
              <div>
                <WordReveal
                  text={profile.about.short}
                  as="p"
                  className="font-display text-[clamp(1.45rem,2.4vw,2.4rem)] leading-[1.28] text-ink"
                />
                <p className="t-lead mt-6 max-w-2xl text-ink-soft sm:mt-8">{profile.about.paragraphs[0]}</p>

                {guide && (
                  <MagneticWrap className="mt-8 sm:mt-10">
                    <button
                      type="button"
                      onClick={() => guide.open()}
                      data-cursor="magnetic"
                      className="group surface flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-500 hover:border-accent/60 hover:shadow-[0_0_28px_-8px_var(--accent)] sm:max-w-md"
                    >
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-bg transition-colors group-hover:bg-accent group-hover:text-accent-ink sm:size-12">
                        <MessageCircle className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium sm:text-base">Ask me anything about John</span>
                        <span className="t-meta block text-[0.6rem] text-muted sm:text-[0.64rem]">
                          Smart assistant · answers from this portfolio
                        </span>
                      </span>
                    </button>
                  </MagneticWrap>
                )}
              </div>
              <ol className="border-t border-line">
                {profile.disciplines.map((d, i) => (
                  <Reveal
                    as="li"
                    key={d.title}
                    delay={i * 0.07}
                    className="group relative grid grid-cols-[2rem_1fr] gap-3 border-b border-line py-4 sm:grid-cols-[2.5rem_1fr] sm:gap-4 sm:py-5"
                  >
                    <span className="t-meta pt-1 text-accent transition-colors duration-300 group-hover:text-tech sm:pt-1.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-xl transition-transform duration-500 group-hover:translate-x-2 sm:text-2xl">
                        {d.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted transition-colors duration-300 group-hover:text-ink-soft">
                        {d.detail}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="absolute -left-px bottom-0 top-0 w-[2px] origin-bottom scale-y-0 bg-gradient-to-b from-accent to-tech transition-transform duration-700 group-hover:scale-y-100"
                    />
                  </Reveal>
                ))}
              </ol>
            </div>
          </Container>
        </section>
      </SectionTransition>

      {/* Key experience & achievements */}
      <SectionTransition>
        <section aria-label="Key experience and achievements" className="py-8 sm:py-16">
          <Container>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:rounded-[28px] sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((h, i) => (
                <Reveal key={h.title} delay={i * 0.08}>
                  <div className="group relative flex h-full flex-col bg-bg p-6 transition-colors duration-500 hover:bg-elev sm:p-8">
                    <span className="t-meta text-accent">{h.kind}</span>
                    <p className="mt-4 font-display text-2xl leading-[1.15] tracking-tight sm:text-[1.75rem]">{h.title}</p>
                    <p className="mt-2 text-sm text-ink-soft">{h.org}</p>
                    <p className="t-meta mt-1 text-[0.62rem] text-muted">{h.period}</p>
                    <p className="mt-4 text-sm leading-relaxed text-muted">{h.note}</p>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-accent via-tech to-accent transition-transform duration-700 group-hover:scale-x-100"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      </SectionTransition>

      <Container><LineReveal className="my-4" /></Container>

      {/* 02 — Selected work: pinned 3D ring on desktop, fixed layout on phones */}
      <ProjectRing />

      {/* Recognition */}
      {ligtas?.awards && (
        <SectionTransition>
          <section aria-labelledby="recognition-title" className="py-12 sm:py-20">
            <Container>
              <GlowCard className="w-full" glowColor="var(--accent)">
                <div className="p-6 sm:p-8 lg:p-12">
                  <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-10">
                    <div>
                      <p className="t-eyebrow text-accent">Recognition</p>
                      <h2 id="recognition-title" className="t-h2 mt-3 sm:mt-4">
                        <TextScramble text="Four awards for one thesis." />
                      </h2>
                      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:mt-4">
                        L.I.G.T.A.S. was recognized at the PLM thesis exhibition — led by John as group leader
                        and lead hardware developer.
                      </p>
                    </div>
                    <ul className="grid grid-cols-2 [gap:1px] overflow-hidden rounded-xl border border-line bg-line sm:rounded-2xl">
                      {ligtas.awards.map((a, i) => (
                        <Reveal as="li" key={a} delay={i * 0.08} className="flex flex-col gap-4 bg-elev p-4 sm:gap-6 sm:p-6 hover:bg-sunken transition-colors duration-500">
                          <Award className="size-5 text-accent" aria-hidden="true" />
                          <span className="font-display text-lg leading-tight sm:text-2xl">{a}</span>
                        </Reveal>
                      ))}
                    </ul>
                  </div>
                </div>
              </GlowCard>
            </Container>
          </section>
        </SectionTransition>
      )}

      {/* 03 — Experience */}
      <SectionTransition>
        <section aria-labelledby="exp-title" className="py-12 sm:py-20">
          <Container>
            <SectionHeader
              index="03"
              label="Experience"
              id="exp-title"
              title={
                <>
                  Hands-on, from{" "}
                  <em className="text-metal">
                    <TextScramble text="schematic to ship." />
                  </em>
                </>
              }
              link={{ to: "/experience", label: "Full history" }}
            />
            <ExperienceRows entries={experience} />
          </Container>
        </section>
      </SectionTransition>

      {/* 04 — Stack */}
      <SectionTransition>
        <section aria-labelledby="stack-title" className="py-12 sm:py-20">
          <Container>
            <SectionHeader
              index="04"
              label="Stack"
              id="stack-title"
              title={
                <>
                  A toolkit spanning{" "}
                  <em className="text-metal">
                    <TextScramble text="silicon to cloud." />
                  </em>
                </>
              }
              link={{ to: "/stack", label: "View all" }}
            />
            <StackGrid groups={skillGroups.slice(0, 6)} compact />
            <p className="mt-6 text-sm text-muted">
              Plus engineering practice: systems architecture, team leadership and rapid troubleshooting —{" "}
              <Link to="/stack" className="text-ink underline decoration-accent underline-offset-4">
                see the full breakdown
              </Link>.
            </p>
          </Container>
        </section>
      </SectionTransition>

      <ContactSection />
    </>
  );
}
