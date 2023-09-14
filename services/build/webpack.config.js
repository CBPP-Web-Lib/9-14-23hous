var path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/app.js',
  watch: true,
  output: {
    path: path.resolve(__dirname, 'prod'),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
       {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            "exclude": [
              /node_modules[\\\/]core-js/,
              /node_modules[\\\/]webpack[\\\/]buildin/,
            ],
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader'
        ],
      },
      {
        test: /\.twig$/,
        loader: "twig-loader"
      }
    ],
  },
  optimization: {
    usedExports: true,
  },
};