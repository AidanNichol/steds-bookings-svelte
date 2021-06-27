const postcssPresetEnv = require('postcss-preset-env');

module.exports = {
  plugins: [
    // require('tailwindcss'),
    require('autoprefixer'),
    postcssPresetEnv({
      /* use stage 3 features + css nesting rules */
      stage: 3,
      features: {
        'nesting-rules': true,
      },
    }),
  ],
};
