const CLOUDINARY_MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const CLOUDINARY_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type CloudinaryUploadResponse = {
  secure_url?: string;
  delete_token?: string;
  error?: {
    message?: string;
  };
};

export type CloudinaryUpload = {
  url: string;
  deleteToken?: string;
};

export function validateAvatarFile(file: File) {
  if (!CLOUDINARY_IMAGE_TYPES.has(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }

  if (file.size > CLOUDINARY_MAX_IMAGE_SIZE) {
    throw new Error("Choose an image smaller than 5MB.");
  }
}

export async function uploadAvatarWithRollback(
  file: File,
): Promise<CloudinaryUpload> {
  validateAvatarFile(file);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary upload is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );
  const data = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message ?? "Unable to upload image.");
  }

  return {
    url: data.secure_url,
    ...(data.delete_token ? { deleteToken: data.delete_token } : {}),
  };
}

export async function uploadAvatarToCloudinary(file: File) {
  return (await uploadAvatarWithRollback(file)).url;
}

export async function deleteCloudinaryUpload(deleteToken: string) {
  const response = await fetch(
    "https://api.cloudinary.com/v1_1/delete_by_token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: deleteToken }),
    },
  );

  if (!response.ok) {
    throw new Error("Unable to remove the unused uploaded image.");
  }
}
