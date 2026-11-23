import type { ReactNode } from 'react'
import { profile, type Interest, type Project, type ProjectStatus } from '../data/profile'
import { useCopy } from '../hooks/useCopy'
import CopyIcon from './CopyIcon'
import ProjectArt from './ProjectArt'
import Reveal from './Reveal'

const heading = { fontFamily: 'var(--font-heading)' }

/* ---------- layout helpers ---------- */

function Section({
  id,
  index,
  title,
  kicker,
  children,
}: {
  id: string
  index: string
  title: string
  kicker?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-16 px-5 py-20 sm:px-8 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[240px_1fr] md:gap-12">
        <Reveal className="md:sticky md:top-28 md:self-start">
          <p className="flex items-center gap-3 text-[13px] text-[var(--accent)] tabular-nums">
            <span>{index}</span>
            <span className="h-px w-10 bg-[var(--accent)]/60" />
          </p>
          <h2 className="mt-3 text-[30px] leading-[1.05] tracking-[-0.07em] text-white sm:text-[36px]" style={heading}>
            {title}
          </h2>
          {kicker && <p className="mt-3 max-w-[240px] text-[15px] leading-snug text-white/50">{kicker}</p>}
        </Reveal>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="mb-5 text-[12px] tracking-[0.16em] text-white/45 uppercase">{children}</h3>
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/[0.035] ring-1 ring-white/10 transition duration-300 hover:bg-white/[0.05] hover:ring-[var(--accent)]/50 ${className}`}>
      {children}
    </div>
  )
}

/* ---------- marquee ---------- */

const MARQUEE = ['Computer Science', 'Robotics', 'Arduino', 'Open source', 'Made in Algeria']

function Marquee() {
  const items = [...MARQUEE, ...MARQUEE]
  return (
    <div aria-hidden="true" className="overflow-hidden border-y border-white/10 py-6 select-none">
      <div className="marquee-track flex w-max">
        {items.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-10 pr-10 text-[clamp(24px,3.6vw,48px)] tracking-[-0.06em] whitespace-nowrap text-white/85"
            style={heading}
          >
            {t}
            <span className="text-[0.6em] text-[var(--accent)]">✳︎</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- sections ---------- */

function About({ index }: { index: string }) {
  return (
    <Section id="about" index={index} title="About me">
      <div className="grid gap-10 lg:grid-cols-[1fr_280px] lg:gap-12">
        <div>
          <Reveal>
            <div className="space-y-6 text-[17px] leading-[1.6] text-white/85 sm:text-[20px]">
              {profile.about.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-3">
            {profile.facts.map((f, i) => (
              <Reveal key={f.label} delay={i * 70}>
                <Card className="h-full px-5 py-4">
                  <p className="text-[12px] tracking-[0.12em] text-white/45 uppercase">{f.label}</p>
                  <p className="mt-1.5 text-[17px] text-white sm:text-[19px]">{f.value}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={120} className="order-first lg:order-none">
          <div className="relative max-w-[280px]">
            <img
              src="/images/avatar-1.jpg"
              alt={`3D portrait of ${profile.name}`}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-3xl object-cover object-[50%_20%] ring-1 ring-white/10"
            />
            <a
              href={profile.github.href}
              target="_blank"
              rel="noreferrer"
              className="absolute -bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] text-black shadow-lg transition-colors hover:bg-black hover:text-white"
            >
              <GitHubIcon /> @{profile.github.handle}
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

const STATUS: Record<ProjectStatus, { label: string; dot: string; text: string }> = {
  live: { label: 'Live', dot: 'bg-emerald-400', text: 'text-emerald-300' },
  building: { label: 'In development', dot: 'bg-amber-300', text: 'text-amber-200' },
  planned: { label: 'Planned', dot: 'bg-white/40', text: 'text-white/55' },
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = STATUS[status]
  return (
    <span className={`inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-[12px] ${s.text}`}>
      <span className="relative flex h-2 w-2">
        {status === 'live' && <span className={`absolute inset-0 animate-ping rounded-full ${s.dot} opacity-60`} />}
        <span className={`relative h-2 w-2 rounded-full ${s.dot}`} />
      </span>
      {s.label}
    </span>
  )
}

function ProjectBody({ p }: { p: Project }) {
  return (
    <div className="flex flex-1 flex-col p-6 sm:p-8">
      <StatusBadge status={p.status} />
      <h3 className="mt-4 text-[26px] leading-tight tracking-[-0.06em] text-white sm:text-[30px]" style={heading}>
        {p.title}
      </h3>
      <p className="mt-2 text-[17px] leading-snug text-white/75">{p.summary}</p>
      <ul className="mt-5 space-y-2">
        {p.details.map((d) => (
          <li key={d} className="flex gap-3 text-[15px] leading-[1.5] text-white/60">
            <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-white/40" />
            {d}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <ul className="flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <li key={t} className="rounded-full border border-white/15 px-3 py-1 text-[12px] text-white/65">
              {t}
            </li>
          ))}
        </ul>
        {p.links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {p.links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-[15px] transition-colors duration-200 ${
                  i === 0
                    ? 'bg-white text-black hover:bg-black hover:text-white hover:ring-1 hover:ring-white/30'
                    : 'border border-white/30 text-white hover:bg-white hover:text-black'
                }`}
              >
                {l.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Projects({ index }: { index: string }) {
  return (
    <Section id="projects" index={index} title="Projects" kicker="Things I build because I want them to exist.">
      <div className="space-y-4">
        {profile.projects.map((p, i) => (
          <Reveal key={p.title} delay={i * 90}>
            <Card className="grid overflow-hidden lg:grid-cols-[1.05fr_1fr]">
              {/* Art on the left for odd cards, on the right for even ones (desktop). */}
              <div
                className={`aspect-[4/3] border-b border-white/10 lg:aspect-auto lg:min-h-[380px] lg:border-b-0 ${
                  i % 2 ? 'lg:order-last lg:border-l' : 'lg:border-r'
                }`}
              >
                <ProjectArt kind={p.art} />
              </div>
              <ProjectBody p={p} />
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

function InterestIcon({ icon }: { icon: Interest['icon'] }) {
  const common = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (icon === 'chess')
    return (
      <span
        aria-hidden="true"
        className="text-[28px] leading-none"
        style={{ fontFamily: '"DejaVu Sans", "Segoe UI Symbol", "Noto Sans Symbols 2", sans-serif' }}
      >
        ♞
      </span>
    )
  return (
    <svg {...common}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
    </svg>
  )
}

function Beyond({ index }: { index: string }) {
  return (
    <Section id="beyond" index={index} title="Beyond code">
      <div className="grid gap-4 sm:grid-cols-2">
        {profile.interests.map((it, i) => (
          <Reveal key={it.title} delay={i * 80} className="h-full">
            <Card className="h-full p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-white/85">
                <InterestIcon icon={it.icon} />
              </span>
              <p className="mt-5 text-[21px] tracking-[-0.05em] text-white" style={heading}>
                {it.title}
              </p>
              <p className="mt-2 text-[15px] leading-[1.5] text-white/60">{it.text}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

function Skills({ index }: { index: string }) {
  return (
    <Section id="skills" index={index} title="Skills & languages">
      <div className="grid gap-12 lg:grid-cols-2">
        <Reveal>
          <SubHeading>Skills</SubHeading>
          <ul className="flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <li key={s} className="rounded-full bg-white/[0.06] px-4 py-2 text-[15px] text-white/90 ring-1 ring-white/10">
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={100}>
          <SubHeading>Languages</SubHeading>
          <ul className="space-y-4">
            {profile.languages.map((l) => (
              <li key={l.name} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[18px] text-white">{l.name}</p>
                  <p className="text-[14px] text-white/50">{l.level}</p>
                </div>
                <span className="flex gap-1.5" aria-label={`${l.score} out of 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`h-2 w-6 rounded-full ${i < l.score ? 'bg-white' : 'bg-white/12'}`}
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  )
}

function Education({ index }: { index: string }) {
  return (
    <Section id="education" index={index} title="Education">
      <ol className="relative border-l border-white/15 pl-8">
        {profile.education.map((e, i) => (
          <li key={e.title + e.period} className="relative pb-12 last:pb-0">
            <span className="absolute top-1.5 -left-[37px] h-2.5 w-2.5 rounded-full bg-white ring-4 ring-[#141416]" />
            <Reveal delay={i * 90}>
              <p className="text-[14px] text-white/45 tabular-nums">{e.period}</p>
              <p className="mt-1 text-[22px] tracking-[-0.05em] text-white" style={heading}>
                {e.title}
              </p>
              <p className="mt-1 text-[16px] text-white/60">{e.place}</p>
              {e.detail && <p className="mt-2 text-[15px] text-white/80">{e.detail}</p>}
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  )
}

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.82 1.19 3.08 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}

function Contact({ index }: { index: string }) {
  const { copied, copy } = useCopy()
  return (
    <Section id="contact" index={index} title="Contact">
      <Reveal>
        <p className="text-[17px] text-white/65 sm:text-[20px]">
          {profile.email ? 'The best way to reach me is by email.' : 'Everything I build lives on GitHub.'}
        </p>

        {profile.email && (
          <button
            type="button"
            onClick={() => copy(profile.email)}
            className="mt-5 inline-flex max-w-full cursor-pointer items-center gap-3 text-left text-[clamp(26px,5vw,56px)] tracking-[-0.06em] break-all text-white transition-opacity hover:opacity-60"
            style={heading}
          >
            <span className="underline decoration-1 underline-offset-[8px]">{profile.email}</span>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-[15px] text-white/60" style={{ fontFamily: 'var(--font-body)' }}>
              <CopyIcon copied={copied} />
              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>
        )}

        <a
          href={profile.github.href}
          target="_blank"
          rel="noreferrer"
          className={`group inline-flex items-center gap-4 tracking-[-0.06em] text-white transition-opacity hover:opacity-70 ${
            profile.email ? 'mt-8 text-[clamp(22px,3vw,32px)]' : 'mt-5 text-[clamp(28px,5vw,64px)]'
          }`}
          style={heading}
        >
          <GitHubIcon size={profile.email ? 26 : 48} />
          <span className="underline decoration-1 underline-offset-[8px]">github.com/{profile.github.handle}</span>
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
            ↗
          </span>
        </a>

        {profile.socials.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {profile.socials.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-5 py-2 text-[15px] text-white transition-colors duration-200 hover:bg-white hover:text-black"
                >
                  {s.label} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </Section>
  )
}

export default function Sections() {
  // Sections with no content are skipped, and the rest are numbered in order.
  const visible = (
    [
      ['about', About, true],
      ['projects', Projects, profile.projects.length > 0],
      ['beyond', Beyond, profile.interests.length > 0],
      ['skills', Skills, true],
      ['education', Education, profile.education.length > 0],
      ['contact', Contact, true],
    ] as const
  ).filter(([, , show]) => show)
  return (
    <main className="section-grid relative bg-[#0c0a09] text-white">
      <Marquee />
      {visible.map(([key, Comp], i) => (
        <Comp key={key} index={String(i + 1).padStart(2, '0')} />
      ))}
      <footer className="border-t border-white/10 px-5 py-8 text-[14px] text-white/40 sm:px-8 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>Made in Algeria <span className="text-[var(--accent)]">✳︎</span></span>
        </div>
      </footer>
    </main>
  )
}
