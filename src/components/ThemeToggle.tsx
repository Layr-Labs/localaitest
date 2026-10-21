"use client";

import { useEffect, useState } from "react";

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    // Reading the saved theme has to wait until after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "light") setTheme("light");
  }, []);

  function select(next: "dark" | "light") {
    setTheme(next);
    if (next === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("theme", next);
  }

  return (
    <div
      role="group"
      aria-label="Color mode"
      className="flex items-center gap-0.5 rounded-full border border-white/20 light:border-black/15 bg-black/40 light:bg-white/80 px-1 py-1 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={() => select("dark")}
        aria-pressed={theme === "dark"}
        aria-label="Dark mode"
        title="Dark mode"
        className={`p-1.5 rounded-full transition-colors ${
          theme === "dark"
            ? "bg-accent text-white"
            : "text-white/50 light:text-black/50 hover:text-white light:hover:text-black"
        }`}
      >
        <MoonIcon />
      </button>
      <button
        type="button"
        onClick={() => select("light")}
        aria-pressed={theme === "light"}
        aria-label="Light mode"
        title="Light mode"
        className={`p-1.5 rounded-full transition-colors ${
          theme === "light"
            ? "bg-accent text-white"
            : "text-white/50 light:text-black/50 hover:text-white light:hover:text-black"
        }`}
      >
        <SunIcon />
      </button>
    </div>
  );
}
