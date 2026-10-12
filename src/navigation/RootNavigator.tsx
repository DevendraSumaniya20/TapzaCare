import type { ComponentType } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { getIcon } from '../constants/icons';
import { useConfig } from '../hooks/useConfig';
import { useTheme } from '../hooks/useTheme';
import { BookingsScreen } from '../screens/BookingsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PrescriptionsScreen } from '../screens/PrescriptionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { TabScreen } from '../types/api';

// The config names a screen; this is the only place that name meets a component.
const SCREENS: Record<TabScreen, ComponentType> = {
  home: HomeScreen,
  bookings: BookingsScreen,
  prescriptions: PrescriptionsScreen,
  profile: ProfileScreen,
};

const Tab = createBottomTabNavigator();

const renderTabIcon = (name: string) => {
  const Icon = getIcon(name);
  return ({ color, size }: { color: string; size: number }) => (
    <Icon color={color} size={size} />
  );
};

export function RootNavigator() {
  const { config } = useConfig();
  const { colors, fontSize } = useTheme();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
        },
      }}
    >
      <Tab.Navigator
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
    </NavigationContainer>
  );
}
