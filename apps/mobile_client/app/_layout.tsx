import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { View, Text } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeDatabase, useDatabaseMigrations, seedInitialData } from '@/lib/database';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize database first
  useEffect(() => {
    if (loaded && !dbInitialized) {
      try {
        initializeDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    }
  }, [loaded, dbInitialized]);

  // Handle database migrations after database is initialized
  const { success, error } = dbInitialized ? useDatabaseMigrations() : { success: false, error: null };

  useEffect(() => {
    if (loaded && dbInitialized) {
      const initializeApp = async () => {
        try {
          // Seed initial data
          await seedInitialData();
          
          setAppIsReady(true);
        } catch (error) {
          console.error('Failed to initialize app:', error);
          setAppIsReady(true);
        }
      };
      
      initializeApp();
    }
  }, [loaded, dbInitialized]);

  useEffect(() => {
    if (appIsReady) {
      const hideSplashScreen = async () => {
        await SplashScreen.hideAsync();
      };
      hideSplashScreen();
    }
  }, [appIsReady]);

  // Show migration error
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  // Show database initialization in progress
  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Initializing database...</Text>
      </View>
    );
  }

  // Show migration in progress
  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}