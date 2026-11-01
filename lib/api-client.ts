// Cliente mínimo para los formularios: envía JSON a la API y normaliza la
// respuesta a { ok, error } para mostrar siempre el mensaje del servidor.
export type ApiResult = { ok: true } | { ok: false; error: string };

export async function sendJson(url: string, method: 'POST' | 'PATCH', body: unknown): Promise<ApiResult> {
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (response.ok) return { ok: true };
    const data = await response.json().catch(() => ({}));
    return { ok: false, error: data.error ?? 'Ocurrió un error inesperado' };
  } catch {
    return { ok: false, error: 'No fue posible conectar con el servidor' };
  }
}
