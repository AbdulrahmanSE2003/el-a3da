import "server-only"

import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

/**
 * التعامل مع Neon Object Storage (متوافق مع S3).
 *
 * الـ bucket خاص (private)، وكل الوصول ليه من السيرفر فقط:
 * - رفع الصور: presigned PUT قصير العمر.
 * - عرض الصور في الأدمن: presigned GET قصير العمر.
 *
 * مفيش أي مفتاح أو endpoint بيوصل للـ browser.
 */

export const DEFAULT_FEEDBACK_BUCKET = "feedbacks"
const UPLOAD_URL_TTL_SECONDS = 10 * 60
const DOWNLOAD_URL_TTL_SECONDS = 5 * 60

export class FeedbackStorageConfigurationError extends Error {
  constructor() {
    super("Feedback storage is not configured.")
    this.name = "FeedbackStorageConfigurationError"
  }
}

let client: S3Client | null = null

function env(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value || undefined
}

export function getFeedbackBucket(): string {
  return env("FEEDBACK_BUCKET") ?? DEFAULT_FEEDBACK_BUCKET
}

export function isFeedbackStorageConfigured(): boolean {
  return Boolean(
    env("AWS_ENDPOINT_URL_S3") &&
      env("AWS_REGION") &&
      env("AWS_ACCESS_KEY_ID") &&
      env("AWS_SECRET_ACCESS_KEY")
  )
}

function getClient(): S3Client {
  if (!isFeedbackStorageConfigured()) {
    throw new FeedbackStorageConfigurationError()
  }

  client ??= new S3Client({
    region: env("AWS_REGION"),
    endpoint: env("AWS_ENDPOINT_URL_S3"),
    credentials: {
      accessKeyId: env("AWS_ACCESS_KEY_ID")!,
      secretAccessKey: env("AWS_SECRET_ACCESS_KEY")!,
    },
    forcePathStyle: true,
    // Neon Storage rejects the SDK's default flexible checksums on browser
    // presigned PUTs. Only calculate them when an operation requires one.
    requestChecksumCalculation: "WHEN_REQUIRED",
  })

  return client
}

export interface FeedbackUploadTarget {
  url: string
  method: "PUT"
  headers: Record<string, string>
}

export async function createFeedbackUploadUrl(
  key: string,
  contentType: string
): Promise<FeedbackUploadTarget> {
  const url = await getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: getFeedbackBucket(),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: UPLOAD_URL_TTL_SECONDS }
  )

  return {
    url,
    method: "PUT",
    headers: { "Content-Type": contentType },
  }
}

export interface FeedbackObjectMetadata {
  contentType: string | null
  sizeBytes: number
}

export async function headFeedbackObject(
  key: string
): Promise<FeedbackObjectMetadata | null> {
  try {
    const result = await getClient().send(
      new HeadObjectCommand({
        Bucket: getFeedbackBucket(),
        Key: key,
      })
    )

    return {
      contentType: result.ContentType ?? null,
      sizeBytes: result.ContentLength ?? 0,
    }
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } })
      ?.$metadata?.httpStatusCode
    if (status === 404) return null
    throw error
  }
}

export async function deleteFeedbackObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) return

  await getClient().send(
    new DeleteObjectsCommand({
      Bucket: getFeedbackBucket(),
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    })
  )
}

export async function createFeedbackDownloadUrl(key: string): Promise<string> {
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({
      Bucket: getFeedbackBucket(),
      Key: key,
    }),
    { expiresIn: DOWNLOAD_URL_TTL_SECONDS }
  )
}
