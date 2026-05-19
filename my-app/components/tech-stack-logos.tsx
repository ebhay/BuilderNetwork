"use client";

const techLogos: Array<{ name: string; slug: string }> = [
  { name: "Python", slug: "python" },
  { name: "JavaScript", slug: "javascript" },
  { name: "TypeScript", slug: "typescript" },
  { name: "React", slug: "react" },
  { name: "Next.js", slug: "nextdotjs" },
  { name: "Supabase", slug: "supabase" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "MongoDB", slug: "mongodb" },
  { name: "Node.js", slug: "nodedotjs" },
  { name: "Tailwind", slug: "tailwindcss" },
  { name: "Docker", slug: "docker" },
  { name: "AWS", slug: "amazonaws" },
];

export function TechStackLogos() {
  return (
    <section className="mt-16 overflow-hidden py-4">
      <p className="text-center text-sm text-muted-foreground">Built with modern tech stacks</p>
      <div className="relative mt-6">
        <div className="flex animate-scroll gap-8">
          {[...techLogos, ...techLogos, ...techLogos].map((tech, index) => (
            <div
              key={`${tech.name}-${index}`}
              className="group flex shrink-0 items-center gap-3 rounded-lg bg-background px-5 py-3 transition-colors"
            >
              <img
                src={`https://cdn.simpleicons.org/${tech.slug}`}
                alt={`${tech.name} logo`}
                className="h-7 w-7 shrink-0 grayscale transition duration-200 group-hover:grayscale-0"
                loading="lazy"
                decoding="async"
              />
              <span className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors group-hover:text-ink">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
      `}</style>
    </section>
  );
}
