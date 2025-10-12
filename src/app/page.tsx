import { CollaborationCTA } from "./(sections)/cta";
import { Experience } from "./(sections)/experience";
import { Hero } from "./(sections)/hero";
import { Projects } from "./(sections)/projects";
import { Stats } from "./(sections)/stats";
import { Skills } from "./(sections)/skills";
import { TechStack } from "./(sections)/tech";
import { Education } from "./(sections)/education";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-20 sm:px-10">
      <Hero />
      <Stats />
      <TechStack />
      <Skills />
      <Projects />
      <Experience />
      <Education />
      <CollaborationCTA />
      <footer className="border-t border-white/10 pt-8 text-sm text-slate-400">
        <p>
          Built with Bun + Next.js, deployed on Vercel. Drop a line if you want to
          ship something ambitious.
        </p>
      </footer>
    </main>
  );
}
