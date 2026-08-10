import type { Liga } from '../types/ligas.constants';

interface LeagueSelectorProps {
  ligas: Liga[];
  seleccionada: string;
  onCambiar: (codigo: string) => void;
}

export default function LeagueSelector({
  ligas,
  seleccionada,
  onCambiar,
}: LeagueSelectorProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label
        htmlFor="liga"
        className="text-xs font-medium uppercase tracking-wider text-indigo-300"
      >
        Liga
      </label>
      <select
        id="liga"
        value={seleccionada}
        onChange={(evento) => onCambiar(evento.target.value)}
        className="flex-1 rounded-lg border border-indigo-800/70 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 transition-colors focus:border-indigo-500 focus:outline-none"
      >
        {ligas.map((liga) => (
          <option key={liga.codigo} value={liga.codigo}>
            {liga.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
