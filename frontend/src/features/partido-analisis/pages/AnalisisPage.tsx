import { useRef, useState } from 'react';

import { gsap } from '@/shared/lib/gsapConfig';
import LeagueSelector from '../components/LeagueSelector';
import LiveReasoning from '../components/LiveReasoning';
import MatchSelector from '../components/MatchSelector';
import ResultView from '../components/ResultView';
import { useAnalizarPartido } from '../hooks/useAnalizarPartido';
import { usePartidosProximos } from '../hooks/usePartidosProximos';
import { LIGAS } from '../types/ligas.constants';

export default function AnalisisPage() {
  const [liga, setLiga] = useState('BSA');
  const nuevoAnalisisRef = useRef<HTMLButtonElement>(null);

  const animarEscala = (escala: number) => {
    gsap.to(nuevoAnalisisRef.current, {
      scale: escala,
      duration: 0.2,
      ease: 'power1.out',
      overwrite: true,
    });
  };

  const { partidos, cargando, error: errorPartidos, reintentar } =
    usePartidosProximos(liga);
  const { eventos, resultado, analizando, error, analizar, reset } =
    useAnalizarPartido();

  const enSesion = analizando || eventos.length > 0 || resultado !== null;

  const manejarSeleccion = (equipoLocal: string, equipoVisitante: string) => {
    analizar(equipoLocal, equipoVisitante);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Análisis de partido</h1>
          {enSesion && (
            <button
              ref={nuevoAnalisisRef}
              type="button"
              onClick={reset}
              onMouseEnter={() => animarEscala(1.03)}
              onMouseLeave={() => animarEscala(1)}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Nuevo análisis
            </button>
          )}
        </header>

        {!analizando && !resultado && (
          <>
            <LeagueSelector ligas={LIGAS} seleccionada={liga} onCambiar={setLiga} />
            {errorPartidos ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-300">
                  No se pudieron cargar los partidos de {liga}. Comprueba tu conexión
                  y reintenta.
                </p>
                <button
                  type="button"
                  onClick={reintentar}
                  className="shrink-0 rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 transition-colors hover:bg-red-500/10"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <MatchSelector
                partidos={partidos}
                cargando={cargando}
                onSeleccionar={manejarSeleccion}
              />
            )}
          </>
        )}

        {(analizando || eventos.length > 0) && (
          <LiveReasoning
            eventos={eventos}
            esperandoResultado={resultado === null && analizando}
          />
        )}

        {resultado && <ResultView resultado={resultado} />}

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={reset}
              className="shrink-0 rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 transition-colors hover:bg-red-500/10"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
