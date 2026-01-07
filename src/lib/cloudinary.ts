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

export interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * Upload an image to Cloudinary using unsigned upload with progress tracking
 * @param file - The file or Blob to upload
 * @param folder - Optional folder path in Cloudinary
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Promise with the upload result containing the secure URL
 */
export async function uploadToCloudinary(
  file: File | Blob,
  folder?: string,
  onProgress?: UploadProgressCallback
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  
  // If it's a Blob, convert to File with a name
  if (file instanceof Blob && !(file instanceof File)) {
    const fileName = `image_${Date.now()}.jpg`;
    file = new File([file], fileName, { type: file.type || "image/jpeg" });
  }
  
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  
  if (folder) {
    formData.append("folder", folder);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            secure_url: data.secure_url,
            public_id: data.public_id,
            format: data.format,
            width: data.width,
            height: data.height,
          });
        } catch (e) {
          reject(new Error("Failed to parse Cloudinary response"));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error?.message || "Failed to upload image to Cloudinary"));
        } catch {
          reject(new Error("Failed to upload image to Cloudinary"));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was aborted"));
    });

    xhr.open("POST", CLOUDINARY_UPLOAD_URL);
    xhr.send(formData);
  });
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

/**
 * Migrate an image from any URL to Cloudinary
 * @param imageUrl - The source image URL to migrate
 * @param folder - Optional folder path in Cloudinary
 * @param onProgress - Optional progress callback
 * @returns Promise with the Cloudinary upload result
 */
export async function migrateImageToCloudinary(
  imageUrl: string,
  folder?: string,
  onProgress?: UploadProgressCallback
): Promise<CloudinaryUploadResult> {
  // If already a Cloudinary URL, return as-is
  if (isCloudinaryUrl(imageUrl)) {
    return {
      secure_url: imageUrl,
      public_id: "",
      format: "",
      width: 0,
      height: 0,
    };
  }

  // Fetch the image
  onProgress?.(10);
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  
  onProgress?.(30);
  const blob = await response.blob();
  
  // Upload to Cloudinary with remaining progress (30-100)
  return uploadToCloudinary(blob, folder, (progress) => {
    onProgress?.(30 + (progress * 0.7));
  });
}
