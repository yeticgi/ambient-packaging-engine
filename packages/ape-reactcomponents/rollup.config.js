import external from 'rollup-plugin-peer-deps-external';
import noderesolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import postcss from 'rollup-plugin-postcss';
import url from '@rollup/plugin-url';
import del from 'rollup-plugin-delete';
import pkg from './package.json';

export default {
    input: 'src/index.tsx',
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
        objectHashIgnoreUnknownHack: true
      }),
      postcss(),
      url({
        limit: 0,
        publicPath: 'public/',
        destDir: 'dist/public'
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        '__ape-reactcomponents_version__': pkg.version
      })
    ],
    external: ['react', 'react-dom', '@yeticgi/ape']
  };