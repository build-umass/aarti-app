import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeDatabase, seedInitialData } from '@/lib/database';
import { RAGService } from '@/services/RAGService';
import { AppInitProvider } from '@/contexts/AppInitContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import '@/i18n/config'; // Initialize i18n

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize database and seed data
  useEffect(() => {
    async function prepare() {
      try {
        await initializeDatabase();
        await seedInitialData();

        // Initialize RAG knowledge base
        try {
          await RAGService.initializeKnowledgeBase();
          console.log('RAG knowledge base initialized');
        } catch (ragError) {
          console.error('Failed to initialize RAG knowledge base:', ragError);
          // Don't fail the app if RAG initialization fails
        }

        setIsSeeded(true);
        setAppIsReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setAppIsReady(true);
        setIsSeeded(true); // Prevent infinite loading on error
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

  return (
    <LanguageProvider>
      <AppInitProvider isInitialized={appIsReady} isSeeded={isSeeded}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </AppInitProvider>
    </LanguageProvider>
  );
}
