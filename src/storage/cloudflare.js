import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

// Replace with your R2 credentials and bucket info
const R2_ENDPOINT =
  "https://06164926322055479f45cdb7746eb2ff.r2.cloudflarestorage.com";
const R2_BUCKET = "japp";

const s3 = new S3Client({
  region: "auto", // R2 uses "auto" for region
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadToR2(fileBuffer, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3.send(command);
  return key;
}

export async function fetchFromR2(key) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });

  return await s3.send(command);
}
