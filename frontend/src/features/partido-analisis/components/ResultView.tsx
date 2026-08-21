import { useRef } from 'react';
import { useGSAP } from '@gsap/react';

import { gsap } from '@/shared/lib/gsapConfig';
import { colorConfianza, etiquetaConfianza } from '@/shared/utils/confianza';
import OddsTable from './OddsTable';
import type { ResultadoAnalisis } from '../types/agente.types';

interface ResultViewProps {
  resultado: ResultadoAnalisis;
}

const DISCLAIMER_FALLBACK =
  'Análisis generado automáticamente con fines informativos. No constituye asesoramiento financiero ni de apuestas.';

function formatearValorEsperado(valor: number): string {
  const signo = valor >= 0 ? '+' : '';
  return `${signo}${(valor * 100).toFixed(1)}% EV`;
}

function colorValorEsperado(valor: number): string {
  return valor >= 0 ? 'text-emerald-300' : 'text-red-300';
}

export default function ResultView({ resultado }: ResultViewProps) {
  const disclaimer = resultado.disclaimer || DISCLAIMER_FALLBACK;
  const contenedorRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!contenedorRef.current) return;
      gsap.fromTo(
        contenedorRef.current,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power1.out',
          overwrite: true,
        },
      );
    });
  });

  if (!resultado.encontrado) {
    return (
      <div ref={contenedorRef} className="space-y-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm font-medium text-zinc-200">
            Partido no encontrado
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            {resultado.justificacion}
          </p>
        </div>
        <p className="text-xs text-zinc-600">{disclaimer}</p>
      </div>
    );
  }

  if (resultado.recomendacion === null) {
    return (
      <div ref={contenedorRef} className="space-y-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-zinc-200">
              Análisis incompleto
            </p>
            <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
              Sin recomendación
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            {resultado.justificacion}
          </p>
        </div>
        <p className="text-xs text-zinc-600">{disclaimer}</p>
      </div>
    );
  }

  return (
    <div ref={contenedorRef} className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-zinc-500">{resultado.partido}</p>
            <p className="mt-1 text-lg font-semibold text-zinc-100">
              Apuesta: {resultado.recomendacion}
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorConfianza(
              resultado.confianza,
            )}`}
          >
            Confianza {etiquetaConfianza(resultado.confianza)}
          </span>
        </div>

        <p
          className={`mt-1 text-sm font-semibold ${colorValorEsperado(
            resultado.valor_esperado,
          )}`}
        >
          Valor esperado: {formatearValorEsperado(resultado.valor_esperado)}
        </p>

        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          {resultado.justificacion}
        </p>

        <div className="mt-4">
          <OddsTable cuotas={resultado.datos_usados.cuotas_comparadas} />
        </div>
      </div>

      <p className="text-xs text-zinc-600">{disclaimer}</p>
    </div>
  );
}
