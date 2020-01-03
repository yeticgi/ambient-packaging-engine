import external from 'rollup-plugin-peer-deps-external';
import noderesolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import url from '@rollup/plugin-url';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/index.tsx',
    output: {
      dir: 'dist',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      del({
        targets: ['dist'],
        verbose: true
      }),
      external(),
      noderesolve({
        browser: true
      }),
      commonjs({
        namedExports: {
          'react': [
            'Children',
            'Component',
            'PropTypes',
            'createElement',
          ],
          'react-dom': [
            'render'
          ],
        },
      }),
      typescript({
        objectHashIgnoreUnknownHack: true,
        useTsconfigDeclarationDir: true
      }),
      postcss(),
      url({
        limit: 0,
        publicPath: 'public/',
        destDir: 'dist/public',
        include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif', '**/*.mp3', '**/*.webm']
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser({
        sourcemap: true
      }),
      copy({
        targets: [
          { src: 'src/index.html', dest: 'dist'}, // copy index.html to dist
          { src: '../*/dist/public', dest: 'dist'}, // copy all public folders to dist.
        ],
        verbose: true,
      })
    ],
  };