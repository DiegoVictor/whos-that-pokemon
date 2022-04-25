import { Rekognition } from "@aws-sdk/client-rekognition";

const rekognition = new Rekognition({});

export const recognize = async (Key: string) =>
  rekognition.detectCustomLabels({
    Image: {
      S3Object: {
        Bucket: process.env.BUCKET_NAME,
        Name: Key,
      },
    },
    MaxResults: 1,
    ProjectVersionArn: process.env.REKOGNITION_PROJECT_VERION_ARN,
  });
