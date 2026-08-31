import { urlFromBase } from "../config";

export const uploadImage = async (file) => {
  const uploadUrl = urlFromBase('/upload/image');
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Image upload failed');
  }

  return result.imageUrl;
};