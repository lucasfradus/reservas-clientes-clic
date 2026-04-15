import type {
  CheckoutPayload,
  CheckoutResponse,
  Clase,
  Sede,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  // Fail loud during development if env is missing.
  // eslint-disable-next-line no-console
  console.error('VITE_API_BASE_URL is not defined');
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 0);
  }

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
      else if (body?.message) message = body.message;
    } catch {
      /* noop */
    }
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

export function getSedes(): Promise<Sede[]> {
  return request<Sede[]>('/api/public/sedes');
}

export function getClases(sedeId: number): Promise<Clase[]> {
  return request<Clase[]>(`/api/public/sedes/${sedeId}/clases`);
}

export function checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  return request<CheckoutResponse>('/api/public/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
