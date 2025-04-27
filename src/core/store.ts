/**
 * src/core/store.ts - Redux Store Configuration
 * 
 * Configures and exports the central Redux store using Redux Toolkit.
 * Combines game and settings reducers into the main application state.
 */

import { configureStore } from '@reduxjs/toolkit';
// Import the root reducer instead of individual reducers
import rootReducer from './rootReducer';

export const store = configureStore({
    reducer: rootReducer, // Use the combined root reducer
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat( /* your middleware */ ),
    // devTools: process.env.NODE_ENV !== 'production',
});

// AppDispatch type doesn't need RootState explicitly
export type AppDispatch = typeof store.dispatch;

// RootState type is now typically exported from rootReducer.ts
// export type RootState = ReturnType<typeof store.getState>; // Keep if preferred 