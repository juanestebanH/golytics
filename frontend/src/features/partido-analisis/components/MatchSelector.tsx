import { useRef, useState, type ChangeEvent } from 'react';

import Spinner from '@/shared/components/Spinner';
import { gsap } from '@/shared/lib/gsapConfig';
import { formatearFecha } from '@/shared/utils/fecha';
import type { PartidoProximo } from '../types/agente.types';

interface MatchSelectorProps {
  partidos: PartidoProximo[];
  cargando: boolean;
  onSeleccionar: (equipoLocal: string, equipoVisitante: string) => void;
}

export default function MatchSelector({
  partidos,
  cargando,
  onSeleccionar,
}: MatchSelectorProps) {
  const [fixtureId, setFixtureId] = useState<number | null>(null);
  const analizarRef = useRef<HTMLButtonElement>(null);

  const animarEscala = (escala: number) => {
    gsap.to(analizarRef.current, {
      scale: escala,
      duration: 0.2,
      ease: 'power1.out',
      overwrite: true,
    });
  };

  if (cargando) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
        <Spinner />
        Cargando partidos...
      </div>
    );
  }

  if (partidos.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
        No hay partidos programados en los próximos días
      </p>
    );
  }

  const seleccionado =
    partidos.find((partido) => partido.fixture_id === fixtureId) ?? partidos[0];

  const manejarCambio = (evento: ChangeEvent<HTMLSelectElement>) => {
    setFixtureId(Number(evento.target.value));
  };

  const manejarAnalizar = () => {
    onSeleccionar(seleccionado.equipo_local, seleccionado.equipo_visitante);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center">
      <label htmlFor="partido" className="text-sm font-medium text-zinc-300">
        Partido
      </label>
      <select
        id="partido"
        value={seleccionado.fixture_id}
        onChange={manejarCambio}
        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
      >
        {partidos.map((partido) => (
          <option key={partido.fixture_id} value={partido.fixture_id}>
            {partido.equipo_local} vs {partido.equipo_visitante} —{' '}
            {formatearFecha(partido.fecha)}
          </option>
        ))}
      </select>
      <button
        ref={analizarRef}
        type="button"
        onClick={manejarAnalizar}
        onMouseEnter={() => animarEscala(1.03)}
        onMouseLeave={() => animarEscala(1)}
        className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
      >
        Analizar
      </button>
    </div>
  );
}
