import Spinner from '@/shared/components/Spinner';
import { ResultView } from '@/features/partido-analisis';
import HistorialList from '../components/HistorialList';
import { useHistorial } from '../hooks/useHistorial';

export default function HistorialPage() {
  const {
    historial,
    cargando,
    error,
    detalleSeleccionado,
    cargandoDetalle,
    cargarDetalle,
    cerrarDetalle,
    recargar,
  } = useHistorial();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-bold">Historial de análisis</h1>
        </header>

        {error ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">
              No se pudo cargar el historial. Comprueba tu conexión y reintenta.
            </p>
            <button
              type="button"
              onClick={recargar}
              className="shrink-0 rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 transition-colors hover:bg-red-500/10"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <HistorialList
            items={historial}
            cargando={cargando}
            onSeleccionar={cargarDetalle}
          />
        )}
      </div>

      {(cargandoDetalle || detalleSeleccionado) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={cerrarDetalle}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-6"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-zinc-100">
                Detalle del análisis
              </h2>
              <button
                type="button"
                onClick={cerrarDetalle}
                className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                Cerrar
              </button>
            </div>

            {cargandoDetalle ? (
              <div className="flex items-center gap-3 py-8 text-sm text-zinc-400">
                <Spinner />
                Cargando detalle...
              </div>
            ) : (
              detalleSeleccionado && (
                <ResultView resultado={detalleSeleccionado} />
              )
            )}
          </div>
        </div>
      )}
    </main>
  );
}
