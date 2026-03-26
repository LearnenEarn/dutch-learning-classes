// Root-level PostCSS config — used when Vite is run from dutch-app/ root
export default {
  plugins: {
    tailwindcss: {
      config: './tailwind.config.js',
    },
    autoprefixer: {},
  },
}
