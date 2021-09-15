import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
// import html from '@rollup/plugin-html';
// import postcss from 'rollup-plugin-postcss';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import findUnused from 'rollup-plugin-unused';
// import { generateSW } from 'rollup-plugin-workbox';
//...

import sveltePreprocess from 'svelte-preprocess';
// import autoPreprocess from 'svelte-preprocess';
import css from 'rollup-plugin-css-only';
import dev from 'rollup-plugin-dev';
import path from 'path';
import process from 'process';
// import { spawn } from 'child_process';

const production = !process.env.ROLLUP_WATCH;

// function serve() {
//   let server;

//   function toExit() {
//     if (server) server.kill(0);
//   }

//   return {
//     writeBundle() {
//       if (server) return;
//       server = spawn('npm', ['run', 'start', '--', '--dev'], {
//         stdio: ['ignore', 'inherit', 'inherit'],
//         shell: true,
//       });

//       process.on('SIGTERM', toExit);
//       process.on('exit', toExit);
//     },
//   };
// }
const srcRootDir = path.resolve(__dirname, './src');
export default {
  input: 'src/main.js',
  // input: 'src/testReport.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js',
    // dir: 'public/build',
    // entryFileNames: 'bundle-[hash].js',
  },
  plugins: [
    findUnused({
      exclude: [
        'src/images/fa-subset/js-packages/@fortawesome/pro-regular-svg-icons/*.js',
        'src/images/fa-subset/js-packages/@fortawesome/pro-solid-svg-icons/*.js',
        'src/images/fa-subset/js-packages/@fortawesome/pro-duotone-svg-icons/*.js',
        'src/images/fontawesome-subset/js-packages/@fortawesome/pro-regular-svg-icons/*.js',
        'src/images/fontawesome-subset/js-packages/@fortawesome/pro-solid-svg-icons/*.js',
        'src/images/fontawesome-subset/js-packages/@fortawesome/pro-duotone-svg-icons/*.js',
        'src/ReportsPdf/*.mjs',
      ],
      extensions: [
        '.js',
        '.mjs',
        '.html',
        '.css',
        '.scss',
        '.svelte',
        '.jpg',
        '.svg',
        '.png',
        '.zip',
      ],
    }),
    svelte({
      preprocess: sveltePreprocess({
        postcss: true,
      }),
      // extensions: ['.svelte', '.svg'],
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),
    image(),
    json(),
    alias({
      entries: [
        { find: '@utils', replacement: path.resolve(srcRootDir, './utilities') },
        { find: '@pages', replacement: path.resolve(srcRootDir, './Pages') },
        { find: '@store', replacement: path.resolve(srcRootDir, './store') },
        { find: '@images', replacement: path.resolve(srcRootDir, './images') },
        { find: '@reports', replacement: path.resolve(srcRootDir, './Reports') },
        { find: '@styles', replacement: path.resolve(srcRootDir, './styles') },
      ],
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: 'bundle.css' }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
    injectProcessEnv({
      NODE_ENV: production ? 'production' : 'development',
      DEBUG: '*',
      SOME_OBJECT: { one: 1, two: [1, 2], three: '3' },
      UNUSED: null,
    }),
    // generateSW({
    //   swDest: 'public/sw.js',
    //   globDirectory: 'public/',
    //   globPatterns: ['**/*.{html,json,js,css}'],
    //   skipWaiting: true,
    //   clientsClaim: true,
    //   runtimeCaching: [
    //     {
    //       urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
    //       handler: 'CacheFirst',
    //       options: {
    //         cacheName: 'images',
    //         expiration: {
    //           maxEntries: 10,
    //         },
    //       },
    //     },
    //   ],
    // }),

    // html({
    //   template: ({ attributes, bundle, files, publicPath, title }) => `<!DOCTYPE html>
    // <html ${attributes}>
    //   <head>

    //     <title>${title}</title>

    //   </head>
    //   <body>

    //     ${files.map((f) => f.name).join(', ')}
    //   </body>
    // </html>`,
    // }),
    // nodeResolve(),
    !production &&
      dev({
        dirs: ['public'],
        spa: 'public/index.html',
        port: 5500,
        proxy: {
          '/bookingsServer/*': 'http://localhost:4444/bookingsServer/',
        },
      }),
    // // In dev mode, call `npm run start` once
    // // the bundle has been generated
    // !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
