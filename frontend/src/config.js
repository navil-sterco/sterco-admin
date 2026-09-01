const API_BASE_URL = import.meta.env.VITE_API_URL;
const APP_BASE_URL = import.meta.env.VITE_APP_URL || API_BASE_URL.replace(/\/api\/?$/, '');
export const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export const apiBaseUrl = API_BASE_URL;

export const assetUrl = (assetPath) =>
  /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(assetPath)
    ? BASE_URL + assetPath
    : `${BASE_URL.replace(/\/$/, '')}/${assetPath.replace(/^\//, '')}`;

export const urlFromBase = (path) =>
  `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
