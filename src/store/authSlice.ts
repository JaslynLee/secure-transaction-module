import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthMethod } from '@/enums';

interface AuthState {
  isAuthenticated: boolean;
  isBiometricsSupported: boolean;
  isBiometricsEnrolled: boolean;
  supportedBiometricTypes: string[];
  preferredAuthMethod: AuthMethod;
  localAuthError: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isBiometricsSupported: false,
  isBiometricsEnrolled: false,
  supportedBiometricTypes: [],
  preferredAuthMethod: AuthMethod.PASSCODE,
  localAuthError: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state) => {
      state.isAuthenticated = true;
      state.localAuthError = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.localAuthError = null;
    },
    setBiometricsSupport: (
      state,
      action: PayloadAction<{ supported: boolean; enrolled: boolean; supportedTypes: string[] }>
    ) => {
      state.isBiometricsSupported = action.payload.supported;
      state.isBiometricsEnrolled = action.payload.enrolled;
      state.supportedBiometricTypes = action.payload.supportedTypes;
    },
    setPreferredAuthMethod: (
      state,
      action: PayloadAction<AuthMethod>
    ) => {
      state.preferredAuthMethod = action.payload;
    },
    setLocalAuthError: (state, action: PayloadAction<string | null>) => {
      state.localAuthError = action.payload;
    },
  },
});

export const {
  loginSuccess,
  logout,
  setBiometricsSupport,
  setPreferredAuthMethod,
  setLocalAuthError,
} = authSlice.actions;
export default authSlice.reducer;
