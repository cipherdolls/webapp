import type { Config } from "tailwindcss";

const config = {
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    extend: {
    },
  },
} satisfies Config;

export default config;
