import resumeData from "@/lib/resume";

const experienceCount = resumeData.experience.length;
const toolsCount = resumeData.techStack.length;

const stats = [
  {
    label: "Professional experience",
    value: "5+ years",
    caption: "Hands-on across enterprise JavaScript platforms",
  },
  {
    label: "Enterprise teams partnered",
    value: `${experienceCount}`,
    caption: resumeData.experience.map((item) => item.company).join(" • "),
  },
  {
    label: "Technologies shipped in production",
    value: `${toolsCount}+`,
    caption: "Node.js, React, Postgres, AWS, and more",
  },
];

export function Stats() {
  return (
    <section className="grid gap-4 sm:grid-cols-3" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">
        Key experience highlights
      </h2>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-white/10 bg-slate-900/50 p-6"
        >
          <p className="text-3xl font-semibold text-white">{stat.value}</p>
          <p className="mt-2 text-sm font-medium text-slate-200/75">{stat.label}</p>
          {stat.caption ? (
            <p className="mt-1 text-xs text-slate-400">{stat.caption}</p>
          ) : null}
        </div>
      ))}
    </section>
  );
}
