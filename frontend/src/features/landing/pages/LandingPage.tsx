import { Link } from 'react-router-dom';

import Hero from '../components/Hero';
import FeatureCards from '../components/FeatureCards';
import ComoFunciona from '../components/ComoFunciona';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Hero />
      <FeatureCards />
      <ComoFunciona />
      <footer className="flex flex-col items-center gap-3 border-t border-white/5 py-8 text-center text-xs text-zinc-600">
        <p>
          Golytics — análisis estadístico con fines informativos y educativos. No
          constituye asesoría de apuestas.
        </p>
        <nav className="flex items-center gap-4">
          <Link
            to="/privacidad"
            className="transition-colors hover:text-zinc-300"
          >
            Política de privacidad
          </Link>
          <span className="text-zinc-800">·</span>
          <Link to="/cookies" className="transition-colors hover:text-zinc-300">
            Política de cookies
          </Link>
        </nav>
      </footer>
    </main>
  );
}
