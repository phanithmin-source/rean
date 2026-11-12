import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background-rgb) / <alpha-value>)",
        foreground: "rgb(var(--foreground-rgb) / <alpha-value>)",
        navy: {
          DEFAULT: "#343D4F",
          50: "#F2F4F7",
          100: "#E3E7ED",
          200: "#C6CEDC",
          300: "#9EABC1",
          400: "#6C7D9B",
          500: "#4D5B73",
          600: "#343D4F",
          700: "#2B3241",
          800: "#222733",
          900: "#1A1E27",
        },
        sage: {
          DEFAULT: "#A9DCCB",
          50: "#F0FAF6",
          100: "#E0F3EB",
          200: "#C3E8D9",
          300: "#A9DCCB",
          400: "#6CBCA1",
          500: "#319578",
          600: "#14765B",
          700: "#106048",
          800: "#124D3D",
          900: "#103D32",
        },
        cyan: {
          DEFAULT: "#BCE5E8",
          50: "#F2FAFA",
          100: "#DEF4F5",
          200: "#BCE5E8",
          300: "#92D3D8",
          400: "#5EBCC4",
          500: "#3B9FA8",
          600: "#2F7E86",
          700: "#25626B",
          800: "#244F58",
        },
        cream: {
          DEFAULT: "#F6F9F8",
          50: "#FAFCFB",
          100: "#F3F7F5",
          200: "#EAF1EE",
          300: "#DBE6E0",
        },
        card: {
          DEFAULT: "rgb(var(--card-rgb) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground-rgb) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover-rgb) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground-rgb) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary-rgb) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground-rgb) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary-rgb) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground-rgb) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted-rgb) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground-rgb) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground-rgb) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive-rgb) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground-rgb) / <alpha-value>)",
        },
        border: "rgb(var(--border-rgb) / <alpha-value>)",
        input: "rgb(var(--input-rgb) / <alpha-value>)",
        ring: "rgb(var(--ring-rgb) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: [
          "var(--font-ibm-plex-mono)",
          "var(--font-geist-mono)",
          "monospace",
        ],
        khmer: ["var(--font-noto-sans-khmer)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "2xs": "0 1px 2px rgb(24 57 45 / 0.03)",
        xs: "0 2px 8px rgb(24 57 45 / 0.035)",
        sm: "0 3px 12px rgb(24 57 45 / 0.04)",
        md: "0 12px 32px -10px rgb(24 57 45 / 0.12)",
        soft: "0 20px 60px -20px rgb(24 57 45 / 0.14)",
      },
    },
  },
  plugins: [],
};
export default config;
