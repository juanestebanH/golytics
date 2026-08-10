import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/shared/lib/gsapConfig';

const CARACTERISTICAS = [
  {
    titulo: 'Razonamiento transparente',
    descripcion:
      'Ves en tiempo real qué hace el agente paso a paso: buscar el partido, consultar la forma, comparar cuotas. No un resultado de caja negra.',
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
  },
  {
    titulo: 'Datos reales, no inventados',
    descripcion:
      'Cada dato proviene de una fuente verificable: estadísticas de partidos y cuotas de casas reales. Nada generado por el modelo sin respaldo.',
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 4.5v2.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-2.25"
        />
      </svg>
    ),
  },
  {
    titulo: 'Valor esperado calculado',
    descripcion:
      'No es una opinión: es la comparación matemática entre tu probabilidad estimada y la cuota real del mercado. El EV decide si la apuesta vale la pena.',
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6 12 2.25 21.75 6v12L12 21.75 2.25 18V6Zm6.75 1.5v1.5m6-1.5v1.5M9 15.75 15 9.75m-.75 6h.008v.008H14.25V15.75Z"
        />
      </svg>
    ),
  },
  {
    titulo: 'Historial completo',
    descripcion:
      'Cada análisis queda guardado con su recomendación y sus cuotas. Puedes revisarlos cuando quieras y ver cómo evolucionó tu criterio.',
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
  },
];

export default function FeatureCards() {
  const tarjetasRef = useRef<HTMLDivElement[]>([]);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      tarjetasRef.current.forEach((tarjeta) => {
        gsap.fromTo(
          tarjeta,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: tarjeta,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        );
      });
    });
  });

  return (
    <section className="mx-auto max-w-3xl px-6 pb-24">
      <div className="grid gap-4 sm:grid-cols-2">
        {CARACTERISTICAS.map((caracteristica) => (
          <div
            key={caracteristica.titulo}
            ref={(el) => {
              if (el) tarjetasRef.current.push(el);
            }}
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
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500/20 to-violet-500/20 text-violet-300">
              {caracteristica.icono}
            </span>
            <h3 className="mt-4 text-sm font-semibold text-zinc-100">
              {caracteristica.titulo}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {caracteristica.descripcion}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
