export interface HttpErrorResult {
  err: true;
  status: number | '00';
  message?: string;
  [clave: string]: unknown;
}

const API_URL_RAW = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const API_URL = API_URL_RAW.replace(/\/+$/, '');

export async function httpClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T | HttpErrorResult> {
  const controller = new AbortController();
  const esFormData = options.body instanceof FormData;

  const config: RequestInit = {
    method: options.method ?? 'GET',
    headers: esFormData
      ? options.headers
      : {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
    signal: controller.signal,
    body: esFormData
      ? options.body
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  };

  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const respuesta = await fetch(`${API_URL}${endpoint}`, config);
    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      return { err: true, status: respuesta.status, ...datos };
    }

    return datos as T;
  } catch (error) {
    return {
      err: true,
      status: '00',
      message: error instanceof Error ? error.message : 'Error de red',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function esErrorHttp<T>(
  resultado: T | HttpErrorResult,
): resultado is HttpErrorResult {
  return (resultado as HttpErrorResult).err === true;
}
