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
        background: "var(--background)",
        foreground: "var(--foreground)",
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
          DEFAULT: "#A8C8B2",
          50: "#F3F8F5",
          100: "#E3EFE7",
          200: "#CBE2D2",
          300: "#A8C8B2",
          400: "#84AF91",
          500: "#649572",
          600: "#4E775A",
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
        },
        cream: {
          DEFAULT: "#F7F5EE",
          50: "#FCFBF8",
          100: "#F7F5EE",
          200: "#EFECE0",
          300: "#E4DEC8",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "var(--font-geist-mono)", "monospace"],
        khmer: ["var(--font-noto-sans-khmer)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
