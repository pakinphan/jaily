/** @type {import('tailwindcss').Config} */
module.exports = {
  tailwindcss: {},
  autoprefixer: {},
  darkMode: 'class',
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      kanit: ['Kanit', 'sans'],
      kdamthmor: ['Kdam Thmor Pro', 'sans-serif'],
    },
  },

  plugins: [require("daisyui")],
  daisyui: {
    themes:
      [
        {
          mytheme: {
            "primary": "#D798B0",
            "secondary": "#06728F",
            "accent": "#F5BDC6",
            "neutral": "#2b3440",
            "base-100": "#ffffff",
            "info": "#3abff8",
            "success": "#36d399",
            "warning": "#fbbd23",
            "error": "#f87272",
          },

        },"dracula",
      ],// true: all themes | false: only light + dark | array: specific themes like this ["light", "dark", "cupcake"] // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    rtl: false, // rotate style direction from left-to-right to right-to-left. You also need to add dir="rtl" to your html tag and install `tailwindcss-flip` plugin for Tailwind CSS.
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
  },
}
