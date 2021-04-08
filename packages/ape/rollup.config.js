import typescript from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';
import url from '@rollup/plugin-url';
import del from 'rollup-plugin-delete';
import pkg from './package.json';

export default {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es',
      exports: 'named',
      sourcemap: true,
    },
    plugins: [
      del({
        targets: ['dist']
      }),
      typescript({
        check: true,
        clean: true,
        verbosity: 2
      }),
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
        values: {
          '__ape_version__': pkg.version,
          '__ape-build-time__': Date.now().toString(),
        },
        preventAssignment: false
      })
    ],
    external: [
      'three',
      'three/examples/jsm/loaders/GLTFLoader',
      'three/examples/jsm/loaders/DRACOLoader',
      'three/examples/jsm/utils/SkeletonUtils',
      'three/examples/jsm/controls/TransformControls',
      'three/examples/js/libs/draco',
      'howler',
      'lodash',
      'lodash/find',
      'lodash/some',
      'lodash/isEqual',
      'lodash/remove',
      'tslib',
      'jsqr',
      'stats.js',
    ]
  };