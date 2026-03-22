import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';


import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
dotenv.config();

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
    Bucket: process.env.MINIO_BUCKET || 'videolearn',
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(minioClient, command, { expiresIn: 3600 });
};

export const downloadFile = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.MINIO_BUCKET || 'stackunder-assets',
    Key: key,
  });

  const response = await minioClient.send(command);
  return response.Body; // Node.js stream
};

export const uploadFile = async (key, body, contentType) => {
  const command = new PutObjectCommand({
    Bucket: process.env.MINIO_BUCKET || 'stackunder-assets',
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  return await minioClient.send(command);
};

export const getPresignedDownloadUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.MINIO_BUCKET || 'stackunder-data',
    Key: key,
  });

  return await getSignedUrl(minioClient, command, { expiresIn: 3600 });
};



