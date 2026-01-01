import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET = process.env.AWS_S3_BUCKET || 'mealtrain-uploads';

export interface UploadResult {
  url: string;
  key: string;
}

export async function uploadFile(
  file: Buffer,
  filename: string,
  mimetype: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  const extension = filename.split('.').pop() || '';
  const key = `${folder}/${uuidv4()}.${extension}`;

  const params: AWS.S3.PutObjectRequest = {
    Bucket: BUCKET,
    Key: key,
    Body: file,
    ContentType: mimetype,
    ACL: 'public-read',
  };

  await s3.upload(params).promise();

  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

  return { url, key };
}

export async function deleteFile(key: string): Promise<void> {
  const params: AWS.S3.DeleteObjectRequest = {
    Bucket: BUCKET,
    Key: key,
  };

  await s3.deleteObject(params).promise();
}

export async function getSignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const params = {
    Bucket: BUCKET,
    Key: key,
    Expires: expiresIn,
  };

  return s3.getSignedUrlPromise('getObject', params);
}

export async function getUploadSignedUrl(
  filename: string,
  mimetype: string,
  folder: string = 'uploads',
  expiresIn: number = 300
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const extension = filename.split('.').pop() || '';
  const key = `${folder}/${uuidv4()}.${extension}`;

  const params = {
    Bucket: BUCKET,
    Key: key,
    ContentType: mimetype,
    Expires: expiresIn,
    ACL: 'public-read',
  };

  const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
  const publicUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

  return { uploadUrl, key, publicUrl };
}

export { s3 };
