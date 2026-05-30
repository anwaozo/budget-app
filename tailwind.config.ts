import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        teal: {
          DEFAULT: "#0EA5A0",
          50:  "#E6F7F7",
          100: "#CCF0EE",
          200: "#99E0DD",
          300: "#66D1CC",
          400: "#33C1BA",
          500: "#0EA5A0",
          600: "#0D8A87",
          700: "#0A6E6C",
          800: "#075352",
          900: "#043837",
        },
        navy: {
          DEFAULT: "#0F1B2D",
          50:  "#E8ECF1",
          100: "#C5CFD9",
          200: "#9EB1C1",
          300: "#7793A9",
          400: "#5A7A96",
          500: "#3E6283",
          600: "#2D4F6E",
          700: "#1E3C58",
          800: "#152D43",
          900: "#0F1B2D",
        },
        // Dark mode surfaces
        dark: {
          bg:    "#1A2332",
          card:  "#243044",
          card2: "#2A3650",
          nav:   "#0F1B2D",
        },
        // Semantic
        success: "#22C55E",
        warning: "#F59E0B",
        danger:  "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Menlo", "monospace"],
      },
      boxShadow: {
        card:      "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)",
        "card-dark": "0 2px 8px rgba(0,0,0,0.4)",
        modal:     "0 8px 32px rgba(0,0,0,0.16)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      screens: {
        xs: "390px",
      },
    },
  },
  plugins: [],
};

export default config;
