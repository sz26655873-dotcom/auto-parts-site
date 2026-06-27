/**
 * Image Upload Service — uploads images via Cloudflare Pages Function → R2.
 *
 * Flow: browser compresses image → base64 encode → POST /api/upload (with auth) → R2 bucket
 * This avoids CORS issues (no direct browser→R2 connection).
 */

import { getAuthToken } from './adminStorage';

// ── Configuration ────────────────────────────────────────────────

/** API endpoint for upload (same origin, no CORS issue). */
const UPLOAD_API = '/api/upload';

/** Image proxy URL prefix — use our own API (avoids R2 public 401). */
const PROXY_URL_PREFIX = '/api/image?key=';

// ── Image Compression ────────────────────────────────────────────

/** Max width for uploaded images (pixels). */
const MAX_WIDTH = 800;

/** JPEG/WebP quality (0–100). */
const QUALITY = 80;

/** Max file size warning threshold (bytes ≈ 200KB). */
const MAX_SIZE_BYTES = 200_000;

/**
 * Compresses an image file: resize to MAX_WIDTH, convert to WebP.
 * Falls back to JPEG if WebP is not supported.
 */
export async function compressImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let { width, height } = img;

      // Only downscale, never upscale.
      if (width > MAX_WIDTH) {
        const ratio = MAX_WIDTH / width;
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first (better compression), fallback to JPEG.
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width, height });
          } else {
            // Fallback to JPEG
            canvas.toBlob(
              (jpegBlob) => {
                if (jpegBlob) {
                  resolve({ blob: jpegBlob, width, height });
                } else {
                  reject(new Error('Image encoding failed'));
                }
              },
              'image/jpeg',
              QUALITY / 100
            );
          }
        },
        'image/webp',
        QUALITY / 100
      );
    };
    img.onerror = () => reject(new Error('Image loading failed'));
    img.src = URL.createObjectURL(file);
  });
}

// ── Upload Function ──────────────────────────────────────────────

export interface UploadResult {
  /** Full public URL of the uploaded image. */
  url: string;
  /** File size in bytes after compression. */
  sizeBytes: number;
  /** Image dimensions. */
  width: number;
  height: number;
  /** Key (path) within the R2 bucket. */
  key: string;
}

/**
 * Uploads a file via the Pages Function API → R2.
 *
 * The image is compressed client-side, then base64-encoded and sent
 * to `/api/upload` which stores it in R2.
 *
 * @param file - The original file selected by the user.
 * @param onProgress - Optional callback for progress reporting (0–100).
 */
export async function uploadImageToR2(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  // Step 1: Compress
  onProgress?.(10);
  const { blob, width, height } = await compressImage(file);
  onProgress?.(50);

  // Warn about large files but still allow upload.
  if (blob.size > MAX_SIZE_BYTES) {
    console.warn(
      `[R2 Upload] Compressed image is ${(blob.size / 1024).toFixed(0)}KB (>${MAX_SIZE_BYTES / 1024}KB recommended)`
    );
  }

  // Step 2: Generate unique key
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  const key = `products/${timestamp}-${rand}.${ext}`;

  // Step 3: Base64 encode & send to our API
  onProgress?.(70);

  const arrayBuffer = await blob.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer).reduce((str, byte) => str + String.fromCharCode(byte), '')
  );

  const response = await fetch(UPLOAD_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      data: base64,
      contentType: blob.type,
      key,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errData.error || `Upload failed (${response.status})`);
  }

  const result = await response.json();
  onProgress?.(100);

  return {
    url: result.url || `${PROXY_URL_PREFIX}${encodeURIComponent(key)}`,
    sizeBytes: blob.size,
    width,
    height,
    key,
  };
}
