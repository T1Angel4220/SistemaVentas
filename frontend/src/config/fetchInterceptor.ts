import { API_BASE_URL, API_ORIGIN, LOCAL_API_ORIGIN } from './api';

const LOCAL_API_BASE = `${LOCAL_API_ORIGIN}/api`;

const normalizePath = (path: string): string => {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
};

const rewriteUrl = (url: string): string => {
  if (!url) {
    return url;
  }

  if (url.startsWith(LOCAL_API_BASE)) {
    const suffix = url.slice(LOCAL_API_BASE.length);
    return `${API_BASE_URL}${suffix}`;
  }

  if (url.startsWith(LOCAL_API_ORIGIN)) {
    const suffix = url.slice(LOCAL_API_ORIGIN.length);
    return `${API_ORIGIN}${normalizePath(suffix.replace(/^\/+/, ''))}`;
  }

  return url;
};

export const setupApiFetchInterceptor = (): void => {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string') {
      const remappedUrl = rewriteUrl(input);
      return originalFetch(remappedUrl, init);
    }

    if (input instanceof Request) {
      const remappedUrl = rewriteUrl(input.url);
      if (remappedUrl !== input.url) {
        const clonedRequest = new Request(remappedUrl, input);
        return originalFetch(clonedRequest, init);
      }
    }

    return originalFetch(input, init);
  }) as typeof window.fetch;
};

