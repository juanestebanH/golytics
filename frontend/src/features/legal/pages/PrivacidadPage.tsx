export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-14">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">
            Política de privacidad
          </h1>
          <p className="mt-2 text-sm text-zinc-500">Última actualización: 2026</p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
          <h2 className="text-base font-semibold text-zinc-200">
            1. Responsable del tratamiento
          </h2>
          <p>
            Golytics es un proyecto de análisis deportivo con inteligencia
            artificial. Para cualquier cuestión sobre esta política, puedes
            escribirnos a{' '}
            <span className="text-zinc-300">contacto@golytics.app</span>.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
          <h2 className="text-base font-semibold text-zinc-200">
            2. Datos que tratamos
          </h2>
          <p>Solo tratamos los datos imprescindibles para ofrecer el servicio:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <span className="text-zinc-300">Datos que envías:</span> liga y
              partido seleccionados para generar un análisis.
            </li>
            <li>
              <span className="text-zinc-300">Identificador de sesión:</span> un
              ID anónimo generado en tu navegador (almacenado en{' '}
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">
                localStorage
              </code>
              ) que se usa para asociar tus análisis a tu historial.
            </li>
            <li>
              <span className="text-zinc-300">Historial de análisis:</span> los
              resultados generados (recomendación, confianza, valor esperado y
              cuotas comparadas) quedan asociados a tu sesión.
            </li>
          </ul>
          <p>
            No solicitamos ni almacenamos nombre, correo, documentos de identidad
            ni datos de pago.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
          <h2 className="text-base font-semibold text-zinc-200">
            3. Finalidad y base legal
          </h2>
          <p>
            Los datos se usan exclusivamente para ejecutar los análisis que
            solicitas y mostrarte tu historial. La base legal es la ejecución del
            propio servicio (art. 6.1.b RGPD). No usamos tus datos para
            publicidad, elaboración de perfiles ni comunicación comercial.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
          <h2 className="text-base font-semibold text-zinc-200">
            4. Cookies
          </h2>
          <p>
            Golytics no utiliza cookies de rastreo, publicidad ni análisis de
            terceros. El único almacenamiento es técnico y local (localStorage).
            Consulta nuestra{' '}
            <a
              href="/cookies"
              className="text-violet-400 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-300"
            >
              política de cookies
            </a>
            .
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
          <h2 className="text-base font-semibold text-zinc-200">
            5. Conservación y derechos
          </h2>
          <p>
            Puedes eliminar tu historial en cualquier momento desde la aplicación
            y borrar el identificador de sesión desde la configuración de tu
            navegador (datos del sitio). Tienes derecho de acceso, rectificación,
            supresión, limitación, portabilidad y oposición; escríbenos a{' '}
            <span className="text-zinc-300">contacto@golytics.app</span> y
            responderemos sin demora injustificada.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-zinc-400">
          <h2 className="text-base font-semibold text-zinc-200">
            6. Aviso sobre apuestas
          </h2>
          <p>
            El contenido de Golytics tiene fines informativos y educativos. No
            constituye asesoramiento financiero ni de apuestas. El juego con
            apuestas puede generar adicción: juega con responsabilidad y solo si
            eres mayor de 18 años (o la edad legal en tu país).
          </p>
        </section>
      </div>
    </main>
  );
}
