import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { Category, CategoryType } from '../types';
import { formatCurrency } from '../utils/formatters';

export const CategoriesScreen: React.FC = () => {
  const {
    categories,
    transactions,
    summary,
    openCategoryModal,
    openInitialBalanceModal,
    deleteCategory,
    loadDemoData,
    resetDatabase,
  } = useApp();

  const [filterType, setFilterType] = useState<CategoryType>('gasto');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isResetConfirmVisible, setIsResetConfirmVisible] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const filteredCategories = categories.filter(
    (c) => c.tipo === filterType || c.tipo === 'ambos'
  );

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      const res = await deleteCategory(categoryToDelete.id);
      if (!res.success) {
        setFeedbackError(res.error || 'No se pudo eliminar la categoría.');
      }
      setCategoryToDelete(null);
    }
  };

  const handleResetConfirm = async () => {
    setIsResetConfirmVisible(false);
    await resetDatabase();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Categorías y Ajustes"
        subtitle="Gestión de categorías y SQLite"
        rightAction={{
          icon: 'plus',
          label: 'Categoría',
          onPress: () => openCategoryModal(null),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {feedbackError ? (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.errorBannerText}>{feedbackError}</Text>
            <TouchableOpacity onPress={() => setFeedbackError(null)}>
              <MaterialCommunityIcons name="close" size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Sección 1: Gestión de Categorías */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Categorías Relacionales</Text>
            <TouchableOpacity onPress={() => openCategoryModal(null)}>
              <Text style={styles.addCategoryLink}>+ Nueva</Text>
            </TouchableOpacity>
          </View>

          {/* Toggle de Tipo */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeBtn, filterType === 'gasto' && styles.typeBtnActive]}
              onPress={() => setFilterType('gasto')}
            >
              <Text style={[styles.typeBtnText, filterType === 'gasto' && styles.typeBtnTextActive]}>
                Gastos ({categories.filter((c) => c.tipo === 'gasto' || c.tipo === 'ambos').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, filterType === 'ingreso' && styles.typeBtnActive]}
              onPress={() => setFilterType('ingreso')}
            >
              <Text style={[styles.typeBtnText, filterType === 'ingreso' && styles.typeBtnTextActive]}>
                Ingresos ({categories.filter((c) => c.tipo === 'ingreso' || c.tipo === 'ambos').length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lista de Categorías */}
          <View style={styles.categoryList}>
            {filteredCategories.map((cat) => {
              const iconName = (cat.icono as keyof typeof MaterialCommunityIcons.glyphMap) || 'tag';
              const isSystem = cat.es_sistema === 1;

              return (
                <View key={cat.id} style={styles.categoryItem}>
                  <View style={[styles.catIconCircle, { backgroundColor: cat.color }]}>
                    <MaterialCommunityIcons name={iconName} size={20} color="#FFFFFF" />
                  </View>

                  <View style={styles.catInfo}>
                    <Text style={styles.catName}>{cat.nombre}</Text>
                    <Text style={styles.catBadge}>
                      {isSystem ? 'Predeterminada del sistema' : 'Personalizada'}
                    </Text>
                  </View>

                  <View style={styles.catActions}>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => openCategoryModal(cat)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialCommunityIcons name="pencil-outline" size={18} color="#64748B" />
                    </TouchableOpacity>

                    {!isSystem ? (
                      <TouchableOpacity
                        style={styles.actionIconBtn}
                        onPress={() => setCategoryToDelete(cat)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Sección 2: Ajustes y Configuración de Saldo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración de Cuenta</Text>

          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialCommunityIcons name="wallet-outline" size={22} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Saldo Inicial</Text>
                  <Text style={styles.settingSubLabel}>
                    Valor actual: {formatCurrency(summary.saldoInicial)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.changeBalanceBtn}
                onPress={openInitialBalanceModal}
              >
                <Text style={styles.changeBalanceBtnText}>Modificar</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Sección 3: Información de la Base de Datos SQLite */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de la Base de Datos</Text>

          <Card style={styles.dbInfoCard}>
            <View style={styles.dbInfoRow}>
              <Text style={styles.dbInfoKey}>Motor SQLite:</Text>
              <Text style={styles.dbInfoVal}>
                {Platform.OS === 'web' ? 'sql.js (En Memoria Web)' : 'expo-sqlite (Nativo Android)'}
              </Text>
            </View>

            <View style={styles.dbInfoRow}>
              <Text style={styles.dbInfoKey}>Tablas relacionales:</Text>
              <Text style={styles.dbInfoVal}>movimientos, categorias, config</Text>
            </View>

            <View style={styles.dbInfoRow}>
              <Text style={styles.dbInfoKey}>Total movimientos:</Text>
              <Text style={styles.dbInfoVal}>{transactions.length}</Text>
            </View>

            <View style={styles.dbInfoRow}>
              <Text style={styles.dbInfoKey}>Total categorías:</Text>
              <Text style={styles.dbInfoVal}>{categories.length}</Text>
            </View>
          </Card>
        </View>

        {/* Sección 4: Utilidades de Demostración y Pruebas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones de Demostración</Text>

          <View style={styles.demoButtonsContainer}>
            <Button
              title="Cargar Datos de Demostración"
              icon="database-arrow-down"
              variant="outline"
              onPress={loadDemoData}
              style={{ marginBottom: 12 }}
            />

            <Button
              title="Reiniciar Base de Datos"
              icon="database-refresh"
              variant="danger"
              onPress={() => setIsResetConfirmVisible(true)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal de Confirmación de Borrado de Categoría */}
      <ConfirmModal
        visible={!!categoryToDelete}
        title="¿Eliminar categoría?"
        message={`¿Estás seguro de que deseás eliminar la categoría "${categoryToDelete?.nombre}"?`}
        confirmText="Eliminar"
        isDestructive
        onConfirm={handleDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />

      {/* Modal de Confirmación de Reinicio */}
      <ConfirmModal
        visible={isResetConfirmVisible}
        title="¿Reiniciar Base de Datos?"
        message="Se eliminarán todos los movimientos y categorías personalizadas, restableciendo las tablas de SQLite a su estado original de fábrica."
        confirmText="Reiniciar Todo"
        isDestructive
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetConfirmVisible(false)}
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
    paddingBottom: 40,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  addCategoryLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  typeBtnActive: {
    backgroundColor: '#EFF6FF',
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
  categoryList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  catIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  catInfo: {
    flex: 1,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  catBadge: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  catActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIconBtn: {
    padding: 4,
  },
  settingCard: {
    borderRadius: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingSubLabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  changeBalanceBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  changeBalanceBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  dbInfoCard: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  dbInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dbInfoKey: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  dbInfoVal: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  demoButtonsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
});

