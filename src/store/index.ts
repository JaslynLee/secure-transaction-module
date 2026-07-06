import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { apiSlice } from '../api/apiSlice';
import authReducer from './authSlice';
import userReducer from './userSlice';

export const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
});

export const store = configureStore({
    reducer: rootReducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
