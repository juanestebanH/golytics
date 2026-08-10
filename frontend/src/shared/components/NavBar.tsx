import { useRef, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { gsap } from '@/shared/lib/gsapConfig';

const clase = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm'
      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
  }`;

interface EnlacePillProps {
  to: string;
  children: ReactNode;
}

function EnlacePill({ to, children }: EnlacePillProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const animarEscala = (escala: number) => {
    gsap.to(ref.current, {
      scale: escala,
      duration: 0.2,
      ease: 'power1.out',
      overwrite: true,
    });
  };

  return (
    <NavLink
      ref={ref}
      to={to}
      end={to === '/'}
      onMouseEnter={() => animarEscala(1.03)}
      onMouseLeave={() => animarEscala(1)}
      className={clase}
    >
      {children}
    </NavLink>
  );
}

export default function NavBar() {
  return (
    <nav className="sticky top-4 z-40">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-2xl bg-zinc-950/80 px-5 py-3 shadow-lg shadow-black/20 backdrop-blur-xl">
        <Link
          to="/"
          className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-sm font-bold tracking-tight text-transparent transition-opacity hover:opacity-80"
        >
          Golytics
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          <EnlacePill to="/">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            Inicio
          </EnlacePill>
          <EnlacePill to="/analizar">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                clipRule="evenodd"
              />
            </svg>
            Analizar
          </EnlacePill>
          <EnlacePill to="/historial">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            Historial
          </EnlacePill>
        </div>
      </div>
    </nav>
  );
}
