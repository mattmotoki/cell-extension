/**
 * src/platforms/web/components/index.ts
 * 
 * Exports all web-specific component implementations.
 * This allows cleaner imports through a single entry point.
 * 
 * Note: With Tamagui, we're reducing our reliance on platform-specific components.
 */

export { default as Navbar } from './Navbar';
export { default as GameSettingsPanel } from './GameSettingsPanel';
export { default as Footer } from './Footer';
export { default as GameControls } from './GameControls';
// Picker is now a cross-platform component using Tamagui
// export { default as Picker } from './Picker';
// Export other web-specific components here 