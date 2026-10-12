module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['./jest.setup.js'],
  // Reanimated ships a resolver that swaps its native-only files (and Worklets') for JS ones under Jest.
  resolver: 'react-native-reanimated/jest/resolver',
  // lucide's default entry is .mjs, which the Babel transform does not pick up; use its CommonJS build.
  moduleNameMapper: {
    '^lucide-react-native$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  // These packages ship untranspiled ES modules, so Babel must process them too.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native[^/]*|@react-native[^/]*/[^/]+|@react-navigation/[^/]+|react-redux|@reduxjs/toolkit|immer|reselect|redux|redux-thunk)/)',
  ],
};
