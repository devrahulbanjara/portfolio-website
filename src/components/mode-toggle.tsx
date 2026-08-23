"use client";

import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Theme toggle.
 *
 * The template's version had `hidden` hard-coded on the moon icon, so the icon
 * never actually swapped.
 *
 * The swap is done with CSS rather than React state on purpose. Dark mode here
 * is class-based (`@custom-variant dark` in globals.css), so `dark:` variants
 * already know the current theme with no JavaScript. Gating on a mounted flag
 * instead would mean calling setState in an effect, which flickers on first
 * paint and is a lint error under react-hooks/set-state-in-effect.
 */
export function ModeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="link"
      size="icon"
      aria-label="Toggle theme"
      className={cn(className)}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="h-full w-full dark:hidden" />
      <MoonIcon className="hidden h-full w-full dark:block" />
    </Button>
  );
}
