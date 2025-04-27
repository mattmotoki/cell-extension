/**
 * src/core/index.ts
 * 
 * Main entry point for the core logic and state management.
 * Re-exports essential components from submodules for a clean API.
 */

// Re-export core types
export * from './types';

// Re-export main store configuration and types
export * from './store'; // Exports store instance and AppDispatch
export type { RootState } from './rootReducer'; // Export RootState type

// Re-export public APIs of submodules
export * from './game'; // Includes gameSlice, actions, selectors, utils
export * from './ai'; // Includes aiSlice, actions, selectors, engine functions
export * from './scoring'; // Includes scoring algorithms, potentially slice/selectors

// Re-export settings slice and actions
export { default as settingsReducer } from './settingsSlice';
export * from './settingsSlice'; // Exports updateSetting, setAllSettings