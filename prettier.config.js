export default {
  experimentalTernaries: true,
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  printWidth: 100,
  proseWrap: "preserve",
  semi: false,
  singleAttributePerLine: true,
  singleQuote: true,
  tailwindStylesheet: "./src/styles/global.css",
};
