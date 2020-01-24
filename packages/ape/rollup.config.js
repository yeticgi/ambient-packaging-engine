import external from 'rollup-plugin-peer-deps-external';
import noderesolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import url from '@rollup/plugin-url';
import del from 'rollup-plugin-delete';
import pkg from './package.json';

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
        targets: ['dist']
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
      }),
      copy({
        targets: [
          { src: 'src/public/draco', dest: 'dist/public'} // copy src draco folder and contents to dist/public folder.
        ],
        verbose: true,
      }),
      replace({
        '__ape_version__': pkg.version
      })
    ],
    external: [
      'three',
      'three/examples/jsm/loaders/GLTFLoader',
      'three/examples/jsm/loaders/DRACOLoader',
      'three/examples/js/libs/draco',
      'howler',
      'lodash',
      'tslib']
  };