import { esErrorHttp, httpClient } from '@/shared/utils/http';
import { getSessionId } from '@/shared/utils/sessionId';
import type { ResultadoAnalisis } from '@/features/partido-analisis';
import type { HistorialResumen } from '../types/historial.types';

export async function obtenerHistorial(): Promise<HistorialResumen[]> {
  const respuesta = await httpClient<HistorialResumen[]>('/historial', {
    headers: { 'X-Session-Id': getSessionId() },
  });

  if (esErrorHttp(respuesta)) {
    throw new Error(`Error al obtener historial: ${respuesta.status}`);
  }

  return respuesta;
}

export async function obtenerDetalleAnalisis(
  id: number,
): Promise<ResultadoAnalisis> {
  const respuesta = await httpClient<ResultadoAnalisis>(`/historial/${id}`, {
    headers: { 'X-Session-Id': getSessionId() },
  });

  if (esErrorHttp(respuesta)) {
    throw new Error(`Error al obtener el análisis ${id}: ${respuesta.status}`);
  }

  return respuesta;
}
