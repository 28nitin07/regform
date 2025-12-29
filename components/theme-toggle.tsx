"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const dark = html.classList.contains("dark");
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");
    setIsDark(html.classList.contains("dark"));
  };

  return (
  <button
    onClick={toggleTheme}
    aria-label="Toggle theme"
    className="
      fixed bottom-4 right-4 z-50
      h-10 w-10
      rounded-full
      border border-border
      bg-background
      text-foreground
      shadow-md
      hover:bg-accent
      transition
      flex items-center justify-center
    "
  >
    {isDark ? (
      <Sun className="h-5 w-5" />
    ) : (
      <Moon className="h-5 w-5" />
    )}
  </button>
);

}
