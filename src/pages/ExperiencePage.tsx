import { Award, BadgeCheck } from "lucide-react";
import { Container, Reveal, SectionHeader, Seo } from "@/components/ui";
import { TextScramble } from "@/components/TextScramble";
import { SectionTransition } from "@/components/SectionTransition";
import { Timeline } from "@/features/experience/Timeline";
import { certifications, education, experience, honors } from "@/content/experience";

export default function ExperiencePage() {
  return (
    <>
      <Seo title="Experience" description="Cloud & DevOps and hardware engineering internships, thesis leadership, project work, education, certifications and honors." />
      <SectionTransition>
        <section className="pt-24 sm:pt-36 lg:pt-44">
          <Container>
            <SectionHeader as="h1" label="Experience" title={<>A record of <em className="text-metal"><TextScramble text="building" /></em> things.</>} />
            <Timeline entries={experience} />
          </Container>
        </section>
      </SectionTransition>

      <section aria-labelledby="edu-title" className="pt-28">
        <Container>
          <SectionHeader label="Education" id="edu-title" title="Education" />
          <Timeline entries={education} />
        </Container>
      </section>

      <section aria-labelledby="cert-title" className="pt-28">
        <Container>
          <SectionHeader label="Learning" id="cert-title" title={<>Certifications &amp; <em className="text-metal">seminars.</em></>} />
          <ul className="grid gap-px overflow-hidden rounded-[24px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((c, i) => (
              <Reveal as="li" key={c.title} delay={Math.min(i * 0.04, 0.3)} className="bg-bg p-6 transition-colors hover:bg-elev">
                <BadgeCheck className="size-5 text-tech" aria-hidden="true" />
                <p className="mt-4 font-display text-xl">{c.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.detail}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="honors-title" className="pt-28">
        <Container>
          <SectionHeader label="Honors" id="honors-title" title="Honors & academic achievements" />
          <ul className="border-t border-line">
            {honors.map((h, i) => (
              <Reveal as="li" key={h.title} delay={i * 0.06} className="flex items-center gap-5 border-b border-line py-6">
                <Award className="size-5 shrink-0 text-accent" aria-hidden="true" />
                <span className="font-display text-2xl">{h.title}</span>
                <span className="t-meta ml-auto text-right text-muted">{h.detail}</span>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
