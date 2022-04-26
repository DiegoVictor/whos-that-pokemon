import type { AWS } from "@serverless/typescript";

import WhosThatPokemonRecognize from "@functions/recognize";

const serverlessConfiguration: AWS = {
  service: "whos-that-pokemon",
  frameworkVersion: "2",
  useDotenv: true,
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  plugins: ["serverless-webpack", "serverless-offline"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
    lambdaHashingVersion: "20201221",
  },
  functions: { WhosThatPokemonRecognize },
  resources: {
  },
};

module.exports = serverlessConfiguration;
