import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { ResultView } from "@/components/ResultView";
import { ScoreLoading } from "@/components/ScoreLoading";
import { allCodes, iAm, parseCode, roastFor, tierFor } from "@/lib/score";
import { SITE_NAME } from "@/lib/site";

export function generateStaticParams() {
  return allCodes().map((code) => ({ code }));
}

export async function generateMetadata({ params }: PageProps<"/r/[code]">): Promise<Metadata> {
  const result = parseCode((await params).code);
  if (!result) return { title: `Model not found · ${SITE_NAME}` };
  const tier = tierFor(result.score);
  const title = `${iAm(tier)} · ${result.score}/100`;
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

export default function ResultPage({ params }: PageProps<"/r/[code]">) {
  return (
    <>
      <Suspense fallback={<ScoreLoading />}>
        <Result params={params} />
      </Suspense>
      <Footer />
    </>
  );
}
