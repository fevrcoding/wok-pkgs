module.exports = {
  env: {
    browser: false,
    es6: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  parser: 'babel-eslint',
  rules: {
    'no-multiple-empty-lines': [2, { max: 3 }],
    'arrow-body-style': 0,
    'class-methods-use-this': 0,
  },
};
