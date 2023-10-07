import { defineConfig } from 'father';

export default defineConfig({
  cjs: {},
  platform: 'node',
  prebundle: {
    deps: {}
  },
  esm: {
    input: 'src',
    platform: 'browser',
    transformer: 'babel'
  },
  cjs: {
    input: 'src',
    platform: 'node',
    transformer: 'esbuild'
  }
});
