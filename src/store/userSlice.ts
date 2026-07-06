import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isAmountMasked: boolean;
  themePreference: 'system' | 'light' | 'dark';
}

const initialState: UserState = {
  isAmountMasked: true, // Amounts must be masked by default
  themePreference: 'system',
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAmountMasked: (state, action: PayloadAction<boolean>) => {
      state.isAmountMasked = action.payload;
    },
    toggleAmountMask: (state) => {
      state.isAmountMasked = !state.isAmountMasked;
    },
    setThemePreference: (state, action: PayloadAction<'system' | 'light' | 'dark'>) => {
      state.themePreference = action.payload;
    },
  },
});

export const { setAmountMasked, toggleAmountMask, setThemePreference } = userSlice.actions;
export default userSlice.reducer;
