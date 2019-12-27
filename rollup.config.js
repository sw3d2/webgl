import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'tsc-bin/index.js',
  output: {
    file: 'bundle/index.js',
    format: 'esm'
  },
  plugins: [resolve()]
};