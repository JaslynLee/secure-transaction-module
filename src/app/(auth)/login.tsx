import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { Spacing } from '@/constants/theme';
import { AuthMethod } from '@/enums';
import { useTheme } from '@/hooks/use-theme';
import { authenticateWithBiometrics, checkBiometrics } from '@/services/biometrics';
import { RootState } from '@/store';
import {
    loginSuccess,
    setBiometricsSupport,
    setLocalAuthError,
} from '@/store/authSlice';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
    const { colors } = useTheme();

    const dispatch = useDispatch();
    const {
        isBiometricsSupported,
        isBiometricsEnrolled,
        supportedBiometricTypes,
        preferredAuthMethod,
        localAuthError,
    } = useSelector((state: RootState) => state.auth);

    const [passcode, setPasscode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // Check if biometric button should be visible on the keypad
    const isBiometricAvailable = Platform.OS !== 'web' && isBiometricsSupported && isBiometricsEnrolled;
    const isFaceID = supportedBiometricTypes.includes('FaceID');
    const biometricIconName = isFaceID ? 'scan-outline' : 'finger-print-outline';

    // 1. Perform Biometric Verification
    const handleBiometricLogin = useCallback(async (type?: AuthMethod) => {
        dispatch(setLocalAuthError(null));
        setLoading(true);

        const method = type || preferredAuthMethod;

        let msg = 'Verify your identity to log in';
        if (method === AuthMethod.FACE_ID) {
            msg = 'Verify Face ID to log in';
        } else if (method === AuthMethod.FINGERPRINT) {
            msg = 'Verify fingerprint to log in';
        } else if (method === AuthMethod.PASSCODE) {
            msg = 'Enter your device passcode to log in';
        }

        const result = await authenticateWithBiometrics(msg);

        if (result.success) {
            dispatch(loginSuccess());
            router.replace('/(app)');
        } else {
            // Only set error if it is not BIOMETRICS_UNAVAILABLE on load
            if (result.error !== 'BIOMETRICS_UNAVAILABLE') {
                dispatch(setLocalAuthError(result.error || 'Authentication failed'));
            }
        }
        setLoading(false);
    }, [dispatch, preferredAuthMethod]);

    // 2. Initial status checks
    useEffect(() => {
        async function initAuth() {
            const status = await checkBiometrics();
            dispatch(
                setBiometricsSupport({
                    supported: status.hasHardware,
                    enrolled: status.isEnrolled,
                    supportedTypes: status.supportedTypes,
                })
            );
        }
        initAuth();
    }, [dispatch]);

    // Auto-trigger biometric on load if it is the preferred method
    useEffect(() => {
        if (preferredAuthMethod === AuthMethod.FACE_ID || preferredAuthMethod === AuthMethod.FINGERPRINT) {
            const isAvailable =
                (preferredAuthMethod === AuthMethod.FACE_ID && supportedBiometricTypes.includes('FaceID')) ||
                (preferredAuthMethod === AuthMethod.FINGERPRINT &&
                    (supportedBiometricTypes.includes('Fingerprint') || supportedBiometricTypes.includes('Iris')));

            if (isBiometricsSupported && isBiometricsEnrolled && isAvailable) {
                handleBiometricLogin(preferredAuthMethod);
            }
        }
    }, [preferredAuthMethod, isBiometricsSupported, isBiometricsEnrolled, supportedBiometricTypes, handleBiometricLogin]);

    // 3. Perform Passcode Verification
    const handleKeyPress = (val: string) => {
        dispatch(setLocalAuthError(null));
        if (passcode.length < 6) {
            const nextPasscode = passcode + val;
            setPasscode(nextPasscode);

            if (nextPasscode.length === 6) {
                verifyPasscode(nextPasscode);
            }
        }
    };

    const handleBackspace = () => {
        dispatch(setLocalAuthError(null));
        if (passcode.length > 0) {
            setPasscode(passcode.slice(0, -1));
        }
    };

    const verifyPasscode = (code: string) => {
        setLoading(true);
        // Hardcoded verification against mock data '123456'
        setTimeout(() => {
            if (code === '123456') {
                dispatch(loginSuccess());
                router.replace('/(app)');
            } else {
                dispatch(setLocalAuthError('Incorrect passcode. Try again.'));
                setPasscode('');
            }
            setLoading(false);
        }, 500);
    };


    // Dev feature for simulators and web testing
    const simulateBiometricLogin = () => {
        dispatch(setLocalAuthError(null));
        setLoading(true);
        setTimeout(() => {
            dispatch(loginSuccess());
            router.replace('/(app)');
            setLoading(false);
        }, 1000);
    };

    const renderDots = () => {
        const dots = [];
        for (let i = 0; i < 6; i++) {
            const isActive = i < passcode.length;
            dots.push(
                <View
                    key={i}
                    style={[
                        styles.dot,
                        {
                            backgroundColor: isActive ? colors.text : 'transparent',
                            borderColor: colors.textSecondary,
                        },
                    ]}
                />
            );
        }
        return <View style={styles.dotsContainer}>{dots}</View>;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={[styles.logoCircle, { backgroundColor: colors.backgroundElement }]}>
                    <Text style={[styles.logoText, { color: colors.text }]}>RYT</Text>
                </View>
                <Text style={[styles.title, { color: colors.text }]}>RYT Bank</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Secure Transaction History Module
                </Text>
            </View>

            <View style={styles.passcodeWrapper}>
                <View style={styles.inputSection}>
                    {renderDots()}
                    {localAuthError ? (
                        <Text style={styles.errorText}>{localAuthError}</Text>
                    ) : (
                        <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                            {loading ? 'Verifying...' : 'Enter 6-digit Passcode (Try: 123456)'}
                        </Text>
                    )}
                </View>

                <View style={styles.keypad}>
                    {[
                        ['1', '2', '3'],
                        ['4', '5', '6'],
                        ['7', '8', '9'],
                    ].map((row, rIdx) => (
                        <View key={rIdx} style={styles.keypadRow}>
                            {row.map((val) => (
                                <TouchableOpacity
                                    key={val}
                                    disabled={loading}
                                    onPress={() => handleKeyPress(val)}
                                    style={[styles.keyButton, { backgroundColor: colors.backgroundElement }]}>
                                    <Text style={[styles.keyText, { color: colors.text }]}>{val}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}

                    <View style={styles.keypadRow}>
                        {isBiometricAvailable ? (
                            <TouchableOpacity
                                disabled={loading}
                                onPress={() => handleBiometricLogin(preferredAuthMethod)}
                                style={[styles.keyButton, { backgroundColor: colors.backgroundElement }]}>
                                <Ionicons name={biometricIconName as any} size={28} color={colors.text} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.keyButton} />
                        )}

                        <TouchableOpacity
                            disabled={loading}
                            onPress={() => handleKeyPress('0')}
                            style={[styles.keyButton, { backgroundColor: colors.backgroundElement }]}>
                            <Text style={[styles.keyText, { color: colors.text }]}>0</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={loading}
                            onPress={handleBackspace}
                            style={[styles.keyButton, { backgroundColor: colors.backgroundElement }]}>
                            <Ionicons name="backspace-outline" size={26} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {(!isBiometricsSupported || !isBiometricsEnrolled || Platform.OS === 'web') && (
                <View style={styles.devPanel}>
                    <TouchableOpacity
                        onPress={simulateBiometricLogin}
                        style={[styles.devButton, { backgroundColor: colors.backgroundSelected }]}>
                        <Text style={[styles.devButtonText, { color: colors.text }]}>
                            🔧 Simulate Biometric Scan (Bypass Login)
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: Spacing.four,
        gap: 10
    },
    header: {
        alignItems: 'center',
        marginTop: Spacing.five,
        gap: Spacing.one,
    },
    logoCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.two,
    },
    logoText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    inputSection: {
        alignItems: 'center',
        gap: Spacing.three,
        marginVertical: Spacing.five
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: Spacing.three,
        justifyContent: 'center',
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
    },
    hintText: {
        fontSize: 14,
    },
    errorText: {
        fontSize: 14,
        color: '#FF3B30',
        fontWeight: '600',
    },
    keypad: {
        paddingHorizontal: Spacing.four,
        gap: Spacing.three,
        marginBottom: Spacing.two,
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        gap: Spacing.three,
    },
    keyButton: {
        flex: 1,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 80,
    },
    disabledKey: {
        opacity: 0.3,
    },
    keyText: {
        fontSize: 24,
        fontWeight: '500',
    },
    biometricIcon: {
        fontSize: 24,
    },
    devPanel: {
        alignItems: 'center',
        paddingHorizontal: Spacing.four,
        gap: Spacing.two,
        marginBottom: Spacing.three,
    },
    devText: {
        fontSize: 12,
        textAlign: 'center',
    },
    devButton: {
        paddingVertical: Spacing.two,
        paddingHorizontal: Spacing.three,
        borderRadius: Spacing.two,
    },
    devButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    optionsList: {
        width: '90%',
        maxWidth: 340,
        alignSelf: 'center',
        gap: Spacing.two,
        marginTop: Spacing.two,
        marginBottom: Spacing.four,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.three,
        borderRadius: Spacing.two,
        justifyContent: 'space-between',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    disabledOptionRow: {
        opacity: 0.45,
    },
    optionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 122, 255, 0.08)',
        marginRight: Spacing.two,
    },
    optionIcon: {
        fontSize: 20,
    },
    optionTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    optionSublabel: {
        fontSize: 11,
    },
    optionChevron: {
        fontSize: 18,
        fontWeight: '500',
        marginLeft: Spacing.one,
    },
    errorBanner: {
        width: '90%',
        maxWidth: 340,
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.08)',
        padding: Spacing.two,
        borderRadius: Spacing.one,
        alignItems: 'center',
        marginBottom: Spacing.two,
    },
    passcodeWrapper: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
    },
});