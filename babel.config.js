module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
  ],
  overrides: [
    {
      test: fileName => fileName.includes('node_modules/react-native-maps'),
      plugins: [], // do NOT apply the loose plugins to react-native-maps
    },
  ],
};
