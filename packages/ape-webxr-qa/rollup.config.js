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
    format: 'es',
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
    commonjs()
  );

  plugins.push(
    typescript({
      check: true,
      clean: true,
      verbosity: 2
    })
  );

  plugins.push(
    postcss()
  );

  plugins.push(
    replace({
      values: {
        'process.env.NODE_ENV': JSON.stringify(isDevMode ? 'development' : 'production'),
        '__ape-webxr-qa-version__': pkg.version,
        '__ape-webxr-qa-build-time__': Date.now().toString(),
      },
      preventAssignment: false,
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
      terser()
    );
  }

  return {
    input,
    output,
    plugins
  };
};