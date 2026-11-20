module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  settings: { react: { version: 'detect' } },
  plugins: ['@typescript-eslint'],
  rules: {
    'indent': ['error', 2],
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'semi': ['error', 'never'],
    'no-var': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error'
  },
  ignorePatterns: ['dist', 'coverage', 'node_modules', '.eslintrc.cjs']
}
