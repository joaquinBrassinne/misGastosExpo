import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Button } from './Button';
import { formatCurrency } from '../utils/formatters';

export const InitialBalanceModal: React.FC = () => {
  const { isInitialBalanceModalVisible, closeInitialBalanceModal, summary, updateInitialBalance } =
    useApp();
  const [amountStr, setAmountStr] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isInitialBalanceModalVisible) {
      setAmountStr(summary.saldoInicial > 0 ? summary.saldoInicial.toString() : '');
      setError(null);
    }
  }, [isInitialBalanceModalVisible, summary.saldoInicial]);

  const handleSave = async () => {
    const parsed = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(parsed) || parsed < 0) {
      setError('Por favor ingresá un monto numérico válido mayor o igual a 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateInitialBalance(parsed);
      closeInitialBalanceModal();
    } catch {
      setError('Ocurrió un error al guardar el saldo inicial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isInitialBalanceModalVisible}
      transparent
      animationType="slide"
      onRequestClose={closeInitialBalanceModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.content}>
          {/* Encabezado */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="wallet-outline" size={24} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.title}>Saldo Inicial</Text>
                <Text style={styles.subtitle}>Punto de partida de tu cuenta</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={closeInitialBalanceModal}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Información actual */}
          <View style={styles.currentInfoBox}>
            <Text style={styles.currentLabel}>Saldo Inicial Actual:</Text>
            <Text style={styles.currentValue}>{formatCurrency(summary.saldoInicial)}</Text>
          </View>

          {/* Campo de entrada */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nuevo Saldo Inicial ($)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={amountStr}
                onChangeText={(text) => {
                  setAmountStr(text);
                  if (error) setError(null);
                }}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeInitialBalanceModal}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <Button
              title="Guardar Saldo"
              icon="check"
              onPress={handleSave}
              loading={isSubmitting}
              style={styles.saveBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  currentInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  currentLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  currentValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  saveBtn: {
    flex: 1.3,
  },
});

