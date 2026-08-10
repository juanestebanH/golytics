import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

import { AnalisisPage } from '@/features/partido-analisis';
import { HistorialPage } from '@/features/historial-analisis';
import { LandingPage } from '@/features/landing';
import { PoliticaCookiesPage, PrivacidadPage } from '@/features/legal';
import NavBar from '@/shared/components/NavBar';

const METADATOS: Record<string, { titulo: string; descripcion: string }> = {
  '/': {
    titulo: 'Golytics — Análisis de apuestas deportivas con IA',
    descripcion:
      'Analiza partidos de fútbol con un agente de IA: forma reciente, cuotas comparadas y valor esperado antes de apostar.',
  },
  '/analizar': {
    titulo: 'Analizar partido — Golytics',
    descripcion:
      'Elige liga y partido, y deja que el agente de IA analice forma, cuotas y valor esperado en tiempo real.',
  },
  '/historial': {
    titulo: 'Historial de análisis — Golytics',
    descripcion:
      'Consulta tus análisis anteriores: recomendaciones, cuotas y valor esperado de cada partido analizado.',
  },
  '/privacidad': {
    titulo: 'Política de privacidad — Golytics',
    descripcion:
      'Qué datos tratamos, con qué finalidad y tus derechos: política de privacidad de Golytics.',
  },
  '/cookies': {
    titulo: 'Política de cookies — Golytics',
    descripcion:
      'Golytics no utiliza cookies: solo almacenamiento local técnico. Consulta la política de cookies completa.',
  },
};

function PageMeta() {
  const { pathname } = useLocation();
  const meta = METADATOS[pathname] ?? METADATOS['/'];

  useEffect(() => {
    document.title = meta.titulo;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', meta.descripcion);
  }, [meta]);

  return null;
}

function Layout() {
  const { pathname } = useLocation();
  const esLanding = pathname === '/';

  return (
    <>
      {!esLanding && <NavBar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analizar" element={<AnalisisPage />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/privacidad" element={<PrivacidadPage />} />
        <Route path="/cookies" element={<PoliticaCookiesPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PageMeta />
      <Layout />
    </BrowserRouter>
  );
}

export default App;
