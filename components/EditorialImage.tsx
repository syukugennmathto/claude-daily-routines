import { rng, toneFor } from "@/lib/palette";

type Props = {
  seed: string;
  tone?: string;
  className?: string;
  ratio?: string; // e.g. "4 / 5", "16 / 9"
  label?: string;
  rounded?: boolean;
  priority?: boolean;
};

/**
 * A calm, editorial placeholder "photograph".
 * Deterministic per seed — soft layered washes, a horizon of light,
 * a few organic forms and a whisper of grain. Pure SVG, no network.
 */
export default function EditorialImage({
  seed,
  tone,
  className = "",
  ratio = "4 / 5",
  label,
  rounded = false,
}: Props) {
  const t = toneFor(seed, tone);
  const r = rng(seed);
  const gid = `g-${Math.abs(hashLabel(seed))}`;

  // Organic forms — a scattering of soft shapes.
  const blobs = Array.from({ length: 3 }).map((_, i) => {
    const cx = 15 + r() * 70;
    const cy = 20 + r() * 65;
    const rad = 16 + r() * 26;
    const op = 0.28 + r() * 0.35;
    return { cx, cy, rad, op, key: i };
  });

  const horizon = 46 + r() * 22;

  return (
    <div
      className={`relative overflow-hidden ${rounded ? "rounded-2xl" : ""} ${className}`}
      style={{ aspectRatio: ratio, backgroundColor: t.bg }}
      role="img"
      aria-label={label ?? "作品イメージ"}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${gid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.wash[0]} />
            <stop offset="100%" stopColor={t.bg} />
          </linearGradient>
          <linearGradient id={`${gid}-ground`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.wash[1]} />
            <stop offset="100%" stopColor={t.wash[0]} />
          </linearGradient>
          <radialGradient id={`${gid}-light`} cx="70%" cy="22%" r="62%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${gid}-vignette`} cx="50%" cy="46%" r="72%">
            <stop offset="62%" stopColor={t.ink} stopOpacity="0" />
            <stop offset="100%" stopColor={t.ink} stopOpacity="0.16" />
          </radialGradient>
          <filter id={`${gid}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="3.2" numOctaves="1" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0" />
          </filter>
        </defs>

        <rect x="0" y="0" width="100" height={horizon} fill={`url(#${gid}-sky)`} />
        <rect x="0" y={horizon} width="100" height={100 - horizon} fill={`url(#${gid}-ground)`} />

        {blobs.map((b) => (
          <circle key={b.key} cx={b.cx} cy={b.cy} r={b.rad} fill={t.accent} opacity={b.op * 0.42} />
        ))}

        <line x1="0" y1={horizon} x2="100" y2={horizon} stroke={t.ink} strokeOpacity="0.08" strokeWidth="0.3" />
        <rect x="0" y="0" width="100" height="100" fill={`url(#${gid}-light)`} />
        <rect x="0" y="0" width="100" height="100" fill={`url(#${gid}-vignette)`} />
        <rect x="0" y="0" width="100" height="100" filter={`url(#${gid}-grain)`} opacity="0.05" />
      </svg>
    </div>
  );
}

function hashLabel(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
