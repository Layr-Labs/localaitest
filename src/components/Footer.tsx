import { CREATOR, INSPIRED_BY, OPERATOR } from "@/lib/site";

const linkClass =
  "text-white/80 light:text-black/80 underline decoration-white/30 light:decoration-black/30 underline-offset-4 transition-colors hover:text-white light:hover:text-black hover:decoration-accent";

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
    </a>
  );
}

export function Footer({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <footer className="mt-auto w-full pt-20 sm:pt-24">
      <div className={`${fullWidth ? "" : "mx-auto max-w-[720px] px-4"} border-t border-white/10 light:border-black/10 pt-8 pb-28 text-white/50 light:text-black/50`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            Made with ❤️ by <ExternalLink href={CREATOR.url}>{CREATOR.name}</ExternalLink>
          </p>
          <p className="flex items-center gap-2 font-mono text-xs text-white/50 light:text-black/50">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />0 cloud calls
          </p>
        </div>

        <p className="mt-8 font-mono text-xs text-white/40 light:text-black/40">
          <span className="text-accent">$</span> No cloud was used to calculate your score. It&apos;s a count of boxes.
        </p>

        <p className="mt-3 text-xs leading-relaxed text-white/50 light:text-black/50">
          Inspired by the work of{" "}
          <ExternalLink href={INSPIRED_BY.people[0].url}>{INSPIRED_BY.people[0].name}</ExternalLink> and{" "}
          <ExternalLink href={INSPIRED_BY.people[1].url}>{INSPIRED_BY.people[1].name}</ExternalLink> on{" "}
          <ExternalLink href={INSPIRED_BY.site.url}>{INSPIRED_BY.site.name}</ExternalLink>.
        </p>

        <p className="mt-6 text-xs text-white/40 light:text-black/40">© 2026 {OPERATOR}</p>

        <section
          aria-labelledby="privacy-heading"
          className="mt-6 rounded-xl border border-white/10 light:border-black/10 bg-white/5 light:bg-black/5 p-5 sm:p-6"
        >
          <h2 id="privacy-heading" className="flex items-center gap-2 text-sm font-semibold text-white light:text-black">
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
          {/* Wording reviewed by legal. Keep it in sync with what the site actually does. OPERATOR ends in a
              period ("Inc."), so it also ends the sentence it closes. */}
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/60 light:text-black/60">
            <p>
              Your answers never leave your browser. They&apos;re saved on this device only and Reset deletes them.
              There are no accounts, no analytics and no tracking and we don&apos;t keep or log anything ourselves.
            </p>
            <p>Our hosting provider receives standard request data, like your IP address, to serve the page.</p>
            <p>
              Autofill is optional. If you connect GitHub or Hugging Face, your browser contacts them directly to read
              your public profile and they handle your login under their own privacy policies. Share links carry only
              your score and rig class.
            </p>
            <p>This site is run by {OPERATOR} We process this data only to run the site and the features you choose.</p>
          </div>
        </section>
      </div>
    </footer>
  );
}
