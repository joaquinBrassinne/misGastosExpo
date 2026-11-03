# Gastos Personales — Aplicación Móvil con Expo y SQLite

Aplicación de gestión de gastos e ingresos personales desarrollada con **React Native**, el framework **Expo** (SDK 58), **TypeScript** y almacenamiento relacional en **SQLite** (`expo-sqlite` para dispositivos móviles Android/iOS y `sql.js` en memoria para plataforma Web).

---

## 📱 Características Principales

1. **Gestión de Saldo Inicial y Saldo Actual**:
   - Permite cargar y modificar un saldo inicial que se persiste en la base de datos relacional.
   - Calcula y muestra en tiempo real el **saldo actual** disponible mediante la fórmula:
     $$\text{Saldo Actual} = \text{Saldo Inicial} + \sum \text{Ingresos} - \sum \text{Gastos}$$
   - Indicadores visuales de balance positivo o negativo.

2. **Base de Datos Relacional SQLite**:
   - Dos tablas relacionales principales: `categorias` y `movimientos`, más una tabla de configuración `configuracion`.
   - Clave foránea `categoria_id` que referencia a `categorias(id)` con regla de integridad referencial.
   - Índices de rendimiento en `fecha`, `categoria_id` y `tipo`.
   - Validación con restricciones `CHECK` (montos mayores a cero, tipos estrictos).

3. **CRUD Completo de Movimientos**:
   - Registro de Ingresos y Gastos con selector de categoría, monto, fecha editable y descripción.
   - Listado en tiempo real con buscador de texto libre y filtros por tipo (Todos / Gastos / Ingresos) y por categoría.
   - Edición y eliminación con diálogos modales de confirmación para evitar pérdidas accidentales.

4. **CRUD Completo de Categorías**:
   - Categorías predeterminadas del sistema (Alimentación, Transporte, Vivienda, Salud, Educación, Sueldo, Freelance, etc.).
   - Creación de categorías personalizadas con selector de más de 20 iconos (`MaterialCommunityIcons`) y paleta de 12 colores distintivos.
   - Validación de integridad referencial: no permite eliminar categorías que tengan movimientos asociados.

5. **Informes Semanales y Mensuales**:
   - **Informe Mensual por Categorías**: Ranking de categorías con mayor gasto, porcentaje del total gastado y barras de progreso visuales.
   - **Informe Semanal**: Desglose del mes en bloques semanales (Semana 1 a 4) comparando gastos e ingresos a lo largo del tiempo.
   - Selector interactivo de meses anteriores y posteriores.

6. **Arquitectura Multiplataforma Desacoplada (Patrón Adapter)**:
   - En **Android / iOS nativo**: utiliza `expo-sqlite` con modo WAL (Write-Ahead Logging).
   - En **Web**: utiliza `sql.js` (SQLite compilado a WebAssembly en memoria).
   - Metro Bundler resuelve automáticamente `adapter.native.ts` o `adapter.web.ts` según la plataforma objetivo, logrando compatibilidad 100% libre de errores.

7. **Herramientas de Demostración**:
   - Botón para cargar datos de prueba realistas (*Seed Data*) para evaluar la aplicación al instante.
   - Opción para reiniciar la base de datos a su estado de fábrica.

---

## 🚀 Requisitos y Puesta en Marcha

### Requisitos Previos
- **Node.js** (v18 o superior recomendado).
- **VS Code** con la extensión de React Native / Expo recomendada.
- Para probar en Android físico: instalar la app **Expo Go** desde Google Play Store.

### Instalación de Dependencias
```bash
npm install
```

### Ejecutar en Android (Expo Go / Emulador)
```bash
npx expo start
```
1. Presiona `a` en la terminal para abrir en un emulador Android conectado.
2. O escanea el código QR desde la aplicación **Expo Go** en tu dispositivo físico Android conectado a la misma red Wi-Fi.

### Ejecutar en Navegador Web (con sql.js en memoria)
```bash
npx expo start --web
```

### Compilar Build de Producción Web
```bash
npx expo export -p web
```
El compilado resultante se genera en la carpeta `dist/`.

---

## 🗄️ Estructura del Proyecto

```
AppMobile/
├── assets/                       # Íconos, splash screen y recursos visuales
├── dist/                         # Build compilado para plataforma Web (sql.js)
├── entrega_tp/                   # Paquetes ZIP preparados para entrega
├── src/
│   ├── types/                    # Definiciones TypeScript de entidades y contratos
│   ├── services/
│   │   └── database/             # Capa relacional SQLite
│   │       ├── adapter.native.ts # Implementación expo-sqlite (Android)
│   │       ├── adapter.web.ts    # Implementación sql.js (Web en memoria)
│   │       ├── schema.ts         # DDL de tablas e índices SQL
│   │       ├── seedData.ts       # Datos de prueba para evaluación
│   │       └── databaseService.ts# Fachada de operaciones y lógica de negocio
│   ├── context/                  # AppContext (Estado global y sincronización)
│   ├── components/               # Componentes reutilizables de UI y Modales
│   │   ├── Header.tsx
│   │   ├── BottomTabs.tsx
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── TransactionItem.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── TransactionModal.tsx
│   │   ├── CategoryModal.tsx
│   │   ├── InitialBalanceModal.tsx
│   │   └── ConfirmModal.tsx
│   ├── screens/                  # Las 4 pantallas principales
│   │   ├── HomeScreen.tsx        # Dashboard, saldo actual, métricas y accesos rápidos
│   │   ├── TransactionsScreen.tsx# Historial, buscador, filtros combinados y listado
│   │   ├── ReportsScreen.tsx     # Informes de gastos semanales y mensuales con gráficos
│   │   └── CategoriesScreen.tsx  # Gestión de categorías y ajustes de base de datos
│   └── utils/                    # Funciones de formateo de moneda y fechas
├── App.tsx                       # Componente raíz con SafeArea y navegación
├── app.json                      # Configuración de Expo y plugins nativos
├── tsconfig.json                 # Configuración de compilador TypeScript
└── package.json                  # Dependencias y scripts de ejecución
```

