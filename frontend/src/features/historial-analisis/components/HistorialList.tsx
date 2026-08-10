import Spinner from '@/shared/components/Spinner';
import { gsap } from '@/shared/lib/gsapConfig';
import { colorConfianza, etiquetaConfianza } from '@/shared/utils/confianza';
import { formatearFecha } from '@/shared/utils/fecha';
import type { HistorialResumen } from '../types/historial.types';

interface HistorialListProps {
  items: HistorialResumen[];
  cargando: boolean;
  onSeleccionar: (id: number) => void;
}

function textoResumen(item: HistorialResumen): string {
  if (item.recomendacion) return item.recomendacion;
  if (item.analisis_completo) return 'Sin valor encontrado';
  return 'Incompleto';
}

export default function HistorialList({
  items,
  cargando,
  onSeleccionar,
}: HistorialListProps) {
  if (cargando) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
        <Spinner />
        Cargando historial...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
        Aún no has hecho ningún análisis
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSeleccionar(item.id)}
            onMouseEnter={(evento) =>
              gsap.to(evento.currentTarget, {
                y: -4,
                duration: 0.2,
                ease: 'power1.out',
                overwrite: true,
              })
            }
            onMouseLeave={(evento) =>
              gsap.to(evento.currentTarget, {
                y: 0,
                duration: 0.2,
                ease: 'power1.out',
                overwrite: true,
              })
            }
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-800/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  {item.partido}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {formatearFecha(item.fecha)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorConfianza(
                  item.confianza,
                )}`}
              >
                {etiquetaConfianza(item.confianza)}
              </span>
            </div>
            <p className="mt-2 truncate text-sm text-zinc-400">
              {textoResumen(item)}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}
