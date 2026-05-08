/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        police: {
          bg: "#0f0f0f",
          panel: "#1a1a1a",
          primary: "#8B5E3C",
          accent: "#C89B7B",
        },
      },
    },
  },
  plugins: [],
};
