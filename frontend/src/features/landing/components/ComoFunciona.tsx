import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/shared/lib/gsapConfig';

const PASOS = [
  {
    numero: '01',
    titulo: 'Elige liga y partido',
    descripcion:
      'Selecciona entre las 12 competiciones principales y el partido que quieres analizar.',
  },
  {
    numero: '02',
    titulo: 'El agente investiga',
    descripcion:
      'Un agente de IA decide qué datos consultar: forma reciente, cuotas de varias casas y valor esperado.',
  },
  {
    numero: '03',
    titulo: 'Recibe el análisis',
    descripcion:
      'Una recomendación clara con nivel de confianza, el EV de la apuesta y la comparación de cuotas completa.',
  },
];

export default function ComoFunciona() {
  const pasosRef = useRef<HTMLLIElement[]>([]);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      pasosRef.current.forEach((paso) => {
        gsap.fromTo(
          paso,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: paso,
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
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
        Cómo funciona
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-100">
        Tres pasos, cero conjeturas
      </h2>

      <ol className="mt-10 space-y-8">
        {PASOS.map((paso) => (
          <li
            key={paso.numero}
            ref={(el) => {
              if (el) pasosRef.current.push(el);
            }}
            className="flex gap-5"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-violet-300">
              {paso.numero}
            </span>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                {paso.titulo}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                {paso.descripcion}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
