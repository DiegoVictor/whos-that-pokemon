import "source-map-support/register";
import { S3 } from "@aws-sdk/client-s3";
import { Rekognition } from "@aws-sdk/client-rekognition";
import { randomUUID } from "crypto";
import * as path from "path";

import schema from "./schema";
import { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";

const main: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const s3 = new S3({});

  const uuid = randomUUID();
  const Key = `${uuid}${path.extname(event.body.name)}`;

  const Bucket = process.env.BUCKET_NAME;
  await s3.putObject({
    Bucket,
    Key,
    Body: Buffer.from(event.body.data, "base64"),
  });

  const rekognition = new Rekognition({});
  const labels = await rekognition.detectCustomLabels({
    Image: {
      S3Object: {
        Bucket,
        Name: Key,
      },
    },
    MaxResults: 1,
    ProjectVersionArn: process.env.REKOGNITION_MODEL_ARN,
  });

  if (!labels.CustomLabels.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Was not possible to match a pokemon from the provided image",
      }),
    };
  }

  const [{ Name: pokemonName }] = labels.CustomLabels;

  await s3.deleteObject({ Bucket, Key });

  return {
    statusCode: 200,
    body: JSON.stringify({
      pokemonName,
    }),
  };
};

export const recognize = middyfy(main);
