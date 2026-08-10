import type { CuotaComparada } from '../types/agente.types';

interface OddsTableProps {
  cuotas: CuotaComparada[];
}

function formatearHandicap(handicap: number): string {
  return handicap > 0 ? `+${handicap}` : String(handicap);
}

export default function OddsTable({ cuotas }: OddsTableProps) {
  const ordenadas = [...cuotas].sort((a, b) => b.cuota - a.cuota);

  if (ordenadas.length === 0) {
    return <p className="text-sm text-zinc-500">No hay cuotas comparadas</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-800/60">
          <tr className="text-left text-xs uppercase tracking-wider text-zinc-400">
            <th className="px-3 py-2 font-medium">Casa</th>
            <th className="px-3 py-2 font-medium">Hándicap</th>
            <th className="px-3 py-2 text-right font-medium">Cuota</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 bg-zinc-900/60">
          {ordenadas.map((fila, index) => (
            <tr key={`${fila.casa}-${fila.hándicap}-${index}`}>
              <td className="px-3 py-2 text-zinc-200">{fila.casa}</td>
              <td className="px-3 py-2 text-zinc-400">
                {formatearHandicap(fila.hándicap)}
              </td>
              <td
                className={`px-3 py-2 text-right font-semibold ${
                  index === 0 ? 'text-emerald-300' : 'text-zinc-100'
                }`}
              >
                {fila.cuota.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
