module.exports = function (options, webpack) {
  return {
    ...options,
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        resourceRegExp: /^(mock-aws-s3|aws-sdk|nock)$/,
      }),
    ],
  };
};
