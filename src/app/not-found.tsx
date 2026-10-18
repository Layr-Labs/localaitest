import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SITE_DOMAIN } from "@/lib/site";

export default function NotFound() {
  return (
    <>
      <main className="mx-auto w-full max-w-[720px] px-4 pt-16">
        <div className="rounded-xl bg-term p-6 font-mono text-sm text-zinc-200 shadow-lg sm:text-base">
          <p className="text-term-green">$ ollama run this-page</p>
          <p className="mt-2 text-red-400">Error: model &apos;this-page&apos; not found, try pulling it first</p>
          <p className="mt-4 text-zinc-400">
            Try: <span className="text-zinc-200">ollama pull {SITE_DOMAIN}</span>
          </p>
        </div>
        <Link href="/" className="mt-6 inline-block rounded-md bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-dark">
          Take the test instead
        </Link>
      </main>
      <Footer />
    </>
  );
}
