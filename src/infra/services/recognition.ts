import { Rekognition } from '@aws-sdk/client-rekognition';

import * as secretManagerService from '@infra/services/secretManager';

const rekognition = new Rekognition({});

export const recognize = async (Key: string) =>
  secretManagerService
    .getSecret(process.env.PROJECT_VERSION_ARN_SECRET_NAME)
    .then(({ ProjectVersionArn }) =>
      rekognition.detectCustomLabels({
        Image: {
          S3Object: {
            Bucket: process.env.BUCKET_NAME,
            Name: Key,
          },
        },
        MaxResults: 1,
        ProjectVersionArn,
      })
    );
