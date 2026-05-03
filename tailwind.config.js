export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C62828",
          dark: "#8E0000",
          light: "#EF5350",
          pale: "#FFEBEE",
        },
        success: {
          DEFAULT: "#2E7D32",
          light: "#E8F5E9",
        },
        warning: {
          DEFAULT: "#E65100",
          light: "#FFF3E0",
        },
        danger: {
          DEFAULT: "#C62828",
          light: "#FFEBEE",
        },
        info: {
          DEFAULT: "#1565C0",
          light: "#E3F2FD",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
