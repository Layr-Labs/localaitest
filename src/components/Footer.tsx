import { CREATOR, INSPIRED_BY, OPERATOR, REPO_URL } from "@/lib/site";

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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <p>
              Made with ❤️ by <ExternalLink href={CREATOR.url}>{CREATOR.name}</ExternalLink>
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white/80 light:text-black/80 underline decoration-white/30 light:decoration-black/30 underline-offset-4 transition-colors hover:text-white light:hover:text-black hover:decoration-accent"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Open source on GitHub
            </a>
          </div>
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
