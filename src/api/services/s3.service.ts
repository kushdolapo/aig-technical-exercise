import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { config } from "../../shared/config";

const s3Client = new S3Client({
  region: config.awsRegion,
});

export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string
) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
}
