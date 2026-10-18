import { CREATOR, INSPIRED_BY } from "@/lib/site";

const linkClass =
  "text-zinc-800 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-accent-dark hover:decoration-accent";

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto w-full pt-20 sm:pt-24">
      <div className="mx-auto max-w-[720px] border-t border-zinc-200 px-4 pt-8 pb-28 text-zinc-500">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-zinc-900">© 2026 Local AI Purity Test</p>
          <p className="flex items-center gap-2 font-mono text-xs text-zinc-500">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />0 cloud calls
          </p>
        </div>

        <section
          aria-labelledby="privacy-heading"
          className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6"
        >
          <h2 id="privacy-heading" className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent"
            >
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            Privacy
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-600">
            <p>
              Your answers never leave your browser. They&apos;re saved on this device only and reset deletes them.
              There are no accounts, no analytics and no tracking.
            </p>
            <p>
              Autofill is optional. Your browser asks Hugging Face and GitHub directly, so we never see your username.
              Share links carry only your score and rig class.
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-2 text-sm sm:flex-row sm:justify-between">
          <p>
            Made with ❤️ by <ExternalLink href={CREATOR.url}>{CREATOR.name}</ExternalLink>
          </p>
          <p>
            Inspired by work of{" "}
            <ExternalLink href={INSPIRED_BY.people[0].url}>{INSPIRED_BY.people[0].name}</ExternalLink> and{" "}
            <ExternalLink href={INSPIRED_BY.people[1].url}>{INSPIRED_BY.people[1].name}</ExternalLink> on{" "}
            <ExternalLink href={INSPIRED_BY.site.url}>{INSPIRED_BY.site.name}</ExternalLink>
          </p>
        </div>

        <p className="mt-10 font-mono text-xs text-zinc-400">
          <span className="text-accent">$</span> No cloud was used to calculate your score. It&apos;s 100 minus a
          number.
        </p>
      </div>
    </footer>
  );
}
