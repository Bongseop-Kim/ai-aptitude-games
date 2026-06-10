const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const blockedDirs = ['.omx', '.omc', '.claude', 'dist', 'android', 'ios'];

const blockedPatterns = [
  config.resolver.blockList,
  ...blockedDirs.map(
    (dir) => new RegExp(`^${escapeRegExp(path.join(__dirname, dir) + path.sep)}.*`),
  ),
]
  .flat()
  .filter(Boolean);

config.resolver.blockList = new RegExp(
  blockedPatterns.map((pattern) => `(${pattern.source})`).join('|'),
);

module.exports = config;
