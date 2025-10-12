import resumeData from "@/lib/resume";

function splitTech(stack: string) {
  return stack.split("•").map((item) => item.trim()).filter(Boolean);
}

export function Projects() {
  return (
    <section id="projects" className="space-y-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-400">
          Selected projects
        </span>
        <h2 className="text-3xl font-semibold text-white">
          Recent builds and experiments.
        </h2>
        <p className="max-w-2xl text-base text-slate-300/80">
          Personal and client projects that kept skills sharp during my sabbatical, spanning productivity, focus tooling, and storytelling.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {resumeData.projects.map((project) => (
          <article
            key={project.name}
            className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition hover:-translate-y-1 hover:border-sky-400/60"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">{project.name}</h3>
              <p className="text-sm text-slate-300/80">{project.desc}</p>
            </div>
            <ul className="flex flex-wrap gap-2 text-xs text-sky-200/90">
              {splitTech(project.tech).map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-sky-500/30 px-3 py-1"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
