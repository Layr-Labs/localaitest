import type { Joke as JokeType } from "@/data/items";

function BadPelican() {
  // Deliberately terrible, in the grand tradition of models drawing pelicans.
  return (
    <svg viewBox="0 0 120 70" width="120" height="70" role="img" aria-label="A badly drawn pelican riding a bicycle">
      <circle cx="28" cy="52" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="92" cy="52" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M28 52 L55 50 L92 52 M55 50 L48 30" fill="none" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="62" cy="22" rx="20" ry="11" fill="#e4e4e7" stroke="currentColor" strokeWidth="2" />
      <circle cx="84" cy="10" r="6" fill="#e4e4e7" stroke="currentColor" strokeWidth="2" />
      <path d="M89 9 L116 15 L89 14 Z" fill="#facc15" stroke="currentColor" strokeWidth="1.5" />
      <path d="M58 32 L52 50 M68 32 L76 46" stroke="#f97316" strokeWidth="2" />
      <circle cx="85" cy="8" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function Joke({ joke }: { joke: JokeType }) {
  if (typeof joke === "string") return <span>{joke}</span>;
  if (joke.kind === "pelican") return <BadPelican />;
  const chars = [...joke.text].length;
  return (
    <span
      className="type-slow font-mono"
      style={{ width: `${chars}ch`, animation: `type-out ${chars * 0.35}s steps(${chars}) both` }}
    >
      {joke.text}
    </span>
  );
}
