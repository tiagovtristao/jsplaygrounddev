import { type Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: ['selector'],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(({ matchVariant }) => {
      matchVariant('child', (value) => `& > ${value}`);
    }),
  ],
};

export default config;
