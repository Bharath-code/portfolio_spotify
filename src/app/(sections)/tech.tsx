import resumeData from "@/lib/resume";

const categories = [
  {
    heading: "Frontend craft",
    description:
      "Building accessible, high-performing interfaces across design systems and modern frameworks.",
    items: ["React", "Next.js", "Sveltekit", "Astro", "Tailwind", "shadcnUI"],
  },
  {
    heading: "Backend & APIs",
    description:
      "Designing resilient services, authentication flows, and efficient data access patterns.",
    items: ["Node.js", "Express", "TypeScript", "GraphQL", "REST"],
  },
  {
    heading: "Data & Infrastructure",
    description:
      "Shipping reliable deployments with strong observability, automation, and cloud discipline.",
    items: ["Postgres", "MongoDB", "Redis", "Docker", "Kubernetes", "GitHub Actions", "AWS"],
  },
];

const mastered = new Set(resumeData.techStack);

export function TechStack() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_1fr]" aria-labelledby="stack-heading">
      <div className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-400">
          Core stack
        </span>
        <h2 id="stack-heading" className="text-3xl font-semibold text-white">
          JavaScript-first execution from API to browser.
        </h2>
        <p className="max-w-xl text-base text-slate-300/80">
          Daily driver tools span the entire product surface—covering service design, UI systems, and production infrastructure.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((group) => (
          <div
            key={group.heading}
            className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-inner shadow-black/30"
          >
            <p className="text-sm font-semibold text-slate-100">{group.heading}</p>
            <p className="mt-2 text-xs text-slate-400">{group.description}</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs text-sky-200/90">
              {group.items
                .filter((tool) => mastered.has(tool))
                .map((tool) => (
                  <li
                    key={tool}
                    className="rounded-full border border-sky-500/30 px-3 py-1"
                  >
                    {tool}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
