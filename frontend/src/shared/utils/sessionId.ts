const CLAVE_SESION = 'betting_agent_session_id';

export function getSessionId(): string {
  const existente = localStorage.getItem(CLAVE_SESION);

  if (existente) {
    return existente;
  }

  const nuevo = crypto.randomUUID();
  localStorage.setItem(CLAVE_SESION, nuevo);
  return nuevo;
}
