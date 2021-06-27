const sveltePreprocess = require('svelte-preprocess');
const postcssPresetEnv = require('postcss-preset-env');

// const postcss_import = require('postcss-import');
// const postcss_nested = require('postcss-nested');
// const postcss_scss = require('postcss-scss');
const preprocess = sveltePreprocess({
  postcss: {
    plugins: [
      // require('tailwindcss'),

      postcssPresetEnv({
        /* use stage 3 features + css nesting rules */
        stage: 3,
        features: {
          'nesting-rules': true,
        },
      }),
      require('autoprefixer'),
    ],
  },
});
module.exports = {
  devServer: {
    proxy: {
      '^/testkoa': {
        target: 'http://localhost:1377/testkoa',

        changeOrigin: true,
      },
    },
  },
  // ["@snowpack/plugin-build-script", {"cmd": "postcss", "input": [".css"], "output": [".css"]}]

  preprocess,
};
