import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { TransactionItem } from '../components/TransactionItem';
import { ConfirmModal } from '../components/ConfirmModal';
import { formatCurrency } from '../utils/formatters';
import { Transaction } from '../types';

export const HomeScreen: React.FC = () => {
  const {
    summary,
    transactions,
    refreshData,
    openTransactionModal,
    openInitialBalanceModal,
    setActiveTab,
    deleteTransaction,
    loadDemoData,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const recentTransactions = transactions.slice(0, 5);
  const isPositive = summary.saldoActual >= 0;

  const handleDeleteConfirm = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Gastos Personales"
        subtitle="Control financiero en SQLite"
        rightAction={{
          icon: 'wallet-outline',
          label: 'Saldo Inicial',
          onPress: openInitialBalanceModal,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {/* Tarjeta Principal de Saldo Actual */}
        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>SALDO TOTAL ACTUAL</Text>
            <TouchableOpacity
              style={styles.adjustBalanceBadge}
              onPress={openInitialBalanceModal}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="pencil-outline" size={13} color="#2563EB" />
              <Text style={styles.adjustBalanceText}>Ajustar inicial</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.balanceAmount, isPositive ? styles.positiveText : styles.negativeText]}>
            {formatCurrency(summary.saldoActual)}
          </Text>

          {/* Desglose: Saldo Inicial, Ingresos, Gastos */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <MaterialCommunityIcons name="wallet" size={14} color="#64748B" />
                <Text style={styles.metricLabel}>Inicial</Text>
              </View>
              <Text style={styles.metricValue}>{formatCurrency(summary.saldoInicial)}</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <MaterialCommunityIcons name="arrow-up-circle" size={14} color="#10B981" />
                <Text style={[styles.metricLabel, { color: '#10B981' }]}>Ingresos</Text>
              </View>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>
                +{formatCurrency(summary.totalIngresos)}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <MaterialCommunityIcons name="arrow-down-circle" size={14} color="#EF4444" />
                <Text style={[styles.metricLabel, { color: '#EF4444' }]}>Gastos</Text>
              </View>
              <Text style={[styles.metricValue, { color: '#EF4444' }]}>
                -{formatCurrency(summary.totalGastos)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Botones de Acción Rápida */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickActionBtn, styles.expenseActionBtn]}
            onPress={() => openTransactionModal(null, 'gasto')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIconCircle, { backgroundColor: '#FEE2E2' }]}>
              <MaterialCommunityIcons name="arrow-down-bold" size={20} color="#EF4444" />
            </View>
            <Text style={styles.quickActionBtnTitle}>Nuevo Gasto</Text>
            <Text style={styles.quickActionBtnSubtitle}>Registrar compra o pago</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, styles.incomeActionBtn]}
            onPress={() => openTransactionModal(null, 'ingreso')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIconCircle, { backgroundColor: '#D1FAE5' }]}>
              <MaterialCommunityIcons name="arrow-up-bold" size={20} color="#10B981" />
            </View>
            <Text style={styles.quickActionBtnTitle}>Nuevo Ingreso</Text>
            <Text style={styles.quickActionBtnSubtitle}>Cobro, sueldo o ventas</Text>
          </TouchableOpacity>
        </View>

        {/* Sección: Últimos Movimientos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
          {transactions.length > 0 ? (
            <TouchableOpacity onPress={() => setActiveTab('transactions')}>
              <Text style={styles.seeAllLink}>Ver todos ({transactions.length})</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {transactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Sin movimientos registrados</Text>
            <Text style={styles.emptyMessage}>
              Comenzá registrando tu primer ingreso o gasto con los botones superiores, o cargá los datos de demostración.
            </Text>
            <TouchableOpacity style={styles.demoButton} onPress={loadDemoData}>
              <MaterialCommunityIcons name="database-arrow-down" size={18} color="#2563EB" />
              <Text style={styles.demoButtonText}>Cargar Datos de Demostración</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          recentTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onEdit={(item) => openTransactionModal(item)}
              onDelete={(item) => setTransactionToDelete(item)}
            />
          ))
        )}
      </ScrollView>

      {/* Modal de Confirmación de Borrado */}
      <ConfirmModal
        visible={!!transactionToDelete}
        title="¿Eliminar movimiento?"
        message={`¿Estás seguro de que deseás eliminar este movimiento de ${formatCurrency(
          transactionToDelete?.monto ?? 0
        )}? Esta acción no se puede deshacer.`}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  adjustBalanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  adjustBalanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  positiveText: {
    color: '#0F172A',
  },
  negativeText: {
    color: '#DC2626',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  expenseActionBtn: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  incomeActionBtn: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  quickActionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickActionBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickActionBtnSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptyMessage: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 16,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  demoButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
});

