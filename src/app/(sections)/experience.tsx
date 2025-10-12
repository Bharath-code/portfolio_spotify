import resumeData from "@/lib/resume";

const formatBullet = (value: string) =>
  value.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

export function Experience() {
  return (
    <section className="space-y-6" aria-labelledby="experience-heading">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-400">
          Experience
        </span>
        <h2 id="experience-heading" className="text-3xl font-semibold text-white">
          Shipping enterprise-grade platforms.
        </h2>
        <p className="max-w-2xl text-base text-slate-300/80">
          From banking reliability to security automation, I have delivered production code across high-stakes teams while mentoring peers and partners.
        </p>
      </div>
      <ol className="relative space-y-6 pl-6">
        <span className="absolute left-3 top-2 bottom-4 w-px bg-sky-400/40" aria-hidden />
        {resumeData.experience.map((item) => (
          <li
            key={`${item.company}-${item.title}`}
            className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-6"
          >
            <span className="absolute -left-3 top-6 h-3 w-3 rounded-full border border-sky-300 bg-slate-950" />
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-sky-200/80">
              <span>{item.dates}</span>
              <span className="rounded-full bg-sky-400/10 px-2 py-1 text-xs uppercase tracking-wide text-sky-200">
                {item.company}
              </span>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300/80">
              {item.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" />
                  <span dangerouslySetInnerHTML={{ __html: formatBullet(bullet) }} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
