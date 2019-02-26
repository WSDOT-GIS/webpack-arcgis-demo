const path = require('path');

module.exports = {
  mode: "production",
  entry: './src/index.js',
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    libraryTarget: "amd" // This line makes the output consumable by ArcGIS API AMD loader
  }
};