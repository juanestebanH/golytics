import { useCallback, useEffect, useRef, useState } from 'react';

import type { ResultadoAnalisis } from '@/features/partido-analisis';
import { obtenerDetalleAnalisis, obtenerHistorial } from '../services/historialApi';
import type { HistorialResumen } from '../types/historial.types';

export interface UseHistorialResultado {
  historial: HistorialResumen[];
  cargando: boolean;
  error: string | null;
  detalleSeleccionado: ResultadoAnalisis | null;
  cargandoDetalle: boolean;
  cargarDetalle: (id: number) => void;
  cerrarDetalle: () => void;
  recargar: () => void;
}

export function useHistorial(): UseHistorialResultado {
  const [historial, setHistorial] = useState<HistorialResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detalleSeleccionado, setDetalleSeleccionado] =
    useState<ResultadoAnalisis | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [intento, setIntento] = useState(0);
  const activoRef = useRef(true);

  useEffect(() => {
    let activo = true;

    setCargando(true);
    setError(null);

    obtenerHistorial()
      .then((data) => {
        if (activo) {
          setHistorial(data);
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
  }, [intento]);

  useEffect(() => {
    return () => {
      activoRef.current = false;
    };
  }, []);

  const recargar = useCallback(() => {
    setIntento((actual) => actual + 1);
  }, []);

  const cargarDetalle = useCallback((id: number) => {
    activoRef.current = true;
    setCargandoDetalle(true);

    obtenerDetalleAnalisis(id)
      .then((data) => {
        if (!activoRef.current) return;

        setDetalleSeleccionado(data);
        setCargandoDetalle(false);
      })
      .catch(() => {
        if (!activoRef.current) return;

        setCargandoDetalle(false);
      });
  }, []);

  const cerrarDetalle = useCallback(() => {
    setDetalleSeleccionado(null);
  }, []);

  return {
    historial,
    cargando,
    error,
    detalleSeleccionado,
    cargandoDetalle,
    cargarDetalle,
    cerrarDetalle,
    recargar,
  };
}
