import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TabScreen } from '../context/AppContext';

interface BottomTabsProps {
  currentTab: TabScreen;
  onSelectTab: (tab: TabScreen) => void;
}

interface TabConfig {
  key: TabScreen;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  activeIcon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const TABS: TabConfig[] = [
  {
    key: 'home',
    label: 'Inicio',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    key: 'transactions',
    label: 'Movimientos',
    icon: 'swap-horizontal',
    activeIcon: 'swap-horizontal-bold',
  },
  {
    key: 'reports',
    label: 'Informes',
    icon: 'chart-box-outline',
    activeIcon: 'chart-box',
  },
  {
    key: 'categories',
    label: 'Categorías',
    icon: 'shape-outline',
    activeIcon: 'shape',
  },
];

export const BottomTabs: React.FC<BottomTabsProps> = ({ currentTab, onSelectTab }) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
              <MaterialCommunityIcons
                name={isActive ? tab.activeIcon : tab.icon}
                size={24}
                color={isActive ? '#2563EB' : '#94A3B8'}
              />
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activeIconWrapper: {
    backgroundColor: '#EFF6FF',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  activeLabel: {
    color: '#2563EB',
    fontWeight: '700',
  },
});

