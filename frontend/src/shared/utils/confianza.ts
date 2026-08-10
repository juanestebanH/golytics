const COLORES_CONFIANZA: Record<string, string> = {
  alta: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  media: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  baja: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const COLOR_CONFIANZA_DESCONOCIDA =
  'bg-zinc-700/40 text-zinc-300 border-zinc-600/40';

export function colorConfianza(confianza: string): string {
  return COLORES_CONFIANZA[confianza] ?? COLOR_CONFIANZA_DESCONOCIDA;
}

export function etiquetaConfianza(confianza: string): string {
  return confianza.charAt(0).toUpperCase() + confianza.slice(1);
}
