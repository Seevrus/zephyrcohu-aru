module.exports = function babel(api) {
  api.cache(true);
  return {
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            'react-native-device-info': './react-native-device-info.js',
          },
        },
      ],
    ],
    presets: ['babel-preset-expo'],
  };
};
