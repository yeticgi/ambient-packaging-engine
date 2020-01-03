import external from 'rollup-plugin-peer-deps-external';
import noderesolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import postcss from 'rollup-plugin-postcss';
import url from '@rollup/plugin-url';
import del from 'rollup-plugin-delete';

export default {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
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
      commonjs(),
      typescript({
        objectHashIgnoreUnknownHack: true
      }),
      postcss(),
      url({
        limit: 0,
        publicPath: 'public/',
        destDir: 'dist/public'
      })
    ],
    external: ['three', 'howler', 'lodash', 'tslib']
  };