import { createAdapter } from './adapter';
import { CREATE_TABLES_SQL, INITIAL_CATEGORIES } from './schema';
import { generateSeedTransactions } from './seedData';
import { IDatabaseAdapter } from './types';
import {
  Category,
  CategoryExpenseReport,
  CategoryType,
  PeriodReport,
  Summary,
  Transaction,
  TransactionType,
} from '../../types';

class DatabaseService {
  private adapter: IDatabaseAdapter;
  private isReady: boolean = false;

  constructor() {
    this.adapter = createAdapter();
  }

  async init(): Promise<void> {
    if (this.isReady) return;

    await this.adapter.init();
    await this.adapter.exec(CREATE_TABLES_SQL);

    // Inicializar configuración por defecto si no existe
    const saldoInit = await this.adapter.getFirst<{ valor: string }>(
      'SELECT valor FROM configuracion WHERE clave = ?;',
      ['saldo_inicial']
    );

    if (!saldoInit) {
      await this.adapter.run(
        'INSERT INTO configuracion (clave, valor) VALUES (?, ?);',
        ['saldo_inicial', '0']
      );
    }

    // Inicializar categorías por defecto si la tabla está vacía
    const catCount = await this.adapter.getFirst<{ total: number }>(
      'SELECT COUNT(*) as total FROM categorias;'
    );

    if (!catCount || catCount.total === 0) {
      for (const cat of INITIAL_CATEGORIES) {
        await this.adapter.run(
          'INSERT INTO categorias (nombre, tipo, icono, color, es_sistema) VALUES (?, ?, ?, ?, ?);',
          [cat.nombre, cat.tipo, cat.icono, cat.color, cat.es_sistema]
        );
      }
    }

    this.isReady = true;
  }

  // ==========================================
  // CONFIGURACIÓN Y SALDOS
  // ==========================================

  async getSaldoInicial(): Promise<number> {
    const row = await this.adapter.getFirst<{ valor: string }>(
      'SELECT valor FROM configuracion WHERE clave = ?;',
      ['saldo_inicial']
    );
    return row ? parseFloat(row.valor) || 0 : 0;
  }

  async setSaldoInicial(monto: number): Promise<void> {
    const sanitized = Math.max(0, monto);
    await this.adapter.run(
      'INSERT OR REPLACE INTO configuracion (clave, valor) VALUES (?, ?);',
      ['saldo_inicial', sanitized.toString()]
    );
  }

  async getFinancialSummary(): Promise<Summary> {
    const saldoInicial = await this.getSaldoInicial();

    const ingresosRow = await this.adapter.getFirst<{ total: number | null }>(
      "SELECT SUM(monto) as total FROM movimientos WHERE tipo = 'ingreso';"
    );
    const gastosRow = await this.adapter.getFirst<{ total: number | null }>(
      "SELECT SUM(monto) as total FROM movimientos WHERE tipo = 'gasto';"
    );

    const totalIngresos = ingresosRow?.total ?? 0;
    const totalGastos = gastosRow?.total ?? 0;
    const saldoActual = saldoInicial + totalIngresos - totalGastos;

    return {
      saldoInicial,
      totalIngresos,
      totalGastos,
      saldoActual,
    };
  }

  // ==========================================
  // CATEGORÍAS (CRUD)
  // ==========================================

  async getCategories(tipo?: CategoryType): Promise<Category[]> {
    if (tipo && tipo !== 'ambos') {
      return await this.adapter.getAll<Category>(
        "SELECT * FROM categorias WHERE tipo = ? OR tipo = 'ambos' ORDER BY nombre ASC;",
        [tipo]
      );
    }
    return await this.adapter.getAll<Category>(
      'SELECT * FROM categorias ORDER BY tipo ASC, nombre ASC;'
    );
  }

  async getCategoryById(id: number): Promise<Category | null> {
    return await this.adapter.getFirst<Category>(
      'SELECT * FROM categorias WHERE id = ?;',
      [id]
    );
  }

  async createCategory(categoria: {
    nombre: string;
    tipo: CategoryType;
    icono: string;
    color: string;
  }): Promise<number> {
    const result = await this.adapter.run(
      'INSERT INTO categorias (nombre, tipo, icono, color, es_sistema) VALUES (?, ?, ?, ?, 0);',
      [categoria.nombre.trim(), categoria.tipo, categoria.icono, categoria.color]
    );
    return result.lastInsertRowId;
  }

  async updateCategory(
    id: number,
    categoria: {
      nombre: string;
      tipo: CategoryType;
      icono: string;
      color: string;
    }
  ): Promise<void> {
    await this.adapter.run(
      'UPDATE categorias SET nombre = ?, tipo = ?, icono = ?, color = ? WHERE id = ?;',
      [categoria.nombre.trim(), categoria.tipo, categoria.icono, categoria.color, id]
    );
  }

  async deleteCategory(id: number): Promise<{ success: boolean; error?: string }> {
    // Comprobar integridad referencial: no borrar categorías con movimientos asociados
    const check = await this.adapter.getFirst<{ count: number }>(
      'SELECT COUNT(*) as count FROM movimientos WHERE categoria_id = ?;',
      [id]
    );

    if (check && check.count > 0) {
      return {
        success: false,
        error: `No se puede eliminar la categoría porque contiene ${check.count} movimiento(s) asociado(s). Reasigna o elimina los movimientos primero.`,
      };
    }

    await this.adapter.run('DELETE FROM categorias WHERE id = ?;', [id]);
    return { success: true };
  }

  // ==========================================
  // MOVIMIENTOS / TRANSACCIONES (CRUD)
  // ==========================================

  async getTransactions(filters?: {
    tipo?: TransactionType;
    categoriaId?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> {
    let sql = `
      SELECT 
        m.id,
        m.monto,
        m.tipo,
        m.categoria_id,
        m.fecha,
        m.descripcion,
        m.created_at,
        c.nombre AS categoria_nombre,
        c.icono AS categoria_icono,
        c.color AS categoria_color
      FROM movimientos m
      INNER JOIN categorias c ON m.categoria_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (filters?.tipo) {
      sql += ' AND m.tipo = ?';
      params.push(filters.tipo);
    }

    if (filters?.categoriaId) {
      sql += ' AND m.categoria_id = ?';
      params.push(filters.categoriaId);
    }

    if (filters?.search && filters.search.trim().length > 0) {
      sql += ' AND (m.descripcion LIKE ? OR c.nombre LIKE ?)';
      const term = `%${filters.search.trim()}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY m.fecha DESC, m.id DESC';

    if (filters?.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
      if (filters?.offset) {
        sql += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    return await this.adapter.getAll<Transaction>(sql, params);
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    const sql = `
      SELECT 
        m.id,
        m.monto,
        m.tipo,
        m.categoria_id,
        m.fecha,
        m.descripcion,
        m.created_at,
        c.nombre AS categoria_nombre,
        c.icono AS categoria_icono,
        c.color AS categoria_color
      FROM movimientos m
      INNER JOIN categorias c ON m.categoria_id = c.id
      WHERE m.id = ?;
    `;
    return await this.adapter.getFirst<Transaction>(sql, [id]);
  }

  async createTransaction(data: {
    monto: number;
    tipo: TransactionType;
    categoria_id: number;
    fecha: string;
    descripcion: string;
  }): Promise<number> {
    if (data.monto <= 0) {
      throw new Error('El monto debe ser mayor a cero.');
    }
    const result = await this.adapter.run(
      'INSERT INTO movimientos (monto, tipo, categoria_id, fecha, descripcion) VALUES (?, ?, ?, ?, ?);',
      [data.monto, data.tipo, data.categoria_id, data.fecha, data.descripcion?.trim() || '']
    );
    return result.lastInsertRowId;
  }

  async updateTransaction(
    id: number,
    data: {
      monto: number;
      tipo: TransactionType;
      categoria_id: number;
      fecha: string;
      descripcion: string;
    }
  ): Promise<void> {
    if (data.monto <= 0) {
      throw new Error('El monto debe ser mayor a cero.');
    }
    await this.adapter.run(
      'UPDATE movimientos SET monto = ?, tipo = ?, categoria_id = ?, fecha = ?, descripcion = ? WHERE id = ?;',
      [data.monto, data.tipo, data.categoria_id, data.fecha, data.descripcion?.trim() || '', id]
    );
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.adapter.run('DELETE FROM movimientos WHERE id = ?;', [id]);
  }

  // ==========================================
  // INFORMES (SEMANALES Y MENSUALES)
  // ==========================================

  async getExpensesByCategory(startDate?: string, endDate?: string): Promise<CategoryExpenseReport[]> {
    let sql = `
      SELECT 
        c.id AS categoriaId,
        c.nombre AS categoriaNombre,
        c.icono AS categoriaIcono,
        c.color AS categoriaColor,
        SUM(m.monto) AS totalGastado,
        COUNT(m.id) AS cantidadTransacciones
      FROM movimientos m
      INNER JOIN categorias c ON m.categoria_id = c.id
      WHERE m.tipo = 'gasto'
    `;
    const params: string[] = [];

    if (startDate && endDate) {
      sql += ' AND m.fecha BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    sql += ' GROUP BY c.id ORDER BY totalGastado DESC;';

    const raw = await this.adapter.getAll<{
      categoriaId: number;
      categoriaNombre: string;
      categoriaIcono: string;
      categoriaColor: string;
      totalGastado: number;
      cantidadTransacciones: number;
    }>(sql, params);

    const totalGeneral = raw.reduce((sum, item) => sum + (item.totalGastado || 0), 0);

    return raw.map((item) => ({
      ...item,
      porcentaje: totalGeneral > 0 ? (item.totalGastado / totalGeneral) * 100 : 0,
    }));
  }

  async getMonthlyReport(year: number, month: number): Promise<PeriodReport> {
    const padMonth = String(month).padStart(2, '0');
    const startDate = `${year}-${padMonth}-01`;
    // Último día del mes
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${padMonth}-${String(lastDay).padStart(2, '0')}`;

    const gastosRow = await this.adapter.getFirst<{ total: number | null }>(
      "SELECT SUM(monto) as total FROM movimientos WHERE tipo = 'gasto' AND fecha BETWEEN ? AND ?;",
      [startDate, endDate]
    );
    const ingresosRow = await this.adapter.getFirst<{ total: number | null }>(
      "SELECT SUM(monto) as total FROM movimientos WHERE tipo = 'ingreso' AND fecha BETWEEN ? AND ?;",
      [startDate, endDate]
    );

    const totalGastos = gastosRow?.total ?? 0;
    const totalIngresos = ingresosRow?.total ?? 0;
    const balance = totalIngresos - totalGastos;

    const categorias = await this.getExpensesByCategory(startDate, endDate);

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    return {
      periodo: `${monthNames[month - 1]} ${year}`,
      totalGastos,
      totalIngresos,
      balance,
      categorias,
    };
  }

  async getWeeklyBreakdown(year: number, month: number): Promise<
    { semanaNumero: number; etiqueta: string; startDate: string; endDate: string; totalGastos: number; totalIngresos: number }[]
  > {
    const padMonth = String(month).padStart(2, '0');
    const lastDay = new Date(year, month, 0).getDate();

    // Dividimos el mes en bloques semanales de 7 días
    const weeks = [
      { num: 1, start: 1, end: 7 },
      { num: 2, start: 8, end: 14 },
      { num: 3, start: 15, end: 21 },
      { num: 4, start: 22, end: lastDay },
    ];

    const results = [];

    for (const w of weeks) {
      const sDate = `${year}-${padMonth}-${String(w.start).padStart(2, '0')}`;
      const eDate = `${year}-${padMonth}-${String(w.end).padStart(2, '0')}`;

      const gRow = await this.adapter.getFirst<{ total: number | null }>(
        "SELECT SUM(monto) as total FROM movimientos WHERE tipo = 'gasto' AND fecha BETWEEN ? AND ?;",
        [sDate, eDate]
      );
      const iRow = await this.adapter.getFirst<{ total: number | null }>(
        "SELECT SUM(monto) as total FROM movimientos WHERE tipo = 'ingreso' AND fecha BETWEEN ? AND ?;",
        [sDate, eDate]
      );

      results.push({
        semanaNumero: w.num,
        etiqueta: `Semana ${w.num} (${w.start} al ${w.end} ${padMonth})`,
        startDate: sDate,
        endDate: eDate,
        totalGastos: gRow?.total ?? 0,
        totalIngresos: iRow?.total ?? 0,
      });
    }

    return results;
  }

  // ==========================================
  // DEMO Y MANTENIMIENTO
  // ==========================================

  async seedDemoData(): Promise<void> {
    // Establecer saldo inicial representativo
    await this.setSaldoInicial(150000);

    // Obtener mapa de categorías por nombre
    const cats = await this.getCategories('ambos');
    const catMap = new Map<string, number>();
    cats.forEach((c) => catMap.set(c.nombre, c.id));

    // Sembrar transacciones
    const demoTransactions = generateSeedTransactions();
    for (const t of demoTransactions) {
      const catId = catMap.get(t.categoriaNombre) || cats[0]?.id || 1;
      await this.createTransaction({
        monto: t.monto,
        tipo: t.tipo,
        categoria_id: catId,
        fecha: t.fecha,
        descripcion: t.descripcion,
      });
    }
  }

  async resetDatabase(): Promise<void> {
    await this.adapter.exec(`
      DROP TABLE IF EXISTS movimientos;
      DROP TABLE IF EXISTS categorias;
      DROP TABLE IF EXISTS configuracion;
    `);
    this.isReady = false;
    await this.init();
  }
}

export const databaseService = new DatabaseService();

