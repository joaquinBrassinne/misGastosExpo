import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Category, CategoryType, Summary, Transaction, TransactionType } from '../types';
import { databaseService } from '../services/database/databaseService';

export type TabScreen = 'home' | 'transactions' | 'reports' | 'categories';

interface AppContextType {
  isLoading: boolean;
  activeTab: TabScreen;
  setActiveTab: (tab: TabScreen) => void;
  summary: Summary;
  categories: Category[];
  transactions: Transaction[];
  refreshData: () => Promise<void>;
  
  // Saldos
  updateInitialBalance: (monto: number) => Promise<void>;
  
  // Transacciones
  saveTransaction: (data: {
    id?: number;
    monto: number;
    tipo: TransactionType;
    categoria_id: number;
    fecha: string;
    descripcion: string;
  }) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;

  // Categorías
  saveCategory: (data: {
    id?: number;
    nombre: string;
    tipo: CategoryType;
    icono: string;
    color: string;
  }) => Promise<void>;
  deleteCategory: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Mantenimiento
  loadDemoData: () => Promise<void>;
  resetDatabase: () => Promise<void>;

  // Modales globales
  isTransactionModalVisible: boolean;
  editingTransaction: Transaction | null;
  defaultTransactionType: TransactionType;
  openTransactionModal: (tx?: Transaction | null, defaultType?: TransactionType) => void;
  closeTransactionModal: () => void;

  isInitialBalanceModalVisible: boolean;
  openInitialBalanceModal: () => void;
  closeInitialBalanceModal: () => void;

  isCategoryModalVisible: boolean;
  editingCategory: Category | null;
  openCategoryModal: (cat?: Category | null) => void;
  closeCategoryModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabScreen>('home');
  const [summary, setSummary] = useState<Summary>({
    saldoInicial: 0,
    totalIngresos: 0,
    totalGastos: 0,
    saldoActual: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Estado de modales
  const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [defaultTransactionType, setDefaultTransactionType] = useState<TransactionType>('gasto');

  const [isInitialBalanceModalVisible, setIsInitialBalanceModalVisible] = useState(false);

  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const refreshData = async () => {
    try {
      const [sum, cats, txs] = await Promise.all([
        databaseService.getFinancialSummary(),
        databaseService.getCategories(),
        databaseService.getTransactions(),
      ]);
      setSummary(sum);
      setCategories(cats);
      setTransactions(txs);
    } catch (error) {
      console.error('Error al actualizar datos de la base de datos:', error);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true);
        await databaseService.init();
        await refreshData();
      } catch (error) {
        console.error('Error durante la inicialización de la base de datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const updateInitialBalance = async (monto: number) => {
    await databaseService.setSaldoInicial(monto);
    await refreshData();
  };

  const saveTransaction = async (data: {
    id?: number;
    monto: number;
    tipo: TransactionType;
    categoria_id: number;
    fecha: string;
    descripcion: string;
  }) => {
    if (data.id) {
      await databaseService.updateTransaction(data.id, data);
    } else {
      await databaseService.createTransaction(data);
    }
    await refreshData();
  };

  const deleteTransaction = async (id: number) => {
    await databaseService.deleteTransaction(id);
    await refreshData();
  };

  const saveCategory = async (data: {
    id?: number;
    nombre: string;
    tipo: CategoryType;
    icono: string;
    color: string;
  }) => {
    if (data.id) {
      await databaseService.updateCategory(data.id, {
        nombre: data.nombre,
        tipo: data.tipo,
        icono: data.icono,
        color: data.color,
      });
    } else {
      await databaseService.createCategory({
        nombre: data.nombre,
        tipo: data.tipo,
        icono: data.icono,
        color: data.color,
      });
    }
    await refreshData();
  };

  const deleteCategory = async (id: number) => {
    const res = await databaseService.deleteCategory(id);
    if (res.success) {
      await refreshData();
    }
    return res;
  };

  const loadDemoData = async () => {
    setIsLoading(true);
    try {
      await databaseService.seedDemoData();
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  const resetDatabase = async () => {
    setIsLoading(true);
    try {
      await databaseService.resetDatabase();
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  // Controladores de modales
  const openTransactionModal = (tx: Transaction | null = null, defaultType: TransactionType = 'gasto') => {
    setEditingTransaction(tx);
    setDefaultTransactionType(tx ? tx.tipo : defaultType);
    setIsTransactionModalVisible(true);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalVisible(false);
    setEditingTransaction(null);
  };

  const openInitialBalanceModal = () => {
    setIsInitialBalanceModalVisible(true);
  };

  const closeInitialBalanceModal = () => {
    setIsInitialBalanceModalVisible(false);
  };

  const openCategoryModal = (cat: Category | null = null) => {
    setEditingCategory(cat);
    setIsCategoryModalVisible(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalVisible(false);
    setEditingCategory(null);
  };

  return (
    <AppContext.Provider
      value={{
        isLoading,
        activeTab,
        setActiveTab,
        summary,
        categories,
        transactions,
        refreshData,
        updateInitialBalance,
        saveTransaction,
        deleteTransaction,
        saveCategory,
        deleteCategory,
        loadDemoData,
        resetDatabase,
        isTransactionModalVisible,
        editingTransaction,
        defaultTransactionType,
        openTransactionModal,
        closeTransactionModal,
        isInitialBalanceModalVisible,
        openInitialBalanceModal,
        closeInitialBalanceModal,
        isCategoryModalVisible,
        editingCategory,
        openCategoryModal,
        closeCategoryModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};

