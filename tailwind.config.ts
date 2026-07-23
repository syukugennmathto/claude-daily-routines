import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — the paper of the magazine
        ivory: "#F7F4ED",
        "warm-white": "#FBFAF6",
        beige: "#EDE6D8",
        // Secondary
        "light-gray": "#D9D6CF",
        sage: "#A8B4A0",
        "sage-deep": "#8B9A82",
        "dusty-brown": "#9C8873",
        "dusty-brown-deep": "#7A6B5A",
        // Accent
        gold: "#C6A868",
        "gold-soft": "#D8C29A",
        // Ink
        ink: "#3B372F",
        "ink-soft": "#6B6559",
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-jp)", "system-ui", "sans-serif"],
        display: ["var(--font-zen-maru)", "var(--font-noto-sans-jp)", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      letterSpacing: {
        editorial: "0.02em",
      },
      maxWidth: {
        editorial: "1360px",
        reading: "680px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
