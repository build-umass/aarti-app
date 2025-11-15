import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { View, Text } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeDatabase, useDatabaseMigrations, seedInitialData } from '@/lib/database';
import { UserService } from '@/services/UserService';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Always call the hook at the top level - this is required by Rules of Hooks
  const { success, error } = useDatabaseMigrations();

  // Initialize database and seed data
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize database
        await initializeDatabase();

        // Seed initial data
        await seedInitialData();

        // Check onboarding status
        const isOnboardingCompleted = await UserService.getOnboardingStatus();
        setOnboardingCompleted(isOnboardingCompleted);

        // Mark app as ready
        setAppIsReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Still mark as ready to show error state
        setAppIsReady(true);
      }
    }

    if (loaded) {
      prepare();
    }
  }, [loaded]);

  // Hide splash screen only when everything is ready
  useEffect(() => {
    if (appIsReady && loaded) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, loaded]);

  // Keep splash screen visible while loading
  if (!appIsReady || !loaded) {
    return null;
  }

  // Show migration error if any
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Database error: {error.message}</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName={onboardingCompleted ? '(tabs)' : 'onboarding'}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}