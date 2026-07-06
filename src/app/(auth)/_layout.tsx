import { Redirect, Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function AuthLayout() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // If already authenticated, redirect to the main app area
  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}