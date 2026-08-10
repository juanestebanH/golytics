import { useCallback, useEffect, useRef, useState } from 'react';

import { analizarPartido } from '../services/agenteApi';
import type { EventoSSE, ResultadoAnalisis } from '../types/agente.types';

export interface UseAnalizarPartidoResultado {
  eventos: EventoSSE[];
  resultado: ResultadoAnalisis | null;
  analizando: boolean;
  error: string | null;
  analizar: (equipoLocal: string, equipoVisitante: string) => void;
  reset: () => void;
}

export function useAnalizarPartido(): UseAnalizarPartidoResultado {
  const [eventos, setEventos] = useState<EventoSSE[]>([]);
  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);
  const [analizando, setAnalizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activoRef = useRef(true);

  useEffect(() => {
    return () => {
      activoRef.current = false;
    };
  }, []);

  const analizar = useCallback(
    (equipoLocal: string, equipoVisitante: string) => {
      const pregunta = `¿Quién gana ${equipoLocal} vs ${equipoVisitante}?`;

      activoRef.current = true;
      setEventos([]);
      setResultado(null);
      setError(null);
      setAnalizando(true);

      analizarPartido(pregunta, (evento) => {
        if (!activoRef.current) return;

        setEventos((prev) => [...prev, evento]);

        if (evento.tipo === 'resultado_final') {
          setResultado(evento.data);
          setAnalizando(false);
        } else if (evento.tipo === 'error') {
          setAnalizando(false);
        }
      }).catch((e) => {
        if (!activoRef.current) return;

        setError(e instanceof Error ? e.message : String(e));
        setAnalizando(false);
      });
    },
    [],
  );

  const reset = useCallback(() => {
    activoRef.current = false;
    setEventos([]);
    setResultado(null);
    setAnalizando(false);
    setError(null);
  }, []);

  return { eventos, resultado, analizando, error, analizar, reset };
}
