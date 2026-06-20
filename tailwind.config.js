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
        pioneer: {
          orange: {
            light: "#fdf2e9",
            normal: "#EE7C11",
            hover: "#d9700e",
            active: "#c4640d",
            dark: "#093443",
            DEFAULT: "#EE7C11",
          },
          teal: {
            light: "#f0fdf4",
            normal: "#0D9488",
            hover: "#0f766e",
            active: "#115e59",
            dark: "#093443",
            DEFAULT: "#0D9488",
          },
          navy: {
            DEFAULT: "#093443",
          },
          primary: "#EE7C11",
          secondary: "#0D9488",
          light: {
            bg: "#F8FAFC",
            card: "#FFFFFF",
            textPrimary: "#0F172A",
            textSecondary: "#475569",
          },
          dark: {
            bg: "#06242F",
            card: "#093443",
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