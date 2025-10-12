import Link from "next/link";

import resumeData from "@/lib/resume";

export function CollaborationCTA() {
  const { personal } = resumeData;

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/60 px-8 py-12 text-center shadow-xl" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-2xl space-y-4">
        <h2 id="cta-heading" className="text-3xl font-semibold text-white">
          Let&apos;s build your next production feature.
        </h2>
        <p className="text-base text-slate-300/80">
          I&apos;m currently open to full-time or contract opportunities centered around Node.js, React, and cloud-native delivery. Reach out and let&apos;s chat about your roadmap.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`mailto:${personal.email}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            {personal.email}
            <span aria-hidden>→</span>
          </Link>
          <Link
            href={personal.portfolio}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-200/40 px-6 py-3 text-sm font-semibold text-sky-200 transition hover:border-sky-300 hover:text-white"
          >
            View full resume site
            <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
