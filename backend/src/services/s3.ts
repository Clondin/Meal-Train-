import { randomUUID } from 'node:crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = process.env.AWS_S3_BUCKET || 'mealtrain-uploads';

const s3 = new S3Client({
  region: REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export interface UploadResult {
  url: string;
  key: string;
}

const buildPublicUrl = (key: string) => `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

export async function uploadFile(
  file: Buffer,
  filename: string,
  mimetype: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  const extension = filename.split('.').pop() || '';
  const key = `${folder}/${randomUUID()}.${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: mimetype,
    })
  );

  return { url: buildPublicUrl(key), key };
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export async function getSignedFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
    { expiresIn }
  );
}

export async function getUploadSignedUrl(
  filename: string,
  mimetype: string,
  folder: string = 'uploads',
  expiresIn: number = 300
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const extension = filename.split('.').pop() || '';
  const key = `${folder}/${randomUUID()}.${extension}`;

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: mimetype,
    }),
    { expiresIn }
  );

  return { uploadUrl, key, publicUrl: buildPublicUrl(key) };
}

export { s3 };
