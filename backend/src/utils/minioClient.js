import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_BUCKET = process.env.MINIO_BUCKET || 'stackunder-assets';

export const minioClient = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  region: process.env.MINIO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO
});

export const getPresignedUploadUrl = async (key, contentType) => {
  const command = new PutObjectCommand({
    Bucket: DEFAULT_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(minioClient, command, { expiresIn: 3600 });
};

export const downloadFile = async (key) => {
  const command = new GetObjectCommand({
    Bucket: DEFAULT_BUCKET,
    Key: key,
  });

  const response = await minioClient.send(command);
  return response.Body; // Node.js stream
};

export const uploadFile = async (key, body, contentType) => {
  const command = new PutObjectCommand({
    Bucket: DEFAULT_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  return await minioClient.send(command);
};

export const getPresignedDownloadUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: DEFAULT_BUCKET,
    Key: key,
  });

  return await getSignedUrl(minioClient, command, { expiresIn: 3600 });
};

export const deleteFile = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: DEFAULT_BUCKET,
    Key: key,
  });

  return await minioClient.send(command);
};

export const deleteFolder = async (prefix) => {
  // 1. List all objects with prefix
  const listCommand = new ListObjectsV2Command({
    Bucket: DEFAULT_BUCKET,
    Prefix: prefix,
  });

  const listResponse = await minioClient.send(listCommand);

  if (!listResponse.Contents || listResponse.Contents.length === 0) return;

  // 2. Delete all objects found
  const deleteCommand = new DeleteObjectsCommand({
    Bucket: DEFAULT_BUCKET,
    Delete: {
      Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
    },
  });

  return await minioClient.send(deleteCommand);
};




