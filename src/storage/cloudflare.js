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

export async function getSubFolders(prefix) {
  const normalizedPrefix = prefix.endsWith("/") ? prefix : prefix + "/";
  let subFolders = [];
  let continuationToken = undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: normalizedPrefix,
      Delimiter: "/", // 👈 required for subfolder discovery
      ContinuationToken: continuationToken,
    });

    const response = await s3.send(command);

    if (response.CommonPrefixes) {
      const folders = response.CommonPrefixes.map((p) => p.Prefix);
      subFolders.push(...folders);
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return subFolders;
}

// Helps to extract folders from the root directory
export async function listRootFolders() {
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET,
    Delimiter: "/", // This groups objects by folder
    Prefix: "", // Empty prefix means root level
  });

  const response = await s3.send(command);

  // CommonPrefixes contains the folder names
  const folders =
    response.CommonPrefixes?.map(
      (prefix) => prefix.Prefix.replace(/\/$/, "") // Remove trailing slash
    ) || [];

  return folders;
}

// Helper to delete folder from names (object keys)
export async function deleteFolder(prefix) {
  const listCmd = new ListObjectsV2Command({
    Bucket: R2_BUCKET,
    Prefix: prefix + "/",
  });

  const data = await s3.send(listCmd);

  if (!data.Contents || data.Contents.length === 0) {
    console.log(`⚠️ Nothing found under: ${prefix}/`);
    return;
  }

  const objectsToDelete = data.Contents.map((obj) => ({ Key: obj.Key }));

  const deleteCmd = new DeleteObjectsCommand({
    Bucket: R2_BUCKET,
    Delete: { Objects: objectsToDelete },
  });

  await s3.send(deleteCmd);
}

export async function getFolderSize(prefix) {
  const fullPrefix = prefix.endsWith("/") ? prefix : prefix + "/";
  let totalSize = 0;
  let continuationToken = undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: fullPrefix,
      ContinuationToken: continuationToken,
    });

    const response = await s3.send(command);

    if (response.Contents) {
      for (const obj of response.Contents) {
        totalSize += obj.Size || 0;
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return totalSize; // in bytes
}
