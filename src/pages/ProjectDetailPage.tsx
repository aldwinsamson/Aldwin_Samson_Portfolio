import { Link, useParams } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Award, Lock } from "lucide-react";
import { getProject, projects } from "@/content/projects";
import { Container, ExternalLink, Reveal, Seo, SmartImage, StatusDot, Tag } from "@/components/ui";
import { ImageReveal } from "@/components/ImageReveal";
import { BeamEffect } from "@/components/BeamEffect";
import { TextScramble } from "@/components/TextScramble";
import { WordReveal } from "@/components/WordReveal";
import { ease } from "@/styles/motion";
import NotFoundPage from "./NotFoundPage";
import type { ReactNode } from "react";

function Block({ label, title, children }: { label: string; title?: string; children: ReactNode }) {
  return (
    <Reveal className="grid gap-3 border-t border-line py-8 sm:gap-4 sm:py-12 md:grid-cols-[220px_1fr] md:gap-12">
      <p className="t-eyebrow pt-1 text-muted sm:pt-2">{label}</p>
      <div>
        {title && <h2 className="t-h3 mb-5">{title}</h2>}
        {children}
      </div>
    </Reveal>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3.5">
      {items.map((t) => (
        <li key={t} className="relative pl-5 text-sm leading-relaxed text-ink-soft sm:pl-6 sm:text-base">
          <span aria-hidden="true" className="absolute left-0 top-[0.75em] h-px w-3 bg-accent" />
          {t}
        </li>
      ))}
    </ul>
  );
}

export default function ProjectDetailPage() {
  const { slug = "" } = useParams();
  const project = getProject(slug);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const coverY = useTransform(scrollY, [0, 800], reduce ? [0, 0] : [0, 90]);

  if (!project) return <NotFoundPage message="That project doesn't exist (or has moved)." />;

  const idx = projects.indexOf(project);
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];

  return (
    <>
      <Seo title={project.title} description={project.summary} />
      <article>
        <header className="pt-24 sm:pt-32 lg:pt-40">
          <Container>
            <Link to="/projects" className="t-meta group inline-flex min-h-11 items-center gap-2 text-muted hover:text-ink">
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" /> All projects
            </Link>
            <div className="mt-5 grid gap-8 sm:mt-8 sm:gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {project.categories.map((c) => (
                    <Tag key={c} tone="tech">{c}</Tag>
                  ))}
                </div>
                <div className="relative">
                <BeamEffect className="inset-0 -top-20 -z-10" />
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: ease.lux }}
                  className="t-display mt-4 sm:mt-6"
                >
                  <TextScramble text={project.title} speed={40} />
                </motion.h1>
              </div>
                {project.fullTitle && <p className="mt-3 max-w-2xl font-display text-xl italic text-ink-soft sm:mt-4 sm:text-2xl">{project.fullTitle}</p>}
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-5 text-sm sm:gap-x-6 sm:gap-y-5 sm:pt-6">
                <div>
                  <dt className="t-meta text-muted">Role</dt>
                  <dd className="mt-1.5 text-ink">{project.role}</dd>
                </div>
                <div>
                  <dt className="t-meta text-muted">Period</dt>
                  <dd className="mt-1.5 text-ink">{project.period}</dd>
                </div>
                <div>
                  <dt className="t-meta text-muted">Status</dt>
                  <dd className="mt-1.5"><StatusDot status={project.status} /></dd>
                </div>
                <div>
                  <dt className="t-meta text-muted">Resources</dt>
                  <dd className="mt-1.5 space-y-1">
                    {project.links?.repository && (
                      <ExternalLink href={project.links.repository.href} className="inline-flex items-center gap-1 text-accent hover:underline">
                        {project.links.repository.label} <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </ExternalLink>
                    )}
                    {project.links?.demo && (
                      <ExternalLink href={project.links.demo.href} className="inline-flex items-center gap-1 text-accent hover:underline">
                        {project.links.demo.label} <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </ExternalLink>
                    )}
                    {!project.links?.repository && !project.links?.demo && (
                      <span className="inline-flex items-center gap-1.5 text-muted"><Lock className="size-3.5" aria-hidden="true" /> Not public</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </Container>
        </header>

        <Container className="mt-8 sm:mt-14">
          <ImageReveal className="rounded-2xl sm:rounded-[28px]" duration={1.2}>
            <motion.div style={{ y: coverY }} className="-mb-[60px] sm:-mb-[90px]">
              <SmartImage
                src={project.cover.src}
                alt={project.cover.alt}
                eager
                ratio="16 / 8"
                className="min-h-[200px] sm:min-h-[280px]"
                label={project.cover.kind === "representative" ? `Representative image · ${project.cover.credit ?? ""}` : undefined}
              />
            </motion.div>
          </ImageReveal>
        </Container>

        <Container className="mt-16 max-w-[1100px]">
          <WordReveal
            text={project.overview}
            as="p"
            className="font-display text-[clamp(1.4rem,2.6vw,2.5rem)] leading-[1.28]"
          />

          <div className="mt-16">
            <Block label="Objective"><p className="t-lead text-ink-soft">{project.objective}</p></Block>
            <Block label="The problem"><p className="t-lead text-ink-soft">{project.problem}</p></Block>
            <Block label="My role" title={project.role}><Bullets items={project.contributions} /></Block>

            {project.architecture && (
              <Block label="System overview">
                <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                  {project.architecture.map((a, i) => (
                    <li key={a.label} className="relative bg-elev p-5">
                      <span className="t-meta text-tech">{String(i + 1).padStart(2, "0")}</span>
                      <p className="mt-3 font-display text-xl">{a.label}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{a.detail}</p>
                      {i < project.architecture!.length - 1 && (
                        <ArrowRight aria-hidden="true" className="absolute right-3 top-5 hidden size-4 text-accent lg:block" />
                      )}
                    </li>
                  ))}
                </ol>
              </Block>
            )}

            <Block label="Technologies">
              <div className="flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <span key={s} className="rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-soft">{s}</span>
                ))}
              </div>
            </Block>

            {project.gallery.length > 0 && (
              <Block label="Media">
                <div className="grid gap-4 sm:grid-cols-2">
                  {project.gallery.map((m) => (
                    <figure key={m.src}>
                      <SmartImage src={m.src} alt={m.alt} ratio="4 / 3" className="rounded-2xl" />
                      {m.caption && <figcaption className="t-meta mt-2.5 text-[0.66rem] text-muted">{m.caption}{m.credit && ` · ${m.credit}`}</figcaption>}
                    </figure>
                  ))}
                </div>
              </Block>
            )}

            <Block label="Implementation"><Bullets items={project.implementation} /></Block>
            {project.challenges && <Block label="Challenges"><Bullets items={project.challenges} /></Block>}
            <Block label="Outcomes"><Bullets items={project.outcomes} /></Block>

            {project.awards && (
              <Block label="Awards">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {project.awards.map((a) => (
                    <li key={a} className="surface flex items-center gap-3 rounded-2xl p-4">
                      <Award className="size-5 text-accent" aria-hidden="true" />
                      <span className="font-display text-xl">{a}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {project.linkNote && (
              <p className="t-meta border-t border-line pt-6 text-[0.68rem] text-muted">
                <Lock className="mr-1.5 inline size-3" aria-hidden="true" />
                {project.linkNote}
              </p>
            )}
          </div>
        </Container>

        <Container className="mt-12 sm:mt-20">
          <nav aria-label="More projects" className="grid gap-4 border-t border-line pt-8 sm:grid-cols-2 sm:pt-10">
            <Link to={`/projects/${prev.slug}`} className="group rounded-xl p-2 sm:rounded-2xl" data-cursor="text" data-cursor-text="Prev">
              <span className="t-meta inline-flex items-center gap-2 text-muted"><ArrowLeft className="size-3.5" aria-hidden="true" /> Previous</span>
              <span className="mt-1.5 block font-display text-2xl transition-colors group-hover:text-accent sm:mt-2 sm:text-3xl">{prev.title}</span>
            </Link>
            <Link to={`/projects/${next.slug}`} className="group rounded-xl p-2 sm:rounded-2xl sm:text-right" data-cursor="text" data-cursor-text="Next">
              <span className="t-meta inline-flex items-center gap-2 text-muted sm:flex-row-reverse">Next <ArrowRight className="size-3.5" aria-hidden="true" /></span>
              <span className="mt-1.5 block font-display text-2xl transition-colors group-hover:text-accent sm:mt-2 sm:text-3xl">{next.title}</span>
            </Link>
          </nav>
        </Container>
      </article>
    </>
  );
}
