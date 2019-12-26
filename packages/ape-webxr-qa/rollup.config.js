import external from 'rollup-plugin-peer-deps-external';
import noderesolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy'

export default {
    input: 'src/index.tsx',
    output: {
      dir: 'dist',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
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
      // commonjs(),
      typescript({
        objectHashIgnoreUnknownHack: true,
        // clean: true
      }),
      postcss(),
      copy({
        targets: [
          { src: 'src/index.html', dest: 'dist'}
        ],
        verbose: true,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      })
    ],
  };