import { motion } from "motion/react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { gmailComposeUrl, profile, socials } from "@/content/profile";
import { useCopy } from "@/hooks/useCopy";
import { Container, ExternalLink, Reveal } from "@/components/ui";
import { MagneticWrap } from "@/components/MagneticWrap";
import { GitHubIcon, LinkedInIcon } from "@/components/Icons";
import { spring } from "@/styles/motion";
import { cn } from "@/utils/cn";

export function CopyEmailButton({ className }: { className?: string }) {
  const { copy, status } = useCopy();
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      transition={spring.ui}
      onClick={() => copy(profile.email)}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-sm transition-colors hover:border-ink sm:min-h-12 sm:gap-2.5 sm:px-5",
        className,
      )}
    >
      {status === "copied" ? <Check className="size-4 text-emerald-500" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      <span>{status === "copied" ? "Copied!" : status === "error" ? "Copy failed" : "Copy email"}</span>
      <span className="sr-only" role="status" aria-live="polite">
        {status === "copied" ? `${profile.email} copied to clipboard` : status === "error" ? "Could not copy email" : ""}
      </span>
    </motion.button>
  );
}

export function ContactSection({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  const H = headingLevel;
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative py-16 sm:py-24 lg:py-32">
      <Container>
        {/* Animated gradient border wrapper */}
        <div className="relative overflow-hidden rounded-2xl p-[1px] sm:rounded-[32px]">
          <div className="animated-border absolute inset-0 rounded-2xl opacity-40 sm:rounded-[32px]" aria-hidden="true" />

          <div className="relative overflow-hidden rounded-2xl bg-[#0d0d0f] px-5 py-12 text-[#ece7dc] sm:rounded-[32px] sm:px-10 sm:py-16 lg:px-20 lg:py-20">
            {/* Ambient glow */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "radial-gradient(60% 80% at 85% 0%, rgba(214,186,134,0.22), transparent 60%), radial-gradient(40% 60% at 0% 100%, rgba(103,212,230,0.10), transparent 60%)" }} />
            <div aria-hidden="true" className="pointer-events-none absolute inset-4 rounded-xl border border-white/[0.06] sm:inset-6 sm:rounded-[24px]" />

            <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-12">
              <Reveal>
                <p className="t-eyebrow text-[#d6ba86]">Contact</p>
                <H id="contact-title" className="t-h2 mt-4 max-w-3xl text-balance sm:mt-6" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.6rem)" }}>
                  {profile.contact.heading.split("real world")[0]}
                  <span className="italic text-[#d6ba86]">real world.</span>
                </H>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#c9c3b6] sm:mt-6 sm:text-base sm:leading-relaxed">{profile.contact.body}</p>
                <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
                  <MagneticWrap>
                    <motion.span whileTap={{ scale: 0.97 }} transition={spring.ui} className="inline-flex">
                      <ExternalLink
                        href={gmailComposeUrl()}
                        data-cursor="magnetic"
                        className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-[#ece7dc] px-5 text-sm font-medium text-[#0d0d0f] transition-colors hover:bg-[#d6ba86] sm:min-h-12 sm:gap-2.5 sm:px-6"
                      >
                        <Mail className="size-4" aria-hidden="true" />
                        Email me
                        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                      </ExternalLink>
                    </motion.span>
                  </MagneticWrap>
                  <CopyEmailButton className="border-white/25 text-[#ece7dc] hover:border-white" />
                </div>
                <p className="t-meta mt-4 text-[0.62rem] text-[#9a9487] sm:mt-5 sm:text-[0.68rem]">
                  Prefer your own mail app?{" "}
                  <a href={`mailto:${profile.email}`} className="underline underline-offset-4 hover:text-[#ece7dc]">
                    {profile.email}
                  </a>
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <ul className="divide-y divide-white/10 border-y border-white/10">
                  {socials
                    .filter((s) => s.id !== "email")
                    .map((s) => (
                      <li key={s.id}>
                        <ExternalLink href={s.href} data-cursor="magnetic" className="group flex min-h-14 items-center justify-between gap-4 py-3 sm:min-h-16 sm:py-4">
                          <span className="flex items-center gap-3 sm:gap-4">
                            <span className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 sm:size-10">
                              {s.id === "github" ? <GitHubIcon className="size-[16px] sm:size-[18px]" /> : <LinkedInIcon className="size-[14px] sm:size-[16px]" />}
                            </span>
                            <span>
                              <span className="block font-display text-xl sm:text-2xl">{s.label}</span>
                              <span className="t-meta block text-[0.58rem] text-[#9a9487] sm:text-[0.66rem]">{s.handle}</span>
                            </span>
                          </span>
                          <ArrowUpRight className="size-4 text-[#9a9487] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#d6ba86] sm:size-5" aria-hidden="true" />
                        </ExternalLink>
                      </li>
                    ))}
                </ul>
                <p className="t-meta mt-4 text-[0.58rem] text-[#9a9487] sm:mt-5 sm:text-[0.66rem]">{profile.location} · Replies usually within a few days</p>
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
