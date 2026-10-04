/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#012D1D",
          container: "#1B4332",
        },
        secondary: {
          DEFAULT: "#904D00",
          container: "#FE932C",
        },
        surface: {
          DEFAULT: "#FCF9F1",
          container: "#F1EEE6",
          low: "#F6F3EB",
          highest: "#E5E2DB",
        },
        text: {
          main: "#1C1C17",
          secondary: "#414844",
        },
        outline: {
          DEFAULT: "#717973",
          variant: "#C1C8C2",
        },
      },
      fontFamily: {
        heading: ["HankenGrotesk_600SemiBold"],
        headingBold: ["HankenGrotesk_700Bold"],
        body: ["Inter_400Regular"],
        bodyMedium: ["Inter_500Medium"],
        bodySemiBold: ["Inter_600SemiBold"],
      },
    },
  },
  plugins: [],
};
