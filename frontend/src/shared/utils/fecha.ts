export function formatearFecha(fecha: string): string {
  const fechaObj = new Date(fecha);
  if (Number.isNaN(fechaObj.getTime())) return fecha;

  return fechaObj.toLocaleString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
