module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'vue/no-parsing-error': [2, { 'x-invalid-end-tag': false }],
    'max-len': [2, { code: 120, tabWidth: 2, ignoreUrls: true }],
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: [
        'vm', // for route change vm instance
        'state', // for vuex state mutations
        'acc', // for reduce accumulators
        'e', // for e.returnvalue
        'ctx', // for Koa routing
        'req', // for Express requests
        'request', // for Express requests
        'res', // for Express responses
        'response', // for Express responses
        '$scope', // for Angular 1 scopes
      ],
    }],
    'import/no-extraneous-dependencies': [
      'error', { devDependencies: true },
    ],
    'import/extensions': [
      'error',
      'never',
      { vue: 'ignorePackages' },
    ],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
