// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// whisper.rn: ggml model binary + CoreML model asset
config.resolver.assetExts.push('bin', 'mil');

module.exports = config;
