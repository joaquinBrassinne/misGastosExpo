export type TransactionType = 'ingreso' | 'gasto';
export type CategoryType = 'ingreso' | 'gasto' | 'ambos';

export interface Category {
  id: number;
  nombre: string;
  tipo: CategoryType;
  icono: string;
  color: string;
  es_sistema: number; // 1 = predeterminada, 0 = creada por el usuario
}

export interface Transaction {
  id: number;
  monto: number;
  tipo: TransactionType;
  categoria_id: number;
  fecha: string; // YYYY-MM-DD
  descripcion: string;
  created_at?: string;
  // Campos del JOIN con categoria
  categoria_nombre?: string;
  categoria_icono?: string;
  categoria_color?: string;
}

export interface Summary {
  saldoInicial: number;
  totalIngresos: number;
  totalGastos: number;
  saldoActual: number;
}

export interface CategoryExpenseReport {
  categoriaId: number;
  categoriaNombre: string;
  categoriaIcono: string;
  categoriaColor: string;
  totalGastado: number;
  cantidadTransacciones: number;
  porcentaje: number;
}

export interface PeriodReport {
  periodo: string; // Ej: "Noviembre 2026" o "Semana 44 (28 Oct - 03 Nov)"
  totalGastos: number;
  totalIngresos: number;
  balance: number;
  categorias: CategoryExpenseReport[];
}

