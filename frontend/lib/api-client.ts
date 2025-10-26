const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
  json?: unknown;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '')
        return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

async function request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
  const { params, json, headers, ...rest } = options;
  const url = buildUrl(path, params);
  const init: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  };

  if (json !== undefined) {
    init.body = JSON.stringify(json);
  }

  const response = await fetch(url, init);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw {
      status: response.status,
      data,
    };
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, json?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, json }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
  patch: <T>(path: string, json?: unknown, options?: RequestOptions) => request<T>('PATCH', path, { ...options, json }),
};
