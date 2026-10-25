import { Container, SectionHeader, Seo } from "@/components/ui";
import { ProjectExplorer } from "@/features/projects/ProjectExplorer";

export default function ProjectsPage() {
  return (
    <>
      <Seo title="Projects" description="Embedded systems, hardware, AI and full-stack projects by John Aldwin R. Samson — searchable and filterable." />
      <section className="pb-12 pt-24 sm:pt-36 lg:pt-44">
        <Container>
          <SectionHeader
            as="h1"
            label="Projects"
            title={<>Work across <em className="text-metal">hardware</em> &amp; software.</>}
          />
          <p className="t-lead -mt-2 mb-8 max-w-2xl text-ink-soft sm:-mt-4 sm:mb-14">
            Each project is presented as a case study: the problem, my role, the system and what was actually delivered.
            Stock imagery is labelled as representative until project photos are added.
          </p>
          <ProjectExplorer />
        </Container>
      </section>
    </>
  );
}
