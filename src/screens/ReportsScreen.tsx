import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { databaseService } from '../services/database/databaseService';
import { PeriodReport } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { getCurrentMonthAndYear } from '../utils/dateUtils';

type ReportTab = 'categories' | 'weeks';

export const ReportsScreen: React.FC = () => {
  const { transactions, refreshData } = useApp();

  const [dateState, setDateState] = useState(getCurrentMonthAndYear());
  const [reportTab, setReportTab] = useState<ReportTab>('categories');
  const [loading, setLoading] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState<PeriodReport | null>(null);
  const [weeklyBreakdown, setWeeklyBreakdown] = useState<
    { semanaNumero: number; etiqueta: string; startDate: string; endDate: string; totalGastos: number; totalIngresos: number }[]
  >([]);

  const fetchReports = async (year: number, month: number) => {
    setLoading(true);
    try {
      const [mReport, wReport] = await Promise.all([
        databaseService.getMonthlyReport(year, month),
        databaseService.getWeeklyBreakdown(year, month),
      ]);
      setMonthlyReport(mReport);
      setWeeklyBreakdown(wReport);
    } catch (e) {
      console.error('Error al cargar informes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(dateState.year, dateState.month);
  }, [dateState, transactions]);

  const handlePrevMonth = () => {
    setDateState((prev) => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setDateState((prev) => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Informes"
        subtitle="Análisis semanal y mensual de gastos"
      />

      {/* Selector de Mes */}
      <View style={styles.monthSelectorBar}>
        <TouchableOpacity style={styles.arrowBtn} onPress={handlePrevMonth}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.monthDisplay}>
          <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#2563EB" />
          <Text style={styles.monthText}>
            {monthNames[dateState.month - 1]} {dateState.year}
          </Text>
        </View>

        <TouchableOpacity style={styles.arrowBtn} onPress={handleNextMonth}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Selector de Pestaña: Categorías vs Semanas */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tabButton, reportTab === 'categories' && styles.tabButtonActive]}
          onPress={() => setReportTab('categories')}
        >
          <MaterialCommunityIcons
            name="chart-pie"
            size={16}
            color={reportTab === 'categories' ? '#2563EB' : '#64748B'}
          />
          <Text
            style={[styles.tabButtonText, reportTab === 'categories' && styles.tabButtonTextActive]}
          >
            Por Categorías
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, reportTab === 'weeks' && styles.tabButtonActive]}
          onPress={() => setReportTab('weeks')}
        >
          <MaterialCommunityIcons
            name="chart-timeline-variant-shimmer"
            size={16}
            color={reportTab === 'weeks' ? '#2563EB' : '#64748B'}
          />
          <Text
            style={[styles.tabButtonText, reportTab === 'weeks' && styles.tabButtonTextActive]}
          >
            Por Semanas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Resumen del Período */}
        {monthlyReport ? (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Balance de {monthlyReport.periodo}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryColLabel}>Total Gastos</Text>
                <Text style={[styles.summaryColValue, { color: '#EF4444' }]}>
                  {formatCurrency(monthlyReport.totalGastos)}
                </Text>
              </View>

              <View style={styles.summaryCol}>
                <Text style={styles.summaryColLabel}>Total Ingresos</Text>
                <Text style={[styles.summaryColValue, { color: '#10B981' }]}>
                  {formatCurrency(monthlyReport.totalIngresos)}
                </Text>
              </View>

              <View style={styles.summaryCol}>
                <Text style={styles.summaryColLabel}>Ahorro Neto</Text>
                <Text
                  style={[
                    styles.summaryColValue,
                    monthlyReport.balance >= 0 ? { color: '#0F172A' } : { color: '#EF4444' },
                  ]}
                >
                  {formatCurrency(monthlyReport.balance)}
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Calculando métricas del período...</Text>
          </View>
        ) : reportTab === 'categories' ? (
          /* ==========================================
             INFORME POR CATEGORÍAS (MENSUAL)
             ========================================== */
          <View>
            <Text style={styles.sectionHeader}>Desglose de Gastos por Categoría</Text>

            {!monthlyReport || monthlyReport.categorias.length === 0 ? (
              <Card style={styles.emptyCard}>
                <MaterialCommunityIcons name="chart-pie" size={44} color="#94A3B8" />
                <Text style={styles.emptyTitle}>Sin gastos en este mes</Text>
                <Text style={styles.emptySubtitle}>
                  No hay gastos registrados en {monthNames[dateState.month - 1]} {dateState.year}.
                </Text>
              </Card>
            ) : (
              monthlyReport.categorias.map((cat, index) => {
                const iconName = (cat.categoriaIcono as keyof typeof MaterialCommunityIcons.glyphMap) || 'tag';
                const isTop = index === 0;

                return (
                  <Card key={cat.categoriaId} style={styles.categoryCard}>
                    <View style={styles.catCardHeader}>
                      <View style={styles.catLeftRow}>
                        <View style={[styles.catIconCircle, { backgroundColor: cat.categoriaColor }]}>
                          <MaterialCommunityIcons name={iconName} size={18} color="#FFFFFF" />
                        </View>
                        <View>
                          <View style={styles.catNameWithBadge}>
                            <Text style={styles.catName}>{cat.categoriaNombre}</Text>
                            {isTop ? (
                              <View style={styles.topBadge}>
                                <Text style={styles.topBadgeText}>Mayor Gasto</Text>
                              </View>
                            ) : null}
                          </View>
                          <Text style={styles.catTxCount}>
                            {cat.cantidadTransacciones} movimiento{cat.cantidadTransacciones !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.catRightCol}>
                        <Text style={styles.catSpent}>{formatCurrency(cat.totalGastado)}</Text>
                        <Text style={styles.catPercent}>{formatPercentage(cat.porcentaje)}</Text>
                      </View>
                    </View>

                    {/* Barra de progreso */}
                    <ProgressBar
                      progress={cat.porcentaje}
                      color={cat.categoriaColor}
                      height={8}
                      style={styles.progressBar}
                    />
                  </Card>
                );
              })
            )}
          </View>
        ) : (
          /* ==========================================
             INFORME POR SEMANAS (SEMANAL)
             ========================================== */
          <View>
            <Text style={styles.sectionHeader}>Evolución Semanal del Mes</Text>

            {weeklyBreakdown.map((week) => {
              const weekTotal = week.totalGastos;
              const hasActivity = week.totalGastos > 0 || week.totalIngresos > 0;

              return (
                <Card key={week.semanaNumero} style={styles.weekCard}>
                  <View style={styles.weekHeader}>
                    <View style={styles.weekIconBadge}>
                      <MaterialCommunityIcons name="calendar-week" size={18} color="#2563EB" />
                    </View>
                    <View style={styles.weekInfo}>
                      <Text style={styles.weekTitle}>Semana {week.semanaNumero}</Text>
                      <Text style={styles.weekDates}>{week.etiqueta.split('(')[1]?.replace(')', '') || ''}</Text>
                    </View>
                    <View style={styles.weekBalanceCol}>
                      <Text style={styles.weekTotalGastos}>
                        Gastos: {formatCurrency(week.totalGastos)}
                      </Text>
                      <Text style={styles.weekTotalIngresos}>
                        Ingresos: +{formatCurrency(week.totalIngresos)}
                      </Text>
                    </View>
                  </View>

                  {monthlyReport && monthlyReport.totalGastos > 0 ? (
                    <View style={styles.weekProgressRow}>
                      <ProgressBar
                        progress={(week.totalGastos / monthlyReport.totalGastos) * 100}
                        color="#EF4444"
                        height={6}
                      />
                      <Text style={styles.weekProgressLabel}>
                        {formatPercentage((week.totalGastos / monthlyReport.totalGastos) * 100)} del total del mes
                      </Text>
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  monthSelectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    marginBottom: 20,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCol: {
    alignItems: 'center',
    flex: 1,
  },
  summaryColLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  summaryColValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 36,
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
    marginTop: 4,
  },
  categoryCard: {
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
  },
  catCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  catLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  catIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catNameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  topBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  topBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  catTxCount: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  catRightCol: {
    alignItems: 'flex-end',
  },
  catSpent: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  catPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  progressBar: {
    marginTop: 4,
  },
  weekCard: {
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  weekInfo: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  weekDates: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  weekBalanceCol: {
    alignItems: 'flex-end',
  },
  weekTotalGastos: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  weekTotalIngresos: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 2,
  },
  weekProgressRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  weekProgressLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'right',
  },
});

