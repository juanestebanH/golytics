import { lazy, Suspense, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { gsap } from '@/shared/lib/gsapConfig';

const HeroBackground = lazy(() => import('./HeroBackground'));

export default function Hero() {
  const badgeRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const botonesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const verHistorialRef = useRef<HTMLAnchorElement>(null);

  const animarEscala = (objetivo: HTMLElement | null, escala: number) => {
    if (!objetivo) return;
    gsap.to(objetivo, {
      scale: escala,
      duration: 0.2,
      ease: 'power1.out',
      overwrite: true,
    });
  };

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        defaults: { duration: 0.7, ease: 'power2.out' },
      });

      tl.fromTo(badgeRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 })
        .fromTo(
          headlineRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0 },
          '-=0.35',
        )
        .fromTo(
          subheadlineRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0 },
          '-=0.35',
        )
        .fromTo(
          botonesRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0 },
          '-=0.4',
        );
    });
  });

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <Suspense fallback={null}>
          <HeroBackground />
        </Suspense>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 h-112 w-176 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-40 w-xl -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-32 text-center">
        <span
          ref={badgeRef}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium"
        >
          <span className="size-1.5 rounded-full bg-linear-to-r from-indigo-400 to-violet-400" />
          <span className="bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text font-bold text-transparent">
            Golytics
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400">Agente de IA para apuestas</span>
        </span>

        <h1
          ref={headlineRef}
          className="mt-8 text-4xl font-bold leading-tight tracking-tight text-zinc-100 sm:text-6xl"
        >
          Análisis cuantitativo de apuestas deportivas, impulsado por un{' '}
          <span className="bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            agente de IA
          </span>
        </h1>

        <p
          ref={subheadlineRef}
          className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400"
        >
          Nuestro agente decide qué fuentes consultar: analiza la forma reciente
          de los equipos, compara cuotas de múltiples casas y calcula el valor
          esperado real de cada apuesta — mostrándote cada paso del
          razonamiento.
        </p>

        <div ref={botonesRef} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            ref={ctaRef}
            to="/analizar"
            onMouseEnter={() => animarEscala(ctaRef.current, 1.03)}
            onMouseLeave={() => animarEscala(ctaRef.current, 1)}
            className="rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-[filter,box-shadow] hover:brightness-110 hover:shadow-violet-500/40"
          >
            Comenzar análisis
          </Link>
          <Link
            ref={verHistorialRef}
            to="/historial"
            onMouseEnter={() => animarEscala(verHistorialRef.current, 1.03)}
            onMouseLeave={() => animarEscala(verHistorialRef.current, 1)}
            className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/5"
          >
            Ver historial
          </Link>
        </div>
      </div>
    </section>
  );
}
