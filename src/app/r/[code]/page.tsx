import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { ResultView } from "@/components/ResultView";
import { allCodes, parseCode, RIG_CLASSES, roastFor, tierFor } from "@/lib/score";
import { SITE_NAME } from "@/lib/site";

export function generateStaticParams() {
  return allCodes().map((code) => ({ code }));
}

export async function generateMetadata({ params }: PageProps<"/r/[code]">): Promise<Metadata> {
  const result = parseCode((await params).code);
  if (!result) return { title: `Model not found · ${SITE_NAME}` };
  const tier = tierFor(result.score).name;
  const rig = result.rig ? ` on a ${RIG_CLASSES[result.rig].label} rig` : "";
  const title = `${result.score}/100 · running at ${tier}${rig}`;
  const description = `${roastFor(result.score)} Take ${SITE_NAME}.`;
  return {
    title: `${title} · ${SITE_NAME}`,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

async function Result({ params }: { params: PageProps<"/r/[code]">["params"] }) {
  const { code } = await params;
  const result = parseCode(code);
  if (!result) notFound();
  return <ResultView code={code} score={result.score} rig={result.rig} />;
}

function Loading() {
  return (
    <main className="mx-auto w-full max-w-[720px] px-4 pt-12">
      <div className="mt-8 rounded-xl bg-term p-8 font-mono text-sm text-term-green">
        <span className="cursor">llama_model_load: loading your score</span>
      </div>
    </main>
  );
}

export default function ResultPage({ params }: PageProps<"/r/[code]">) {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Result params={params} />
      </Suspense>
      <Footer />
    </>
  );
}
