/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Colors } from '@/constants/theme';

export function useTheme() {
  const systemScheme = useColorScheme();
  const themePreference = useSelector((state: RootState) => state.user.themePreference);

  const activeScheme =
    themePreference === 'system'
      ? (systemScheme === 'dark' ? 'dark' : 'light')
      : themePreference;

  const colors = Colors[activeScheme];

  return {
    scheme: activeScheme,
    themePreference,
    colors,
  };
}
