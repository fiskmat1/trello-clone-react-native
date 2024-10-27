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
import { useColorScheme } from '~/lib/useColorScheme';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import AnimatedIntroSplash from '@/components/AnimatedIntroSplash';

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
  const { isLoaded, isSignedIn } = useAuth();
  const [appReady, setAppReady] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  const { colorScheme, setColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);

  // Animated fade-out effect
  const fadeOutStyle = useAnimatedStyle(() => ({
    opacity: introComplete ? withTiming(0, { duration: 1000 }) : 1,
  }));

  useEffect(() => {
    (async () => {
      try {
        SplashScreen.preventAutoHideAsync();
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
        SplashScreen.hideAsync();
        setTimeout(() => setIntroComplete(true), 4000);
      }
    })();
  }, [colorScheme, setColorScheme]);

  // Navigate when both introComplete and isLoaded are true
  useEffect(() => {
    if (!introComplete || !isLoaded) return;

    const inAuthGroup = segments[0] === '(authenticated)';
    if (isSignedIn && !inAuthGroup) {
      router.replace('/(authenticated)/(tabs)');
    } else if (!isSignedIn) {
      router.replace('/');
    }
  }, [isSignedIn, isLoaded, introComplete]);

  if (!isColorSchemeLoaded || !isLoaded || !appReady) {
    return null;
  }

  return (
    <SupabaseProvider>
      {!introComplete ? (
        <Animated.View style={[{ flex: 1 }, fadeOutStyle]}>
          <AnimatedIntroSplash />
        </Animated.View>
      ) : (
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
        </Stack>
      )}
    </SupabaseProvider>
  );
};

const RootLayoutNav = () => {
  return (
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
      <StatusBar style="dark" />
      <ActionSheetProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <InitialLayout />
        </GestureHandlerRootView>
      </ActionSheetProvider>
    </ClerkProvider>
  );
};

export default RootLayoutNav;
