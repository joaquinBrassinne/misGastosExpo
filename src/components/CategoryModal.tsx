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
import { CategoryType } from '../types';
import { Button } from './Button';

const AVAILABLE_ICONS: (keyof typeof MaterialCommunityIcons.glyphMap)[] = [
  'silverware-fork-knife',
  'car',
  'home',
  'gamepad-variant',
  'heart-pulse',
  'school',
  'tshirt-crew',
  'cart',
  'dots-horizontal-circle',
  'cash-multiple',
  'laptop',
  'chart-line',
  'tag',
  'gift',
  'plus-circle',
  'coffee',
  'airplane',
  'baby-carriage',
  'dumbbell',
  'movie-open',
  'book-open-variant',
  'phone',
  'wifi',
  'lightning-bolt',
];

const AVAILABLE_COLORS = [
  '#EF4444', // Rojo
  '#F97316', // Naranja
  '#F59E0B', // Ámbar
  '#10B981', // Verde Esmeralda
  '#14B8A6', // Turquesa
  '#06B6D4', // Cian
  '#3B82F6', // Azul
  '#6366F1', // Índigo
  '#8B5CF6', // Violeta
  '#EC4899', // Rosa
  '#64748B', // Gris Pizarra
  '#0F172A', // Azul Oscuro
];

export const CategoryModal: React.FC = () => {
  const { isCategoryModalVisible, closeCategoryModal, editingCategory, saveCategory } = useApp();

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<CategoryType>('gasto');
  const [icono, setIcono] = useState<keyof typeof MaterialCommunityIcons.glyphMap>('tag');
  const [color, setColor] = useState('#3B82F6');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isCategoryModalVisible) {
      if (editingCategory) {
        setNombre(editingCategory.nombre);
        setTipo(editingCategory.tipo);
        setIcono((editingCategory.icono as keyof typeof MaterialCommunityIcons.glyphMap) || 'tag');
        setColor(editingCategory.color || '#3B82F6');
      } else {
        setNombre('');
        setTipo('gasto');
        setIcono('tag');
        setColor('#EF4444');
      }
      setError(null);
    }
  }, [isCategoryModalVisible, editingCategory]);

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('Por favor ingresá un nombre para la categoría.');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveCategory({
        id: editingCategory ? editingCategory.id : undefined,
        nombre: nombre.trim(),
        tipo,
        icono,
        color,
      });
      closeCategoryModal();
    } catch (e: any) {
      setError(e?.message || 'Error al guardar la categoría.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isCategoryModalVisible}
      transparent
      animationType="slide"
      onRequestClose={closeCategoryModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </Text>
            <TouchableOpacity onPress={closeCategoryModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Vista previa en tiempo real */}
            <View style={styles.previewContainer}>
              <View style={[styles.previewIcon, { backgroundColor: color }]}>
                <MaterialCommunityIcons name={icono} size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.previewText}>{nombre.trim() || 'Nombre de categoría'}</Text>
            </View>

            {/* Tipo de categoría */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Aplica a</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.typeBtn, tipo === 'gasto' && styles.typeBtnActive]}
                  onPress={() => setTipo('gasto')}
                >
                  <Text style={[styles.typeBtnText, tipo === 'gasto' && styles.typeBtnTextActive]}>
                    Gastos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeBtn, tipo === 'ingreso' && styles.typeBtnActive]}
                  onPress={() => setTipo('ingreso')}
                >
                  <Text style={[styles.typeBtnText, tipo === 'ingreso' && styles.typeBtnTextActive]}>
                    Ingresos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeBtn, tipo === 'ambos' && styles.typeBtnActive]}
                  onPress={() => setTipo('ambos')}
                >
                  <Text style={[styles.typeBtnText, tipo === 'ambos' && styles.typeBtnTextActive]}>
                    Ambos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Nombre */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre de la Categoría</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Gimnasio, Mascotas..."
                value={nombre}
                onChangeText={(val) => {
                  setNombre(val);
                  if (error) setError(null);
                }}
              />
            </View>

            {/* Selección de Color */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Color identificador</Text>
              <View style={styles.colorPalette}>
                {AVAILABLE_COLORS.map((c) => {
                  const isSelected = color === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.colorCircle, { backgroundColor: c }]}
                      onPress={() => setColor(c)}
                    >
                      {isSelected ? (
                        <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Selección de Icono */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Icono representativo</Text>
              <View style={styles.iconGrid}>
                {AVAILABLE_ICONS.map((iconName) => {
                  const isSelected = icono === iconName;
                  return (
                    <TouchableOpacity
                      key={iconName}
                      style={[
                        styles.iconOption,
                        isSelected && { borderColor: color, backgroundColor: `${color}15` },
                      ]}
                      onPress={() => setIcono(iconName)}
                    >
                      <MaterialCommunityIcons
                        name={iconName}
                        size={22}
                        color={isSelected ? color : '#64748B'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeCategoryModal}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <Button
              title={editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
              icon="check"
              onPress={handleSubmit}
              loading={isSubmitting}
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
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  typeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  typeBtnTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
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

