import { Container, SectionHeader, Seo } from "@/components/ui";
import { TextScramble } from "@/components/TextScramble";
import { SpotlightContainer } from "@/components/SpotlightCard";
import { SectionTransition } from "@/components/SectionTransition";
import { StackGrid } from "@/features/stack/StackGrid";
import { skillGroups } from "@/content/skills";

export default function StackPage() {
  return (
    <>
      <Seo title="Tech Stack" description="Cloud, DevOps, observability, programming, data, embedded systems and hardware design tools used by John Aldwin R. Samson." />
      <SectionTransition>
        <section className="pt-24 sm:pt-36 lg:pt-44">
          <Container>
            <SectionHeader
              as="h1"
              label="Tech Stack"
              title={
                <>
                  Capabilities,{" "}
                  <em className="text-metal">
                    <TextScramble text="grouped by discipline." />
                  </em>
                </>
              }
            />
            <p className="t-lead -mt-4 mb-10 max-w-2xl text-ink-soft sm:mb-14">
              No percentage bars — just the tools I've used on real projects, with context where it helps. Details of how each was applied live in the project case studies.
            </p>
            <SpotlightContainer>
              <StackGrid groups={skillGroups} />
            </SpotlightContainer>
          </Container>
        </section>
      </SectionTransition>
    </>
  );
}
