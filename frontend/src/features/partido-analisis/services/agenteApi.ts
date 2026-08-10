import { API_URL, esErrorHttp, httpClient } from '@/shared/utils/http';
import { getSessionId } from '@/shared/utils/sessionId';
import type {
  EventoSSE,
  PartidoProximo,
  ResultadoAnalisis,
} from '../types/agente.types';

const RESULTADO_VACIO: ResultadoAnalisis = {
  partido: '',
  encontrado: false,
  recomendacion: null,
  valor_esperado: 0,
  confianza: 'baja',
  justificacion: '',
  datos_usados: { forma_local: '', forma_visitante: '', cuotas_comparadas: [] },
  disclaimer: '',
};

export async function obtenerPartidosProximos(
  competicion: string,
): Promise<PartidoProximo[]> {
  const parametros = new URLSearchParams({ competition: competicion });
  const respuesta = await httpClient<PartidoProximo[]>(
    `/partidos-proximos?${parametros.toString()}`,
  );

  if (esErrorHttp(respuesta)) {
    throw new Error(`Error al obtener partidos próximos: ${respuesta.status}`);
  }

  return respuesta;
}

export async function analizarPartido(
  pregunta: string,
  onEvento: (evento: EventoSSE) => void,
): Promise<ResultadoAnalisis> {
  const respuesta = await fetch(`${API_URL}/analizar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': getSessionId(),
    },
    body: JSON.stringify({ pregunta }),
  });

  if (!respuesta.ok) {
    throw new Error(`Error al analizar el partido: ${respuesta.status}`);
  }

  if (!respuesta.body) {
    throw new Error('La respuesta no incluye un body SSE');
  }

  const reader = respuesta.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let resultado: ResultadoAnalisis | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lineas = buffer.split('\n');
    buffer = lineas.pop() ?? '';

    for (const linea of lineas) {
      const recortada = linea.trim();
      if (!recortada.startsWith('data:')) continue;

      let evento: EventoSSE;
      try {
        evento = JSON.parse(recortada.slice(5).trim()) as EventoSSE;
      } catch {
        continue;
      }

      if (evento.tipo === 'resultado_final') {
        resultado = evento.data;
      }

      onEvento(evento);
    }
  }

  return resultado ?? { ...RESULTADO_VACIO };
}
