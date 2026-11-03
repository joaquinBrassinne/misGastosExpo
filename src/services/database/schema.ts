export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('ingreso', 'gasto', 'ambos')),
  icono TEXT NOT NULL,
  color TEXT NOT NULL,
  es_sistema INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS movimientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  monto REAL NOT NULL CHECK(monto > 0),
  tipo TEXT NOT NULL CHECK(tipo IN ('ingreso', 'gasto')),
  categoria_id INTEGER NOT NULL,
  fecha TEXT NOT NULL,
  descripcion TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_categoria ON movimientos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos(tipo);
`;

export const INITIAL_CATEGORIES = [
  // Gastos
  { nombre: 'Alimentación', tipo: 'gasto', icono: 'silverware-fork-knife', color: '#EF4444', es_sistema: 1 },
  { nombre: 'Transporte', tipo: 'gasto', icono: 'car', color: '#F59E0B', es_sistema: 1 },
  { nombre: 'Vivienda y Servicios', tipo: 'gasto', icono: 'home', color: '#3B82F6', es_sistema: 1 },
  { nombre: 'Ocio y Salidas', tipo: 'gasto', icono: 'gamepad-variant', color: '#EC4899', es_sistema: 1 },
  { nombre: 'Salud y Bienestar', tipo: 'gasto', icono: 'heart-pulse', color: '#10B981', es_sistema: 1 },
  { nombre: 'Educación', tipo: 'gasto', icono: 'school', color: '#8B5CF6', es_sistema: 1 },
  { nombre: 'Ropa y Calzado', tipo: 'gasto', icono: 'tshirt-crew', color: '#06B6D4', es_sistema: 1 },
  { nombre: 'Supermercado', tipo: 'gasto', icono: 'cart', color: '#F97316', es_sistema: 1 },
  { nombre: 'Otros Gastos', tipo: 'gasto', icono: 'dots-horizontal-circle', color: '#6B7280', es_sistema: 1 },

  // Ingresos
  { nombre: 'Sueldo / Salario', tipo: 'ingreso', icono: 'cash-multiple', color: '#10B981', es_sistema: 1 },
  { nombre: 'Trabajo Freelance', tipo: 'ingreso', icono: 'laptop', color: '#3B82F6', es_sistema: 1 },
  { nombre: 'Inversiones', tipo: 'ingreso', icono: 'chart-line', color: '#8B5CF6', es_sistema: 1 },
  { nombre: 'Ventas', tipo: 'ingreso', icono: 'tag', color: '#F59E0B', es_sistema: 1 },
  { nombre: 'Regalos / Premios', tipo: 'ingreso', icono: 'gift', color: '#EC4899', es_sistema: 1 },
  { nombre: 'Otros Ingresos', tipo: 'ingreso', icono: 'plus-circle', color: '#14B8A6', es_sistema: 1 },
];

