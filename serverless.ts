import type { AWS } from "@serverless/typescript";

import WhosThatPokemonRecognize from "@functions/recognize";

const serverlessConfiguration: AWS = {
  service: "whos-that-pokemon",
  frameworkVersion: "3",
  useDotenv: true,
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
    projectName: "${file(./variables.json):projectName}",
    projectVersionName: "${file(./variables.json):projectVersionName}",
    projectVersionArnSecretName: "projectVersionArn",
    bucketName: "${file(./variables.json):bucket}",
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
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
            Resource: {
              "Fn::GetAtt": ["WhosThatPokemonBucket", "Arn"],
            },
          },
        ],
      },
    },
  },
  functions: { WhosThatPokemonRecognize },
  resources: {
    Resources: {
      WhosThatPokemonRekognitionProject: {
        Type: "AWS::Rekognition::Project",
        Properties: {
          ProjectName: "WhosThatPokemonRekognitionProject",
        },
      },
      WhosThatPokemonBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "whos-that-pokemon-bucket",
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
