import { createClient } from './client'

/**
 * Upload a file to Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param file - The file to upload
 * @param options - Upload options (upsert, cacheControl, etc.)
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: {
    cacheControl?: string
    upsert?: boolean
  }
) {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options)

  if (error) {
    throw error
  }

  return data
}

/**
 * Get public URL for a file
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 */
export function getPublicUrl(bucket: string, path: string) {
  const supabase = createClient()

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

/**
 * Download a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 */
export async function downloadFile(bucket: string, path: string) {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from(bucket).download(path)

  if (error) {
    throw error
  }

  return data
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param paths - Array of file paths to delete
 */
export async function deleteFiles(bucket: string, paths: string[]) {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from(bucket).remove(paths)

  if (error) {
    throw error
  }

  return data
}

/**
 * List files in a bucket
 * @param bucket - The storage bucket name
 * @param path - The folder path (optional)
 * @param options - List options (limit, offset, sortBy, etc.)
 */
export async function listFiles(
  bucket: string,
  path?: string,
  options?: {
    limit?: number
    offset?: number
    sortBy?: { column: string; order: string }
  }
) {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from(bucket).list(path, options)

  if (error) {
    throw error
  }

  return data
}

/**
 * Create a signed URL for private files
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param expiresIn - Time in seconds until the URL expires (default: 3600)
 */
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
) {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw error
  }

  return data
}

/**
 * Upload a business logo to Supabase Storage
 * @param userId - The user ID (owner of the business)
 * @param file - The image file to upload
 * @returns The public URL of the uploaded logo
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

export async function uploadBusinessLogo(userId: string, file: File): Promise<string> {
  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Formato no permitido. Use JPG, PNG o WebP.')
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('El archivo excede 2MB.')
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/logo.${ext}`

  await uploadFile('business-logos', path, file, { upsert: true })
  return getPublicUrl('business-logos', path)
}
