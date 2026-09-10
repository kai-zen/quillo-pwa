import type { CSSProperties } from "react";

/**
 * Deterministic "sticky note" look for a note card: a paper color, a slight
 * tilt, and a strip of tape — all derived from the note's id so a given note
 * always renders the same way instead of re-randomizing on every render.
 */

interface StickyNoteTheme {
  card: string;
  tape: string;
}

const STICKY_NOTE_THEMES: StickyNoteTheme[] = [
  {
    card: "bg-amber-100 border-amber-200/80 dark:bg-amber-500/15 dark:border-amber-400/25",
    tape: "bg-amber-50/70 border-amber-100/60 dark:bg-amber-100/15 dark:border-amber-100/10",
  },
  {
    card: "bg-rose-100 border-rose-200/80 dark:bg-rose-500/15 dark:border-rose-400/25",
    tape: "bg-rose-50/70 border-rose-100/60 dark:bg-rose-100/15 dark:border-rose-100/10",
  },
  {
    card: "bg-sky-100 border-sky-200/80 dark:bg-sky-500/15 dark:border-sky-400/25",
    tape: "bg-sky-50/70 border-sky-100/60 dark:bg-sky-100/15 dark:border-sky-100/10",
  },
  {
    card: "bg-emerald-100 border-emerald-200/80 dark:bg-emerald-500/15 dark:border-emerald-400/25",
    tape: "bg-emerald-50/70 border-emerald-100/60 dark:bg-emerald-100/15 dark:border-emerald-100/10",
  },
  {
    card: "bg-violet-100 border-violet-200/80 dark:bg-violet-500/15 dark:border-violet-400/25",
    tape: "bg-violet-50/70 border-violet-100/60 dark:bg-violet-100/15 dark:border-violet-100/10",
  },
  {
    card: "bg-orange-100 border-orange-200/80 dark:bg-orange-500/15 dark:border-orange-400/25",
    tape: "bg-orange-50/70 border-orange-100/60 dark:bg-orange-100/15 dark:border-orange-100/10",
  },
];

const TILT_DEGREES = [-5, -4, -3, -2, 2, 3, 4, 5];
const TAPE_TILT_DEGREES = [-14, -10, -6, 6, 10, 14];
const TAPE_SIDES = ["left", "center", "right"] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface StickyNoteStyle {
  cardClassName: string;
  tapeClassName: string;
  tilt: number;
  tapeTilt: number;
  tapeSide: (typeof TAPE_SIDES)[number];
}

export function getStickyNoteStyle(id: string): StickyNoteStyle {
  const hash = hashString(id);
  const theme = STICKY_NOTE_THEMES[hash % STICKY_NOTE_THEMES.length];
  const tilt =
    TILT_DEGREES[Math.floor(hash / STICKY_NOTE_THEMES.length) % TILT_DEGREES.length];
  const tapeTilt =
    TAPE_TILT_DEGREES[Math.floor(hash / 7) % TAPE_TILT_DEGREES.length];
  const tapeSide = TAPE_SIDES[Math.floor(hash / 13) % TAPE_SIDES.length];

  return {
    cardClassName: theme.card,
    tapeClassName: theme.tape,
    tilt,
    tapeTilt,
    tapeSide,
  };
}

export function stickyNoteCssVars(style: StickyNoteStyle): CSSProperties {
  return {
    "--tilt": `${style.tilt}deg`,
    "--tape-tilt": `${style.tapeTilt}deg`,
  } as CSSProperties;
}

export const tapePositionClass: Record<StickyNoteStyle["tapeSide"], string> = {
  left: "left-5",
  center: "left-1/2",
  right: "right-5",
};

export function tapeTransform(side: StickyNoteStyle["tapeSide"]): string {
  return side === "center"
    ? "translateX(-50%) rotate(var(--tape-tilt))"
    : "rotate(var(--tape-tilt))";
}
