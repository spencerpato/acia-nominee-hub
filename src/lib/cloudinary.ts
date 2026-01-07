// Cloudinary configuration and upload utility
const CLOUD_NAME = "dhsihufoq";
const UPLOAD_PRESET = "Nominees";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

/**
 * Upload an image to Cloudinary using unsigned upload
 * @param file - The file to upload
 * @param folder - Optional folder path in Cloudinary
 * @returns Promise with the upload result containing the secure URL
 */
export async function uploadToCloudinary(
  file: File,
  folder?: string
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  
  if (folder) {
    formData.append("folder", folder);
  }

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to upload image to Cloudinary");
  }

  const data = await response.json();
  
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    format: data.format,
    width: data.width,
    height: data.height,
  };
}

/**
 * Generate an optimized Cloudinary URL with transformations
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 * @returns Optimized URL string
 */
export function getOptimizedUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg" | "png";
  } = {}
): string {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  const { width, height, quality = "auto", format = "auto" } = options;
  
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  transformations.push("c_limit"); // Maintain aspect ratio, limit to dimensions
  
  const transformation = transformations.join(",");
  
  // Insert transformations into URL
  return url.replace("/upload/", `/upload/${transformation}/`);
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url?.includes("cloudinary.com") || false;
}
