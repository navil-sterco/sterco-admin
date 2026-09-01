const normalizeBase = (value, fallback) => {
  const normalized = (value || fallback || '').trim();
  return normalized.replace(/\/+$/, '');
};

const normalizePath = (value = '') => {
  return String(value).replace(/^\/+/, '');
};

export const frontendBaseUrl = normalizeBase(
  import.meta.env.VITE_APP_URL,
  'http://localhost:5173'
);

export const backendBaseUrl = normalizeBase(
  import.meta.env.BACKEND_URL,
  'http://localhost:8000'
);

export const apiBaseUrl = normalizeBase(
  import.meta.env.VITE_API_URL,
  `${backendBaseUrl}/api`
);

export const assetUrl = (path = '') => {
  if (!path) return frontendBaseUrl;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const cleanPath = normalizePath(path);

  if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('api/')) {
    return `${backendBaseUrl}/${cleanPath}`;
  }

  return `${frontendBaseUrl}/${cleanPath}`;
};

export const urlFromBase = (path = '') => {
  const cleanPath = normalizePath(path);
  if (!cleanPath) return apiBaseUrl;

  if (/^https?:\/\//i.test(cleanPath)) {
    return cleanPath;
  }

  return `${apiBaseUrl}/${cleanPath}`;
};
