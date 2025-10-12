import Link from "next/link";

import resumeData from "@/lib/resume";

const { personal, profile } = resumeData;

const socials = [
  { href: personal.github, label: "GitHub" },
  { href: personal.linkedin, label: "LinkedIn" },
  { href: `mailto:${personal.email}`, label: "Email" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-16 shadow-xl ring-1 ring-sky-500/40 backdrop-blur">
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="mx-auto max-w-3xl space-y-8 text-center">
        <span className="text-sm font-mono uppercase tracking-[0.35em] text-sky-300/80">
          {personal.role} • {personal.location}
        </span>
        <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl">
          {personal.name}
        </h1>
        <p className="text-balance text-lg text-slate-200/80">
          {profile}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="#projects"
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            View highlighted projects
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/spotify"
            className="inline-flex items-center gap-2 rounded-full border border-sky-200/40 px-6 py-3 text-sm font-semibold text-sky-200 transition hover:border-sky-300 hover:text-white"
          >
            Spotify API integration
            <span aria-hidden>↗</span>
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300/80">
          {socials.map((social) => (
            <Link
              key={social.href}
              href={social.href}
              className="rounded-full border border-slate-700 px-4 py-2 transition hover:border-sky-400 hover:text-sky-200"
            >
              {social.label}
            </Link>
          ))}
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-slate-300/80">
            {personal.phone}
          </span>
        </div>
      </div>
    </section>
  );
}
