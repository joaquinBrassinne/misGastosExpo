import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { formatDateFriendly } from '../utils/dateUtils';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const isIncome = transaction.tipo === 'ingreso';
  const categoryColor = transaction.categoria_color || (isIncome ? '#10B981' : '#EF4444');
  const categoryIcon = (transaction.categoria_icono as keyof typeof MaterialCommunityIcons.glyphMap) || 'cash';

  return (
    <View style={styles.container}>
      {/* Icono de Categoría */}
      <View style={[styles.iconWrapper, { backgroundColor: `${categoryColor}15` }]}>
        <MaterialCommunityIcons name={categoryIcon} size={22} color={categoryColor} />
      </View>

      {/* Información del Movimiento */}
      <View style={styles.infoWrapper}>
        <Text style={styles.categoryName} numberOfLines={1}>
          {transaction.categoria_nombre || (isIncome ? 'Ingreso' : 'Gasto')}
        </Text>
        {transaction.descripcion ? (
          <Text style={styles.description} numberOfLines={1}>
            {transaction.descripcion}
          </Text>
        ) : null}
        <Text style={styles.date}>{formatDateFriendly(transaction.fecha)}</Text>
      </View>

      {/* Monto y Acciones */}
      <View style={styles.rightWrapper}>
        <Text style={[styles.amount, isIncome ? styles.incomeAmount : styles.expenseAmount]}>
          {isIncome ? '+' : '-'} {formatCurrency(transaction.monto)}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEdit(transaction)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="pencil-outline" size={18} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onDelete(transaction)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  description: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  date: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  rightWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  incomeAmount: {
    color: '#10B981',
  },
  expenseAmount: {
    color: '#EF4444',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  actionBtn: {
    padding: 3,
  },
});

