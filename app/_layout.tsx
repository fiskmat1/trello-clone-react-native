import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments, SplashScreen } from 'expo-router';
import { SupabaseProvider } from '@/context/SupabaseContext';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/Colors';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '~/lib/useColorScheme';

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const InitialLayout = () => {
  const router = useRouter();
  const segments = useSegments();
  const { isLoaded, isSignedIn } = useAuth(); // Call unconditionally
  const [appReady, setAppReady] = useState(false); // Ensure app is ready before navigation

  const { colorScheme, setColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);

  useEffect(() => {
    // Async function to handle splash screen and color theme
    (async () => {
      try {
        SplashScreen.preventAutoHideAsync(); // Prevent hiding until app is ready
        const theme = await AsyncStorage.getItem('theme');

        if (!theme) {
          AsyncStorage.setItem('theme', colorScheme);
          setIsColorSchemeLoaded(true);
          return;
        }

        const colorTheme = theme === 'dark' ? 'dark' : 'light';
        if (colorTheme !== colorScheme) {
          setColorScheme(colorTheme);
        }

        setIsColorSchemeLoaded(true);
      } catch (err) {
        console.error('Error loading theme or SplashScreen:', err);
      } finally {
        setAppReady(true);
      }
    })();
  }, [colorScheme, setColorScheme]);

  useEffect(() => {
    if (!isLoaded || !appReady) return;

    const inAuthGroup = segments[0] === '(authenticated)';

    if (isSignedIn && !inAuthGroup) {
      router.replace('/(authenticated)/(tabs)');
    } else if (!isSignedIn) {
      router.replace('/');
    }
  }, [isSignedIn, isLoaded, appReady]);

  // Ensure that the app is ready and all dependencies (auth, color scheme, etc.) are loaded
  if (!isColorSchemeLoaded || !isLoaded || !appReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  SplashScreen.hideAsync(); // Ensure SplashScreen is hidden when app is ready

  return (
    <SupabaseProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
      </Stack>
    </SupabaseProvider>
  );
};

const RootLayoutNav = () => {
  return (
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
      <StatusBar style="dark"  />
      <ActionSheetProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <InitialLayout />
        </GestureHandlerRootView>
      </ActionSheetProvider>
    </ClerkProvider>
  );
};

export default RootLayoutNav;
