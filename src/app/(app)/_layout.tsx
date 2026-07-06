import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '@/hooks/use-theme';

export default function AppLayout() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { colors } = useTheme();

  // If not authenticated, redirect to the login screen
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const renderBackButton = () => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.back()}
      style={{ padding: 4 }}>
      <Ionicons name="chevron-back" size={26} color={colors.text} />
    </TouchableOpacity>
  );

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Screen
        name="transaction/[id]"
        options={{
          headerShown: true,
          title: 'Transaction Details',
          presentation: 'card',
          headerLeft: renderBackButton,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
        }}
      />

      <Stack.Screen
        name="transaction/index"
        options={{
          headerShown: true,
          title: 'Transactions',
          presentation: 'card',
          headerLeft: renderBackButton,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
        }}
      />

      <Stack.Screen
        name="profile/index"
        options={{
          headerShown: true,
          title: 'Profile',
          presentation: 'card',
          headerLeft: renderBackButton,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}