import resumeData from "@/lib/resume";

export function Education() {
  const education = resumeData.education;

  return (
    <section className="space-y-6" aria-labelledby="education-heading">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-400">
          Education
        </span>
        <h2 id="education-heading" className="text-3xl font-semibold text-white">
          Foundation in engineering.
        </h2>
        <p className="max-w-2xl text-base text-slate-300/80">
          Formal training in electrical and electronics engineering provided the analytical mindset that drives my software work today.
        </p>
      </div>
      <div className="grid gap-4">
        {education.map((item) => (
          <article
            key={`${item.degree}-${item.school}`}
            className="rounded-2xl border border-white/10 bg-slate-900/50 p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-sky-200/80">
              <span className="font-semibold uppercase tracking-wide">{item.school}</span>
              <span>{item.dates}</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">{item.degree}</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300/80">
              {item.details.map((detail) => (
                <li key={detail} className="flex gap-2">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
