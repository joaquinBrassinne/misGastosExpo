import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { TransactionType, Category } from '../types';
import { Button } from './Button';
import { getTodayIsoDate } from '../utils/dateUtils';

export const TransactionModal: React.FC = () => {
  const {
    isTransactionModalVisible,
    closeTransactionModal,
    editingTransaction,
    defaultTransactionType,
    categories,
    saveTransaction,
    openCategoryModal,
  } = useApp();

  const [tipo, setTipo] = useState<TransactionType>('gasto');
  const [montoStr, setMontoStr] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(getTodayIsoDate());
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isTransactionModalVisible) {
      if (editingTransaction) {
        setTipo(editingTransaction.tipo);
        setMontoStr(editingTransaction.monto.toString());
        setCategoriaId(editingTransaction.categoria_id);
        setFecha(editingTransaction.fecha);
        setDescripcion(editingTransaction.descripcion || '');
      } else {
        setTipo(defaultTransactionType);
        setMontoStr('');
        setFecha(getTodayIsoDate());
        setDescripcion('');
        // Seleccionar automáticamente la primera categoría correspondiente al tipo
        const matchingCats = categories.filter((c) => c.tipo === defaultTransactionType || c.tipo === 'ambos');
        setCategoriaId(matchingCats.length > 0 ? matchingCats[0].id : null);
      }
      setError(null);
    }
  }, [isTransactionModalVisible, editingTransaction, defaultTransactionType, categories]);

  // Si cambia el tipo (gasto <-> ingreso), verificar si la categoría seleccionada sigue siendo válida
  const handleTypeChange = (newTipo: TransactionType) => {
    setTipo(newTipo);
    const matchingCats = categories.filter((c) => c.tipo === newTipo || c.tipo === 'ambos');
    const isValid = matchingCats.some((c) => c.id === categoriaId);
    if (!isValid && matchingCats.length > 0) {
      setCategoriaId(matchingCats[0].id);
    }
  };

  const filteredCategories = categories.filter(
    (c) => c.tipo === tipo || c.tipo === 'ambos'
  );

  const handleSubmit = async () => {
    const parsedMonto = parseFloat(montoStr.replace(',', '.'));
    if (isNaN(parsedMonto) || parsedMonto <= 0) {
      setError('Por favor ingresá un monto numérico mayor a cero.');
      return;
    }

    if (!categoriaId) {
      setError('Por favor seleccioná una categoría.');
      return;
    }

    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      setError('Por favor ingresá una fecha válida con formato AAAA-MM-DD.');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveTransaction({
        id: editingTransaction ? editingTransaction.id : undefined,
        monto: parsedMonto,
        tipo,
        categoria_id: categoriaId,
        fecha,
        descripcion,
      });
      closeTransactionModal();
    } catch (e: any) {
      setError(e?.message || 'Error al guardar el movimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isTransactionModalVisible}
      transparent
      animationType="slide"
      onRequestClose={closeTransactionModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingTransaction ? 'Editar Movimiento' : 'Nuevo Movimiento'}
            </Text>
            <TouchableOpacity onPress={closeTransactionModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Toggle Ingreso / Gasto */}
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeButton, tipo === 'gasto' && styles.typeButtonExpenseActive]}
                onPress={() => handleTypeChange('gasto')}
              >
                <MaterialCommunityIcons
                  name="arrow-down-bold-circle-outline"
                  size={18}
                  color={tipo === 'gasto' ? '#EF4444' : '#64748B'}
                />
                <Text style={[styles.typeButtonText, tipo === 'gasto' && styles.typeButtonExpenseText]}>
                  Gasto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, tipo === 'ingreso' && styles.typeButtonIncomeActive]}
                onPress={() => handleTypeChange('ingreso')}
              >
                <MaterialCommunityIcons
                  name="arrow-up-bold-circle-outline"
                  size={18}
                  color={tipo === 'ingreso' ? '#10B981' : '#64748B'}
                />
                <Text style={[styles.typeButtonText, tipo === 'ingreso' && styles.typeButtonIncomeText]}>
                  Ingreso
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Monto */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Monto ($)</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={[styles.amountPrefix, tipo === 'ingreso' ? styles.incomeColor : styles.expenseColor]}>
                  {tipo === 'ingreso' ? '+' : '-'} $
                </Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={montoStr}
                  onChangeText={(val) => {
                    setMontoStr(val);
                    if (error) setError(null);
                  }}
                />
              </View>
            </View>

            {/* Selector de Categorías */}
            <View style={styles.fieldGroup}>
              <View style={styles.categoryHeader}>
                <Text style={styles.label}>Categoría</Text>
                <TouchableOpacity
                  onPress={() => {
                    closeTransactionModal();
                    openCategoryModal(null);
                  }}
                >
                  <Text style={styles.newCatLink}>+ Nueva categoría</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryChipsContainer}
              >
                {filteredCategories.map((cat) => {
                  const isSelected = categoriaId === cat.id;
                  const iconName = (cat.icono as keyof typeof MaterialCommunityIcons.glyphMap) || 'tag';
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catChip,
                        isSelected && { borderColor: cat.color, backgroundColor: `${cat.color}15` },
                      ]}
                      onPress={() => setCategoriaId(cat.id)}
                    >
                      <View style={[styles.catIconCircle, { backgroundColor: cat.color }]}>
                        <MaterialCommunityIcons name={iconName} size={16} color="#FFFFFF" />
                      </View>
                      <Text
                        style={[
                          styles.catChipText,
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

            {/* Selector de Fecha */}
            <View style={styles.fieldGroup}>
              <View style={styles.dateHeader}>
                <Text style={styles.label}>Fecha (AAAA-MM-DD)</Text>
                <View style={styles.quickDates}>
                  <TouchableOpacity
                    style={styles.quickDateBtn}
                    onPress={() => setFecha(getTodayIsoDate())}
                  >
                    <Text style={styles.quickDateText}>Hoy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickDateBtn}
                    onPress={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 1);
                      const m = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      setFecha(`${d.getFullYear()}-${m}-${day}`);
                    }}
                  >
                    <Text style={styles.quickDateText}>Ayer</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="2026-10-31"
                value={fecha}
                onChangeText={setFecha}
              />
            </View>

            {/* Descripción (Opcional) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Descripción o Nota (Opcional)</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Ej. Supermercado, Alquiler, Sueldo..."
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={2}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeTransactionModal}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <Button
              title={editingTransaction ? 'Guardar Cambios' : 'Registrar'}
              icon="check"
              onPress={handleSubmit}
              loading={isSubmitting}
              variant={tipo === 'ingreso' ? 'success' : 'primary'}
              style={styles.submitBtn}
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
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  typeButtonExpenseActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeButtonIncomeActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  typeButtonExpenseText: {
    color: '#EF4444',
  },
  typeButtonIncomeText: {
    color: '#10B981',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
  },
  amountPrefix: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 10,
  },
  expenseColor: {
    color: '#EF4444',
  },
  incomeColor: {
    color: '#10B981',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  newCatLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  categoryChipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  catIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickDates: {
    flexDirection: 'row',
    gap: 6,
  },
  quickDateBtn: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  quickDateText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  submitBtn: {
    flex: 1.5,
  },
});

