import { useCallback, useEffect, useState } from 'react';

import { obtenerPartidosProximos } from '../services/agenteApi';
import type { PartidoProximo } from '../types/agente.types';

export interface UsePartidosProximosResultado {
  partidos: PartidoProximo[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
}

export function usePartidosProximos(
  competicion: string,
): UsePartidosProximosResultado {
  const [partidos, setPartidos] = useState<PartidoProximo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    setCargando(true);
    setError(null);

    obtenerPartidosProximos(competicion)
      .then((data) => {
        if (activo) {
          setPartidos(data);
          setCargando(false);
        }
      })
      .catch((e) => {
        if (activo) {
          setError(e instanceof Error ? e.message : String(e));
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [competicion, intento]);

  const reintentar = useCallback(() => {
    setIntento((actual) => actual + 1);
  }, []);

  return { partidos, cargando, error, reintentar };
}
