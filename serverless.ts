import type { AWS } from '@serverless/typescript';

import WhosThatPokemonRecognize from '@functions/recognize';

const serverlessConfiguration: AWS = {
  service: 'whos-that-pokemon',
  frameworkVersion: '3',
  useDotenv: true,
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
    projectName: '${file(./variables.json):ProjectName}',
    projectVersionName: '${file(./variables.json):ProjectVersionName}',
    projectVersionArnSecretName:
      '${file(./variables.json):ProjectVersionArnSecretName}',
    bucketName: '${file(./variables.json):Bucket}',
  },
  plugins: ['serverless-webpack', 'serverless-offline'],
  provider: {
    name: 'aws',
    region: 'us-east-1',
    runtime: 'nodejs18.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
            Resource: 'arn:aws:s3:::*',
          },
          {
            Effect: 'Allow',
            Action: ['rekognition:DetectCustomLabels'],
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: ['secretsmanager:GetSecretValue'],
            Resource: {
              Ref: 'WhosThatPokemonProjectVersionArnSecret',
            },
          },
        ],
      },
    },
  },
  functions: { WhosThatPokemonRecognize },
  resources: {
    Resources: {
      WhosThatPokemonBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:custom.bucketName}',
        },
      },
      WhosThatPokemonProject: {
        Type: 'AWS::Rekognition::Project',
        Properties: {
          ProjectName: '${self:custom.projectName}',
        },
      },
      WhosThatPokemonProjectVersionArnSecret: {
        Type: 'AWS::SecretsManager::Secret',
        Properties: {
          Description: 'Rekognition Project Version Arn',
          Name: '${self:custom.projectVersionArnSecretName}',
          SecretString: '{"ProjectVersionArn":""}',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
