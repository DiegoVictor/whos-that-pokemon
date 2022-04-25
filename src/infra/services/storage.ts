import { S3 } from "@aws-sdk/client-s3";

const s3 = new S3({});
const Bucket = process.env.BUCKET_NAME;

export const upload = async (Key: string, data: Buffer) => {
  await s3.putObject({
    Bucket,
    Key,
    Body: data,
  });
};

export const deleteByKey = async (Key: string) => {
  await s3.deleteObject({ Bucket, Key });
};
