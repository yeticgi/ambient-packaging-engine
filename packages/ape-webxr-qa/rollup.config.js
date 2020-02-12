import external from 'rollup-plugin-peer-deps-external';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';
import pkg from './package.json';

export default (args) => {
  const isDevMode = args.configMode === 'dev';
  if (isDevMode) { 
    console.log(`Using rollup config in dev mode.`);
  }

  let input = 'src/index.tsx';
  let output = {
    dir: 'dist',
    format: 'cjs',
    exports: 'named',
    sourcemap: true
  };

  let plugins = [];

  plugins.push(
    del({
      targets: ['dist']
    })
  );

  plugins.push(
    external()
  );

  plugins.push(
    nodeResolve({
      browser: true
    })
  );

  plugins.push(
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
      }
    })
  );

  plugins.push(
    typescript({
      objectHashIgnoreUnknownHack: true,
    })
  );

  plugins.push(
    postcss()
  );

  plugins.push(
    replace({
      'process.env.NODE_ENV': JSON.stringify(isDevMode ? 'development' : 'production'),
      '__ape-webxr-qa-version__': pkg.version
    })
  );

  plugins.push(
    sourcemaps({
    })
  );
  
  plugins.push(
    copy({
      targets: [
        { src: 'src/index.html', dest: 'dist' }, // copy index.html to dist
        { src: 'src/public', dest: 'dist' }, // copy src/public to dist
        { src: '../*/dist/public', dest: 'dist' }, // copy all public folders to dist
      ],
      verbose: true,
    })
  );
  
  if (!isDevMode) {
    plugins.push(
      terser({
        sourcemap: true
      })
    );
  }

  return {
    input,
    output,
    plugins
  };
};