import { defineConfig } from 'eslint/config'
import eslintConfigMadboosterNodeApp from 'eslint-config-madbooster-node-app'

export default defineConfig([
  {
    name: 'Base config',
    files: ['{src,test}/**/*.ts', '*.{js,ts}'],
    extends: eslintConfigMadboosterNodeApp,
  },
  {
    name: 'Enable curly rule',
    rules: {
      curly: ['error', 'all'],
    },
  },
])
