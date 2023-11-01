/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((extension) => extension !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  };

  return config;
})();
