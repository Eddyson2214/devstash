import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export const R2_BUCKET = process.env.R2_PUBLIC_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export function keyFromFileUrl(fileUrl: string): string {
  return new URL(fileUrl).pathname.replace(/^\/+/, "");
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: contentType })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

export async function getFromR2(key: string) {
  return r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
