// src/config/paths.js
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

module.exports = {
  root: rootDir,
  middleware: path.join(rootDir, 'middleware'),
  routes: path.join(rootDir, 'routes'),
  services: path.join(rootDir, 'services'),
  models: path.join(rootDir, 'models'),
  public: path.join(rootDir, 'public'),
  views: path.join(rootDir, 'views'),
};