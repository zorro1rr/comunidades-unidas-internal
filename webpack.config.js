const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const ManifestPlugin = require("webpack-manifest-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => ({
  entry: {
    "comunidades-unidas-internal": "./frontend/comunidades-unidas-internal.tsx",
  },
  output: {
    filename:
      process.env.RUNNING_LOCALLY === "true" ? "[name].js" : "[name].[hash].js",
    path: __dirname + "/static",
    publicPath: process.env.PUBLIC_PATH || "/static/",
  },
  devtool: "sourcemap",
  module: {
    rules: [
      {
        test: /\.tsx$|\.ts|\.js|\.jsx/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {},
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "kremling-loader",
            options: {},
          },
        ],
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
    index: "index.html",
    port: 9018,
    publicPath: "http://localhost:9018/",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    // When you need to use the React Profiler, uncomment this
    // alias: {
    //   "react-dom$": env && env.prod ? "react-dom/profiling" : 'react-dom',
    //   "scheduler/tracing": env && env.prod ? "scheduler/tracing-profiling" : 'scheduler/tracing',
    // },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: env && env.analyze ? "server" : "disabled",
    }),
    new ManifestPlugin(),
  ],
  optimization: {
    namedChunks: true,
    minimize: argv.mode === "production",
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          safari10: true,
        },
      }),
    ],
  },
});
