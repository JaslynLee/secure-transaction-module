import { Slot } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { Provider } from 'react-redux';

import { store } from '@/store';
import { AnimatedSplashOverlay } from '@/components/animated-splash-overlay';

/**
 * Root layout (Mounts Redux, theme provider)
 */

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Slot />
      </ThemeProvider>
    </Provider>
  );
}
