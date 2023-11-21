import type { Config } from 'tailwindcss'
const {nextui} = require("@nextui-org/react");

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
     "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background": "#F6F8FF",
        "headings": "#0E1435",
        "text": "#474B64",
        "accent1": "#124FAA",
        "cardbackground": "#FFFFFF",
        "bordercard": "#D8DBE9",
      },
      fontFamily: {
        sans: ["var(--font-raptor)"],
      },
    },
  },
  plugins: [nextui()],
}
export default config
