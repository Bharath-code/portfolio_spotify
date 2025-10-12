import resumeData from "@/lib/resume";

export function Skills() {
  const { leadership, openSource } = resumeData;

  return (
    <section className="space-y-6" aria-labelledby="skills-heading">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-400">
          Collaboration & community
        </span>
        <h2 id="skills-heading" className="text-3xl font-semibold text-white">
          Beyond shipping features.
        </h2>
        <p className="max-w-2xl text-base text-slate-300/80">
          Mentorship, documentation, and community contributions keep teams aligned and the ecosystem thriving.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-inner shadow-black/30">
          <h3 className="text-xl font-semibold text-white">Leadership & Mentorship</h3>
          <ul className="space-y-3 text-sm text-slate-300/80">
            {leadership.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-inner shadow-black/30">
          <h3 className="text-xl font-semibold text-white">Open source & ecosystem</h3>
          <ul className="space-y-3 text-sm text-slate-300/80">
            {openSource.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
