/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        recollab: {
          blue: "#0d3c61",
          gold: "#d4af37",
          crimson: "#800020",
          navy: "#0a192f",
          accent: "#1e3a8a",
        },
        srm: {
          blue: "#0d3c61",
          gold: "#d4af37",
          crimson: "#800020",
          navy: "#0a192f",
          accent: "#1e3a8a",
        },
        // Premium ElevenLabs Design System Colors
        darkBg: "#f5f3f1",
        darkSurface: "#ffffff",
        darkSurfaceMuted: "#f7f4f2",
        darkPanel: "#1e1916",
        indigoElectric: "#6C63FF",
        violetRoyal: "#9B59B6",
        tealGlow: "#00C2B2",
        textPrimary: "#000000",
        textMuted: "#a59f97",
        textSecondary: "#6e6e6e",
        textTertiary: "#a59f97",
        textMutedDark: "#a59f97",
        dangerAlert: "#c00",
        borderStroke: "#e8e5e1",
        aiBlue: "#61b5db",
        
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Inter Fallback", "sans-serif"],
        display: ["var(--font-display)", "Waldenburg", "Waldenburg Fallback", "sans-serif"],
        mono: ["var(--font-mono)", "WaldenburgFH", "WaldenburgFH Fallback", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        "pulse-fast": "pulse-fast 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "marquee": "marquee 35s linear infinite",
        "flow": "flow 2s linear infinite",
        "shake": "shake 0.5s ease-in-out",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { transform: "scale(1) translate(0px, 0px)", opacity: 0.15 },
          "33%": { transform: "scale(1.15) translate(30px, -40px)", opacity: 0.22 },
          "66%": { transform: "scale(0.9) translate(-20px, 20px)", opacity: 0.18 },
        },
        "pulse-fast": {
          "0%, 100%": { opacity: 0.25, transform: "scale(1)" },
          "50%": { opacity: 0.7, transform: "scale(1.05)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "flow": {
          "0%": { "stroke-dashoffset": "20" },
          "100%": { "stroke-dashoffset": "0" },
        },
        "shake": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%, 60%": { transform: "rotate(-10deg)" },
          "40%, 80%": { transform: "rotate(10deg)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

