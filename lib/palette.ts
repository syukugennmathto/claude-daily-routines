// Deterministic, palette-driven placeholder art.
// Every "photograph" on the site is a calm, abstract composition generated
// from a seed string so the same subject always renders the same way.

export type Tone = {
  name: string;
  bg: string;
  wash: [string, string];
  accent: string;
  ink: string;
};

export const tones: Record<string, Tone> = {
  ivory: { name: "ivory", bg: "#F7F4ED", wash: ["#EDE6D8", "#E4DBC9"], accent: "#C6A868", ink: "#7A6B5A" },
  sage: { name: "sage", bg: "#EEF0E9", wash: ["#CDD6C4", "#A8B4A0"], accent: "#8B9A82", ink: "#5C6552" },
  brown: { name: "brown", bg: "#EFE7DB", wash: ["#D9C7B0", "#9C8873"], accent: "#7A6B5A", ink: "#5A4E40" },
  gold: { name: "gold", bg: "#F5EEDD", wash: ["#E6D3A6", "#D8C29A"], accent: "#C6A868", ink: "#8A754A" },
  gray: { name: "gray", bg: "#F1F0EC", wash: ["#DCD9D1", "#C4C1B8" ], accent: "#A8B4A0", ink: "#6B6559" },
  warm: { name: "warm", bg: "#FBF6EC", wash: ["#F0E4CE", "#E6D6B8"], accent: "#C6A868", ink: "#8A7350" },
};

export const toneKeys = Object.keys(tones);

// Simple deterministic hash so a seed → stable numbers.
export function seededHash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function toneFor(seed: string, preferred?: string): Tone {
  if (preferred && tones[preferred]) return tones[preferred];
  const idx = seededHash(seed) % toneKeys.length;
  return tones[toneKeys[idx]];
}

// A small seeded PRNG (mulberry32) for laying out organic shapes.
export function rng(seed: string) {
  let a = seededHash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
