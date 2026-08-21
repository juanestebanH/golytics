export interface PartidoProximo {
  fixture_id: number;
  fecha: string;
  equipo_local: string;
  equipo_visitante: string;
  equipo_local_id: number;
  equipo_visitante_id: number;
}

export interface CuotaComparada {
  casa: string;
  handicap: number;
  cuota: number;
}

export interface DatosUsados {
  forma_local: string;
  forma_visitante: string;
  cuotas_comparadas: CuotaComparada[];
}

export interface ResultadoAnalisis {
  partido: string;
  encontrado: boolean;
  recomendacion: string | null;
  valor_esperado: number;
  confianza: 'alta' | 'media' | 'baja';
  justificacion: string;
  datos_usados: DatosUsados;
  disclaimer: string;
}

export type EventoSSE =
  | { tipo: 'tool_call'; herramienta: string; argumentos: string }
  | {
      tipo: 'tool_result';
      herramienta: string;
      exito?: boolean;
      resumen: string;
    }
  | { tipo: 'resultado_final'; data: ResultadoAnalisis }
  | { tipo: 'error'; mensaje: string };
