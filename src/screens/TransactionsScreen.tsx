import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { TransactionItem } from '../components/TransactionItem';
import { ConfirmModal } from '../components/ConfirmModal';
import { Card } from '../components/Card';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils/formatters';

export const TransactionsScreen: React.FC = () => {
  const {
    transactions,
    categories,
    refreshData,
    openTransactionModal,
    deleteTransaction,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Filtro de tipo
      if (selectedType !== 'all' && t.tipo !== selectedType) {
        return false;
      }
      // Filtro de categoría
      if (selectedCatId !== null && t.categoria_id !== selectedCatId) {
        return false;
      }
      // Filtro de texto de búsqueda
      if (search.trim().length > 0) {
        const query = search.toLowerCase();
        const matchDesc = t.descripcion?.toLowerCase().includes(query);
        const matchCat = t.categoria_nombre?.toLowerCase().includes(query);
        if (!matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [transactions, selectedType, selectedCatId, search]);

  const totalFiltered = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      return curr.tipo === 'ingreso' ? acc + curr.monto : acc - curr.monto;
    }, 0);
  }, [filteredTransactions]);

  const handleDeleteConfirm = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Movimientos"
        subtitle="Historial y registros en SQLite"
        rightAction={{
          icon: 'plus',
          label: 'Nuevo',
          onPress: () => openTransactionModal(null, selectedType === 'ingreso' ? 'ingreso' : 'gasto'),
        }}
      />

      {/* Barra de Búsqueda y Filtros */}
      <View style={styles.filtersSection}>
        {/* Buscador */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por descripción o categoría..."
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Chips de Tipo: Todos / Gastos / Ingresos */}
        <View style={styles.typeChipsRow}>
          <TouchableOpacity
            style={[styles.typeChip, selectedType === 'all' && styles.typeChipActive]}
            onPress={() => setSelectedType('all')}
          >
            <Text style={[styles.typeChipText, selectedType === 'all' && styles.typeChipTextActive]}>
              Todos ({transactions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeChip, selectedType === 'gasto' && styles.typeChipExpenseActive]}
            onPress={() => setSelectedType('gasto')}
          >
            <MaterialCommunityIcons
              name="arrow-down-circle"
              size={14}
              color={selectedType === 'gasto' ? '#EF4444' : '#64748B'}
            />
            <Text
              style={[
                styles.typeChipText,
                selectedType === 'gasto' && styles.typeChipExpenseTextActive,
              ]}
            >
              Gastos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeChip, selectedType === 'ingreso' && styles.typeChipIncomeActive]}
            onPress={() => setSelectedType('ingreso')}
          >
            <MaterialCommunityIcons
              name="arrow-up-circle"
              size={14}
              color={selectedType === 'ingreso' ? '#10B981' : '#64748B'}
            />
            <Text
              style={[
                styles.typeChipText,
                selectedType === 'ingreso' && styles.typeChipIncomeTextActive,
              ]}
            >
              Ingresos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scroll Horizontal de Categorías */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[styles.catFilterChip, selectedCatId === null && styles.catFilterChipActive]}
            onPress={() => setSelectedCatId(null)}
          >
            <Text
              style={[
                styles.catFilterText,
                selectedCatId === null && styles.catFilterTextActive,
              ]}
            >
              Todas las categorías
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const isSelected = selectedCatId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catFilterChip,
                  isSelected && { backgroundColor: `${cat.color}20`, borderColor: cat.color },
                ]}
                onPress={() => setSelectedCatId(isSelected ? null : cat.id)}
              >
                <View style={[styles.catFilterDot, { backgroundColor: cat.color }]} />
                <Text
                  style={[
                    styles.catFilterText,
                    isSelected && { color: cat.color, fontWeight: '700' },
                  ]}
                >
                  {cat.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Barra de Subtotal del filtro */}
      <View style={styles.subtotalBar}>
        <Text style={styles.subtotalCount}>
          {filteredTransactions.length} resultado{filteredTransactions.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.subtotalAmount}>
          Balance filtrado: <Text style={{ fontWeight: '700' }}>{formatCurrency(totalFiltered)}</Text>
        </Text>
      </View>

      {/* Lista de Movimientos */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {filteredTransactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons name="file-search-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No hay movimientos</Text>
            <Text style={styles.emptySubtitle}>
              No se encontraron registros con los filtros seleccionados.
            </Text>
            <TouchableOpacity
              style={styles.clearFiltersBtn}
              onPress={() => {
                setSearch('');
                setSelectedType('all');
                setSelectedCatId(null);
              }}
            >
              <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          filteredTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onEdit={(item) => openTransactionModal(item)}
              onDelete={(item) => setTransactionToDelete(item)}
            />
          ))
        )}
      </ScrollView>

      {/* Botón Flotante para Agregar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => openTransactionModal(null, 'gasto')}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal de Confirmación */}
      <ConfirmModal
        visible={!!transactionToDelete}
        title="¿Eliminar movimiento?"
        message={`¿Estás seguro de que deseás eliminar este movimiento de ${formatCurrency(
          transactionToDelete?.monto ?? 0
        )}?`}
        confirmText="Eliminar"
        isDestructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTransactionToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  filtersSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  typeChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  typeChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  typeChipExpenseActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  typeChipIncomeActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  typeChipExpenseTextActive: {
    color: '#DC2626',
  },
  typeChipIncomeTextActive: {
    color: '#059669',
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  catFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  catFilterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  catFilterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catFilterText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  catFilterTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  subtotalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
  },
  subtotalCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  subtotalAmount: {
    fontSize: 12,
    color: '#334155',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 36,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  clearFiltersBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  clearFiltersText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
});

