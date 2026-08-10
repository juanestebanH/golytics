export default function PoliticaCookiesPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-14">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Política de cookies</h1>
          <p className="mt-2 text-sm text-zinc-500">Última actualización: 2026</p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
          <h2 className="text-base font-semibold text-zinc-200">
            1. ¿Qué son las cookies?
          </h2>
          <p>
            Las cookies son pequeños archivos que los sitios web guardan en tu
            navegador para recordar información entre visitas. Según la normativa
            europea (RGPD y Directiva ePrivacy), el uso de cookies no esenciales
            requiere tu consentimiento previo.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
          <h2 className="text-base font-semibold text-zinc-200">
            2. Qué usa Golytics
          </h2>
          <p>
            <span className="text-zinc-200">Golytics no utiliza cookies.</span>{' '}
            En sentido estricto, no instalamos ninguna cookie en tu navegador: ni
            de sesión, ni de análisis, ni de publicidad, ni de terceros.
          </p>
          <p>
            El único almacenamiento que usa la aplicación es{' '}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">
              localStorage
            </code>
            , una tecnología local de tu navegador (no una cookie) con la que
            guardamos un identificador de sesión anónimo (
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">
              betting_agent_session_id
            </code>
            ) para asociarte tu historial de análisis. Esta información no sale de
            tu navegador ni se usa para rastrearte.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
          <h2 className="text-base font-semibold text-zinc-200">
            3. Cómo gestionar o eliminar el almacenamiento
          </h2>
          <p>
            Puedes borrar el identificador de sesión en cualquier momento desde la
            configuración de tu navegador: ajustes de privacidad → "borrar datos
            del sitio" (o "datos de almacenamiento local"). Al hacerlo, tu
            historial dejará de asociarse a tu sesión.
          </p>
          <p>
            El servicio funciona sin él, aunque no podrás recuperar el historial
            previo de esa sesión.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
          <h2 className="text-base font-semibold text-zinc-200">
            4. Cambios futuros
          </h2>
          <p>
            Si en el futuro incorporamos cookies de terceros (por ejemplo, para
            medir audiencia con tu consentimiento), actualizaremos esta política y
            te pediremos consentimiento explícito mediante un banner antes de
            instalarlas.
          </p>
          <p>
            Dudas o preguntas: <span className="text-zinc-300">contacto@golytics.app</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
