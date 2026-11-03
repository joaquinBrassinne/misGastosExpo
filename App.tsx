import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { BottomTabs } from './src/components/BottomTabs';
import { HomeScreen } from './src/screens/HomeScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { ReportsScreen } from './src/screens/ReportsScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { TransactionModal } from './src/components/TransactionModal';
import { CategoryModal } from './src/components/CategoryModal';
import { InitialBalanceModal } from './src/components/InitialBalanceModal';

function MainNavigator() {
  const { activeTab, setActiveTab, isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Iniciando base de datos SQLite...</Text>
      </View>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'transactions':
        return <TransactionsScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'categories':
        return <CategoriesScreen />;
      case 'home':
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screenContainer}>{renderScreen()}</View>
      <BottomTabs currentTab={activeTab} onSelectTab={setActiveTab} />

      {/* Modales Globales */}
      <TransactionModal />
      <CategoryModal />
      <InitialBalanceModal />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
});

