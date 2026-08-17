import client from "../../api/client";
import endpoints from "../../api/endpoints";
import { getErrorMessage } from "../../api/error";

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file) {
  if (!file) return "Please choose an image file.";
  if (!ALLOWED_MIME.has(file.type) && !String(file.name || "").match(/\.(jpe?g|png|webp)$/i)) {
    return "Unsupported file type. Use JPEG, PNG, or WEBP images.";
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return "Image is too large. Maximum size is 5MB.";
  }
  return null;
}

export async function uploadImageFile(file, { onProgress, kind = "image" } = {}) {
  const formData = new FormData();
  formData.append("image", file);

  const endpoint = kind === "receipt" ? endpoints.media.uploadReceipt : endpoints.media.uploadImage;
  const response = await client.post(endpoint, formData, {
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  const imageUrl = response?.data?.data?.path || response?.data?.data?.imageUrl;
  if (!imageUrl) {
    throw new Error("Upload succeeded but no image URL was returned.");
  }
  return imageUrl;
}

export function getUploadErrorMessage(error, fallback = "Image upload failed.") {
  return getErrorMessage(error, fallback);
}
