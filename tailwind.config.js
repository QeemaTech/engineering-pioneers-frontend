/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "pioneer-orange": "#EE7C11",
        "pioneer-bg-dark": "#0F172A",
        "pioneer-card-dark": "#1E293B",
        "pioneer-accent-blue": {
          light: "rgba(59, 130, 246, 0.1)",
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
          active: "#1D4ED8",
          dark: "#1E293B",
        },
        pioneer: {
          orange: {
            light: "#fdf2e9",
            normal: "#EE7C11",
            hover: "#d9700e",
            active: "#c4640d",
            dark: "#1E293B",
            DEFAULT: "#EE7C11",
          },
          "bg-dark": "#0F172A",
          "card-dark": "#1E293B",
          "accent-blue": {
            light: "rgba(59, 130, 246, 0.1)",
            normal: "#3B82F6",
            hover: "#2563EB",
            active: "#1D4ED8",
            dark: "#1E293B",
            DEFAULT: "#3B82F6",
          },
          teal: {
            light: "rgba(59, 130, 246, 0.1)",
            normal: "#3B82F6",
            hover: "#2563EB",
            active: "#1D4ED8",
            dark: "#1E293B",
            DEFAULT: "#3B82F6",
          },
          navy: {
            DEFAULT: "#1E293B",
          },
          accent: {
            blue: "#3B82F6",
          },
          primary: "#EE7C11",
          secondary: "#3B82F6",
          light: {
            bg: "#F8FAFC",
            card: "#FFFFFF",
            textPrimary: "#0F172A",
            textSecondary: "#475569",
          },
          dark: {
            bg: "#0F172A",
            card: "#1E293B",
            textPrimary: "#F8FAFC",
            textSecondary: "#94A3B8",
          },
        },
      },
      fontFamily: {
        sans: [
          "var(--font-app)",
          "Inter",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        times: ["Times New Roman", "Times", "serif"],
        helvetica: ["Helvetica", "Arial", "sans-serif"],
        inter: ["Inter", "Helvetica Neue", "Helvetica", "Arial", "ui-sans-serif", "system-ui", "sans-serif"],
        arabic: ["Cairo", "Alexandria", "sans-serif"],
        cairo: ["Cairo", "Alexandria", "sans-serif"],
      },

    },
  },
  plugins: [],
}