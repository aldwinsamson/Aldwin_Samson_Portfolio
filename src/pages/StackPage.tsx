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
            <SpotlightContainer>
              <StackGrid groups={skillGroups} />
            </SpotlightContainer>
          </Container>
        </section>
      </SectionTransition>
    </>
  );
}
