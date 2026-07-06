import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricStatus {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: string[];
}

/**
 * Checks the device's biometric capabilities and enrollment status.
 */
export async function checkBiometrics(): Promise<BiometricStatus> {
  try {
    // 1. Check if device has hardware support
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    
    // 2. Check if user has enrolled fingerprints/FaceID
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    // 3. Get the types of biometrics supported
    const supportedTypes: string[] = [];
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    types.forEach((type) => {
      if (type === LocalAuthentication.AuthenticationType.FINGERPRINT) {
        supportedTypes.push('Fingerprint');
      } else if (type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
        supportedTypes.push('FaceID');
      } else if (type === LocalAuthentication.AuthenticationType.IRIS) {
        supportedTypes.push('Iris');
      }
    });

    return {
      hasHardware,
      isEnrolled,
      supportedTypes,
    };
  } catch (error) {
    console.error('Error checking biometrics support:', error);
    return {
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
    };
  }
}

/**
 * Prompts the user for biometric authentication.
 * @param message The reason shown in the biometric prompt (e.g., "Authenticate to reveal transactions").
 * @returns Object indicating success status and any error messages.
 */
export async function authenticateWithBiometrics(
  message: string = 'Authenticate to access your secure account'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check support first
    const status = await checkBiometrics();
    
    // Simulators and Web fallback
    if (Platform.OS === 'web' || !status.hasHardware || !status.isEnrolled) {
      return { 
        success: false, 
        error: 'BIOMETRICS_UNAVAILABLE' // Caller should handle this and trigger passcode fallback
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: message,
      fallbackLabel: 'Use Passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false, // Allows native PIN/passcode fallback if FaceID fails
    });

    if (result.success) {
      return { success: true };
    } else {
      // Map common error codes
      let errorMsg = 'Authentication failed';
      if (result.error === 'user_cancel') {
        errorMsg = 'Authentication cancelled by user';
      } else if (result.error === 'lockout') {
        errorMsg = 'Biometrics locked out due to too many attempts';
      }
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
