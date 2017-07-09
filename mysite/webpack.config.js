const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  entry: {
    //try  to maintain the same schema for entry and thus provide the same webpack-stats[-prod]
    vendor: ['react', 'react-dom'], //no need to actually create the vendor entry dir
    pgnetwork_forcevis: ['./assets/src/pgnetwork/forcevis', 'webpack/hot/only-dev-server', 'webpack-dev-server/client?http://localhost:3000'],
    pgnetwork_tableview: ['./assets/src/pgnetwork/tableview', 'webpack/hot/only-dev-server', 'webpack-dev-server/client?http://localhost:3000'],
  },
  output: {
    path: path.resolve(__dirname, './assets/bundles'),
    filename: '[name].bundle.js',
    publicPath: 'http://localhost:3000/assets/bundles/',
    // override django's STATIC_URL & for webpack loader
    // the trick here is the publicPath is exactly the url(domain & port included!) of the WDS
    // necessary for HMR to know where to load the hot update chunks
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          'babel-loader',
        ],
        include: [
          path.resolve(__dirname, './assets/src'),
          path.resolve(__dirname, './node_modules/react-map-gl/src'),
        ],
      },
    ],
  },
  plugins: [
    //https://stackoverflow.com/questions/39548175/can-someone-explain-webpacks-commonschunkplugin/39600793
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity,
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: "manifest",
      minChunks: Infinity,
    }),

    new webpack.HotModuleReplacementPlugin(),
    // enable HMR globally

    new webpack.NamedModulesPlugin(),
    // prints more readable module names in the browser console on HMR updates

    new webpack.NoEmitOnErrorsPlugin(),
    // do not emit compiled assets that include errors
  
    new BundleTracker({filename: './webpack-stats.json'}),
    //generate webpack-stats.json for django-webpack-loader
  ],

  resolve: {
    alias: {
      // From mapbox-gl-js README. Required for non-browserify bundlers (e.g. webpack):
      'mapbox-gl$': path.resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
    }
  },

  devtool: 'inline-source-map',

  devServer: {
    host: 'localhost',
    port: 3000,

    historyApiFallback: true,
    // respond to 404s with index.html...that's it. all the explanation online fail to provide such a succinct idea
    
    hot: true,
    // enable HMR on the server

    //CORS
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:8000",
      // or simply "Access-Control-Allow-Origin": "*" 
    },
  },


};

