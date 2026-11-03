export interface SeedTransaction {
  monto: number;
  tipo: 'ingreso' | 'gasto';
  categoriaNombre: string;
  fecha: string;
  descripcion: string;
}

export function generateSeedTransactions(): SeedTransaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Genera fechas del mes corriente y días anteriores para demostrar reportes semanales
  const formatDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return [
    // Ingresos del mes
    {
      monto: 350000,
      tipo: 'ingreso',
      categoriaNombre: 'Sueldo / Salario',
      fecha: formatDate(25),
      descripcion: 'Cobro de sueldo mensual',
    },
    {
      monto: 75000,
      tipo: 'ingreso',
      categoriaNombre: 'Trabajo Freelance',
      fecha: formatDate(12),
      descripcion: 'Desarrollo de landing page para cliente',
    },
    {
      monto: 28000,
      tipo: 'ingreso',
      categoriaNombre: 'Inversiones',
      fecha: formatDate(5),
      descripcion: 'Rendimientos de Fondo Común de Inversión',
    },
    {
      monto: 15000,
      tipo: 'ingreso',
      categoriaNombre: 'Ventas',
      fecha: formatDate(2),
      descripcion: 'Venta de monitor usado',
    },

    // Gastos repartidos en distintas semanas
    {
      monto: 85000,
      tipo: 'gasto',
      categoriaNombre: 'Vivienda y Servicios',
      fecha: formatDate(24),
      descripcion: 'Pago de alquiler y expensas',
    },
    {
      monto: 18500,
      tipo: 'gasto',
      categoriaNombre: 'Vivienda y Servicios',
      fecha: formatDate(20),
      descripcion: 'Facturas de Luz, Gas e Internet',
    },
    {
      monto: 38500,
      tipo: 'gasto',
      categoriaNombre: 'Supermercado',
      fecha: formatDate(19),
      descripcion: 'Compra quincenal en supermercado',
    },
    {
      monto: 12000,
      tipo: 'gasto',
      categoriaNombre: 'Transporte',
      fecha: formatDate(18),
      descripcion: 'Carga de combustible y tarjeta de transporte',
    },
    {
      monto: 8400,
      tipo: 'gasto',
      categoriaNombre: 'Alimentación',
      fecha: formatDate(15),
      descripcion: 'Cena con amigos en restaurante',
    },
    {
      monto: 14500,
      tipo: 'gasto',
      categoriaNombre: 'Salud y Bienestar',
      fecha: formatDate(13),
      descripcion: 'Farmacia y suplementos',
    },
    {
      monto: 22000,
      tipo: 'gasto',
      categoriaNombre: 'Supermercado',
      fecha: formatDate(10),
      descripcion: 'Reposición de carnes, frutas y verduras',
    },
    {
      monto: 6500,
      tipo: 'gasto',
      categoriaNombre: 'Ocio y Salidas',
      fecha: formatDate(8),
      descripcion: 'Entradas de cine y pochoclos',
    },
    {
      monto: 19500,
      tipo: 'gasto',
      categoriaNombre: 'Educación',
      fecha: formatDate(6),
      descripcion: 'Cuota del curso de programación',
    },
    {
      monto: 4500,
      tipo: 'gasto',
      categoriaNombre: 'Transporte',
      fecha: formatDate(4),
      descripcion: 'Viaje en taxi / Uber a reunión',
    },
    {
      monto: 11200,
      tipo: 'gasto',
      categoriaNombre: 'Alimentación',
      fecha: formatDate(2),
      descripcion: 'Almuerzo laboral y cafés de la semana',
    },
    {
      monto: 16800,
      tipo: 'gasto',
      categoriaNombre: 'Ropa y Calzado',
      fecha: formatDate(1),
      descripcion: 'Zapatillas deportivas en liquidación',
    },
  ];
}

