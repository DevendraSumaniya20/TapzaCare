import type { ComponentType } from 'react';
import { StatusBar } from 'react-native';
import {
  BottomTabBar,
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { OfflineBanner } from '../components/OfflineBanner';
import { getIcon } from '../constants/icons';
import { useConfig } from '../hooks/useConfig';
import { useTheme } from '../hooks/useTheme';
import { BookingScreen } from '../screens/BookingScreen';
import { BookingsScreen } from '../screens/BookingsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PrescriptionDetailScreen } from '../screens/PrescriptionDetailScreen';
import { PrescriptionsScreen } from '../screens/PrescriptionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { TabScreen } from '../types/api';
import { haptics } from '../utils/haptics';
import type { RootStackParamList } from './types';

// The config names a screen; this is the only place that name meets a component.
const SCREENS: Record<TabScreen, ComponentType> = {
  home: HomeScreen,
  bookings: BookingsScreen,
  prescriptions: PrescriptionsScreen,
  profile: ProfileScreen,
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

// The banner is part of the tab bar's layout, so it pushes screen content up instead of covering it.
const renderTabBar = (props: BottomTabBarProps) => (
  <>
    <OfflineBanner />
    <BottomTabBar {...props} />
  </>
);

const renderTabIcon = (name: string) => {
  const Icon = getIcon(name);
  return ({ color, size }: { color: string; size: number }) => (
    <Icon color={color} size={size} />
  );
};

/** The bottom tabs, built from the remote config. */
function Tabs() {
  const { config } = useConfig();
  const { colors, fontSize } = useTheme();

  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenListeners={{ tabPress: haptics.select }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: fontSize.caption },
      }}
    >
      {config.tabs.map(tab => (
        <Tab.Screen
          key={tab.id}
          name={tab.id}
          component={SCREENS[tab.screen]}
          options={{ title: tab.label, tabBarIcon: renderTabIcon(tab.icon) }}
        />
      ))}
    </Tab.Navigator>
  );
}

/** Tabs at the root, with full-screen flows (booking) stacked on top of them. */
export function RootNavigator() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        dark: isDark,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
        },
      }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{
            title: t('booking.title'),
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
        <Stack.Screen
          name="PrescriptionDetail"
          component={PrescriptionDetailScreen}
          options={{
            title: t('prescriptions.detailTitle'),
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
