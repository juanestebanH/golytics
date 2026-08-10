export interface Liga {
  codigo: string;
  nombre: string;
}

export const LIGAS: Liga[] = [
  { codigo: 'PL', nombre: 'Premier League' },
  { codigo: 'BL1', nombre: 'Bundesliga' },
  { codigo: 'SA', nombre: 'Serie A' },
  { codigo: 'PD', nombre: 'La Liga' },
  { codigo: 'FL1', nombre: 'Ligue 1' },
  { codigo: 'DED', nombre: 'Eredivisie' },
  { codigo: 'PPL', nombre: 'Primeira Liga' },
  { codigo: 'BSA', nombre: 'Brasileirão Série A' },
  { codigo: 'CL', nombre: 'Champions League' },
  { codigo: 'EC', nombre: 'European Championship' },
  { codigo: 'WC', nombre: 'FIFA World Cup' },
  { codigo: 'ELC', nombre: 'Championship (Inglaterra)' },
];
