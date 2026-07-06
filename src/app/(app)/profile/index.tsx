import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { useGetProfileQuery } from '@/api/profileApi';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { AuthMethod } from '@/enums';
import { useTheme } from '@/hooks/use-theme';
import { RootState } from '@/store';
import { logout, setPreferredAuthMethod } from '@/store/authSlice';
import { setAmountMasked, setThemePreference } from '@/store/userSlice';
import { getErrorMessage } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const { scheme, colors, themePreference } = useTheme();

  const dispatch = useDispatch();
  const {
    isBiometricsSupported,
    isBiometricsEnrolled,
    supportedBiometricTypes,
    preferredAuthMethod,
  } = useSelector((state: RootState) => state.auth);
  const { isAmountMasked } = useSelector((state: RootState) => state.user);

  const { data: user, isLoading, error } = useGetProfileQuery();

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/login');
  };

  const handleToggleMaskPreference = () => {
    dispatch(setAmountMasked(!isAmountMasked));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
        <Text style={styles.errorText}>⚠️ {getErrorMessage(error, 'Failed to load profile details')}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutRetryButton}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
      <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>

          {/* User Profile Avatar Card */}
          <View style={[styles.profileCard]}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.backgroundSelected }]}>
              <Text style={[styles.avatarText, { color: colors.text }]}>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
              </Text>
            </View>
            <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'User'}</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || 'email@bank.com'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Security Settings</Text>

            <View style={[styles.settingsList, { backgroundColor: colors.backgroundElement }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleToggleMaskPreference}
                style={styles.settingItem}>
                <View style={{ flex: 1, paddingRight: Spacing.two }}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Mask Sensitive Amounts</Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Hide transaction totals by default
                  </Text>
                </View>
                <View style={[
                  styles.toggleSwitch,
                  { backgroundColor: isAmountMasked ? '#34C759' : colors.backgroundSelected }
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    { transform: [{ translateX: isAmountMasked ? 18 : 2 }] }
                  ]} />
                </View>
              </TouchableOpacity>

              <View style={styles.itemDivider} />

              <View style={styles.settingItem}>
                <View style={{ flex: 1, paddingRight: Spacing.two }}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Device Biometrics</Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    {isBiometricsSupported
                      ? `Supported (${supportedBiometricTypes.join(', ') || 'None enrolled'})`
                      : 'Hardware unsupported'}
                  </Text>
                </View>
                {isBiometricsSupported && isBiometricsEnrolled ? (
                  <Ionicons name="checkmark-circle" size={22} color="#34C759" />
                ) : (
                  <Ionicons name="close-circle" size={22} color="#FF3B30" />
                )}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Display Settings</Text>

            <View style={[styles.settingsList, { backgroundColor: colors.backgroundElement }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  const targetTheme = scheme === 'dark' ? 'light' : 'dark';
                  dispatch(setThemePreference(targetTheme));
                }}
                style={styles.settingItem}>
                <View style={{ flex: 1, paddingRight: Spacing.two }}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    {themePreference === 'system'
                      ? 'Matching device system settings'
                      : `Explicitly set to ${themePreference}`}
                  </Text>
                </View>
                <View style={[
                  styles.toggleSwitch,
                  { backgroundColor: scheme === 'dark' ? '#34C759' : colors.backgroundSelected }
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    { transform: [{ translateX: scheme === 'dark' ? 18 : 2 }] }
                  ]} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferred Login Method</Text>

            <View style={[styles.settingsList, { backgroundColor: colors.backgroundElement }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => dispatch(setPreferredAuthMethod(AuthMethod.PASSCODE))}
                style={styles.settingItem}>
                <View style={{ flex: 1, paddingRight: Spacing.two }}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Passcode Only</Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Always log in using your 6-digit passcode
                  </Text>
                </View>
                <View style={styles.radioCircle}>
                  {preferredAuthMethod === AuthMethod.PASSCODE && <View style={styles.radioCircleSelected} />}
                </View>
              </TouchableOpacity>

              <View style={styles.itemDivider} />

              {(() => {
                const isFaceIDSupported = supportedBiometricTypes.includes('FaceID');
                const isFaceIDDisabled = !isFaceIDSupported || !isBiometricsEnrolled;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={isFaceIDDisabled}
                    onPress={() => dispatch(setPreferredAuthMethod(AuthMethod.FACE_ID))}
                    style={[styles.settingItem, isFaceIDDisabled && styles.disabledSettingItem]}>
                    <View style={{ flex: 1, paddingRight: Spacing.two }}>
                      <Text style={[styles.settingLabel, { color: colors.text }]}>Face ID</Text>
                      <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                        {!isFaceIDSupported
                          ? 'Face ID not supported on this device'
                          : !isBiometricsEnrolled
                            ? 'Face ID not enrolled in device settings'
                            : 'Log in securely using facial recognition'}
                      </Text>
                    </View>
                    <View style={[styles.radioCircle, isFaceIDDisabled && styles.radioCircleDisabled]}>
                      {preferredAuthMethod === AuthMethod.FACE_ID && <View style={styles.radioCircleSelected} />}
                    </View>
                  </TouchableOpacity>
                );
              })()}

              <View style={styles.itemDivider} />
              {(() => {
                const isFingerprintSupported = supportedBiometricTypes.includes('Fingerprint') || supportedBiometricTypes.includes('Iris');
                const isFingerprintDisabled = !isFingerprintSupported || !isBiometricsEnrolled;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={isFingerprintDisabled}
                    onPress={() => dispatch(setPreferredAuthMethod(AuthMethod.FINGERPRINT))}
                    style={[styles.settingItem, isFingerprintDisabled && styles.disabledSettingItem]}>
                    <View style={{ flex: 1, paddingRight: Spacing.two }}>
                      <Text style={[styles.settingLabel, { color: colors.text }]}>Fingerprint / Touch ID</Text>
                      <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                        {!isFingerprintSupported
                          ? 'Fingerprint sensor not supported'
                          : !isBiometricsEnrolled
                            ? 'Fingerprint not enrolled in device settings'
                            : 'Log in securely using your fingerprint'}
                      </Text>
                    </View>
                    <View style={[styles.radioCircle, isFingerprintDisabled && styles.radioCircleDisabled]}>
                      {preferredAuthMethod === AuthMethod.FINGERPRINT && <View style={styles.radioCircleSelected} />}
                    </View>
                  </TouchableOpacity>
                );
              })()}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account Details</Text>
            <View style={[styles.settingsList, { backgroundColor: colors.backgroundElement }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Institution</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>RYT Bank Corp.</Text>
              </View>
              <View style={styles.itemDivider} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Type</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>Private Premium Savings</Text>
              </View>
              <View style={styles.itemDivider} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account ID</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {isAmountMasked ? '···· ···· ···· 9842' : user?.accountNumber}
                </Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContent: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.two,
    gap: Spacing.three,
  },
  profileCard: {
    width: '100%',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
  },
  section: {
    width: '100%',
    gap: Spacing.one,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: Spacing.one,
  },
  settingsList: {
    width: '100%',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  disabledSettingItem: {
    opacity: 0.4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  radioCircleDisabled: {
    borderColor: '#A0A0A0',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  itemDivider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    width: '100%',
    height: 48,
    borderRadius: Spacing.two,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    fontSize: 14,
    marginTop: Spacing.two,
  },
  errorText: {
    fontSize: 15,
    color: '#FF3B30',
    fontWeight: '600',
  },
  logoutRetryButton: {
    width: '60%',
    height: 48,
    borderRadius: Spacing.two,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
});
