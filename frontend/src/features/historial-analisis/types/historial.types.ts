export interface HistorialResumen {
  id: number;
  fecha: string;
  partido: string;
  encontrado: boolean;
  analisis_completo: boolean;
  recomendacion: string | null;
  valor_esperado: number;
  confianza: 'alta' | 'media' | 'baja';
}
