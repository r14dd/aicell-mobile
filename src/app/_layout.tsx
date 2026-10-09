import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold, useFonts } from '@expo-google-fonts/geist';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RateAppProvider } from '@/components/RateApp';
import { ToastProvider } from '@/components/Toast';
import { AccountProvider } from '@/state/account';
import { SessionProvider } from '@/state/session';
import { AyselBubble } from '@/components/aysel/Bubble';
import { LayaOverlay } from '@/laya/cursor';
import { AyselProvider } from '@/state/aysel';
import { StoriesProvider } from '@/state/stories';
import { SteamProvider } from '@/state/steam';
import { colors, layout } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, primary: colors.accent, text: colors.text, border: colors.line },
};

/** On the web the app renders inside a phone-width column so desktop browsers show it as a phone. */
function Frame({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: layout.maxWidth }}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <ThemeProvider value={theme}>
      <SteamProvider>
        <SessionProvider>
        <AccountProvider>
        <StoriesProvider>
        <Frame>
          <ToastProvider>
            <RateAppProvider autoAfterMs={0}>
              <AyselProvider>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="invite" />
                <Stack.Screen name="steam/index" />
                <Stack.Screen name="steam/top-up" />
                <Stack.Screen name="kredit/index" />
                <Stack.Screen name="kredit/tamamla" />
                <Stack.Screen name="kredit/simkredit" />
                <Stack.Screen name="tariffs/[id]" />
                <Stack.Screen name="premium" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="esim/index" />
                <Stack.Screen name="esim/recover" />
                <Stack.Screen name="games" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="support" />
                <Stack.Screen name="story/[key]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
                <Stack.Screen name="aysel" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
                <Stack.Screen name="login/number" />
                <Stack.Screen name="login/passcode" />
              </Stack>
              <LayaOverlay />
              <AyselBubble />
              </AyselProvider>
            </RateAppProvider>
          </ToastProvider>
        </Frame>
        </StoriesProvider>
        </AccountProvider>
        </SessionProvider>
      </SteamProvider>
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}
