module.exports = {
  extends: [
    'standard'
  ],
  parser: '@babel/eslint-parser',
  rules: {
    'keyword-spacing': [
      'error',
      {
        after: true,
        before: true,
        overrides: {
          if: {
            after: false
          },
          for: {
            after: false
          },
          while: {
            after: false
          },
          switch: {
            after: false
          },
          catch: {
            after: false
          }
        }
      }
    ],
    'space-before-function-paren': [
      'error',
      'never'
    ],
    'generator-star-spacing': [
      'error',
      {
        before: false,
        after: true
      }
    ],
    'object-curly-spacing': [
      'error',
      'always'
    ],
    'promise/no-nesting': 0
  }
}
