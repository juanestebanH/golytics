import { useRef } from 'react';
import { useGSAP } from '@gsap/react';

import Spinner from '@/shared/components/Spinner';
import { gsap } from '@/shared/lib/gsapConfig';
import type { EventoSSE } from '../types/agente.types';

interface LiveReasoningProps {
  eventos: EventoSSE[];
  esperandoResultado: boolean;
}

interface Paso {
  herramienta: string;
  texto: string;
  estado: 'en_curso' | 'ok' | 'advertencia';
  resumen?: string;
}

const TEXTO_HERRAMIENTA: Record<string, string> = {
  buscar_partido: 'Buscando el partido...',
  obtener_forma_reciente: 'Consultando forma reciente...',
  obtener_cuotas: 'Comparando cuotas...',
  calcular_valor_esperado: 'Calculando valor esperado...',
};

function construirPasos(eventos: EventoSSE[]): Paso[] {
  const pasos: Paso[] = [];

  for (const evento of eventos) {
    if (evento.tipo === 'tool_call') {
      pasos.push({
        herramienta: evento.herramienta,
        texto:
          TEXTO_HERRAMIENTA[evento.herramienta] ??
          `Ejecutando ${evento.herramienta}...`,
        estado: 'en_curso',
      });
    } else if (evento.tipo === 'tool_result') {
      const pendiente = pasos.find(
        (paso) =>
          paso.herramienta === evento.herramienta && paso.estado === 'en_curso',
      );
      if (pendiente) {
        pendiente.estado = evento.exito === false ? 'advertencia' : 'ok';
        pendiente.resumen = evento.resumen;
      }
    }
  }

  return pasos;
}

function IconoEstado({ estado }: { estado: Paso['estado'] }) {
  if (estado === 'en_curso') {
    return <Spinner className="mt-0.5" />;
  }

  return (
    <span
      className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${
        estado === 'ok'
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-amber-500/15 text-amber-400'
      }`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-3" aria-hidden="true">
        {estado === 'ok' ? (
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-4.5-4.5a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
            clipRule="evenodd"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            clipRule="evenodd"
          />
        )}
      </svg>
    </span>
  );
}

export default function LiveReasoning({
  eventos,
  esperandoResultado,
}: LiveReasoningProps) {
  const pasos = construirPasos(eventos);
  const eventosError = eventos.filter((evento) => evento.tipo === 'error');
  const ultimoError = eventosError[eventosError.length - 1];
  const pasosPendientes = pasos.some((paso) => paso.estado === 'en_curso');
  const generandoFinal = esperandoResultado && !pasosPendientes && !ultimoError;
  const listaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const ultimo = listaRef.current?.lastElementChild as
          | HTMLElement
          | null
          | undefined;
        if (!ultimo || ultimo.dataset.animado) return;
        ultimo.dataset.animado = 'true';
        gsap.fromTo(
          ultimo,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power1.out', overwrite: true },
        );
      });
    },
    { dependencies: [eventos.length, generandoFinal] },
  );

  return (
    <div ref={listaRef} className="space-y-1.5">
      {ultimoError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 transition-all">
          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400">
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-3" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <p className="text-sm text-red-300">{ultimoError.mensaje}</p>
        </div>
      )}

      {pasos.map((paso, index) => (
        <div
          key={`${paso.herramienta}-${index}`}
          className={`flex items-start gap-3 rounded-lg px-3 py-2 transition-all duration-300 ${
            paso.estado === 'en_curso' ? 'bg-zinc-800/40' : 'bg-transparent opacity-80'
          }`}
        >
          <IconoEstado estado={paso.estado} />
          <div>
            <p className="text-sm text-zinc-200">{paso.texto}</p>
            {paso.resumen && (
              <p className="mt-0.5 text-xs text-zinc-500">{paso.resumen}</p>
            )}
          </div>
        </div>
      ))}

      {generandoFinal && (
        <div className="flex items-center gap-2.5 px-3 py-2">
          <Spinner className="size-4" />
          <p className="text-sm text-zinc-400">Generando el análisis final...</p>
        </div>
      )}

      {pasos.length === 0 && !ultimoError && !generandoFinal && (
        <p className="px-3 py-2 text-sm text-zinc-500">
          Esperando razonamiento del agente...
        </p>
      )}
    </div>
  );
}
