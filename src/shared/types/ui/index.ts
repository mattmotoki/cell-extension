/**
 * src/shared/types/ui/index.ts
 * 
 * Shared UI-related TypeScript types and interfaces for the Cell Extension game.
 * These types define UI concepts that may be implemented differently across platforms.
 */

import { PlayerIndex, Coordinates } from '../game';
import { GameProgress, GameSettings } from '../state';

// Represents a theme option for the UI
export type ThemeOption = 'light' | 'dark' | 'system';

// Represents different animation speeds for game elements
export type AnimationSpeed = 'none' | 'fast' | 'normal' | 'slow';

// Represents UI configuration for settings
export interface UISettings {
  theme: ThemeOption;
  soundEnabled: boolean;
  animationSpeed: AnimationSpeed;
  showCoordinates: boolean;
  showRecentMove: boolean;
  showPossibleMoves: boolean;
}

// Represents the type of dialog being shown
export type DialogType = 'none' | 'settings' | 'rules' | 'about' | 'gameOver' | 'confirmReset';

// Represents UI state that needs to be tracked
export interface UIState {
  activeDialog: DialogType;
  settingsVisible: boolean;
  historyVisible: boolean;
  showTooltip: boolean;
  tooltipPosition?: Coordinates;
  tooltipContent?: string;
  isAnimating: boolean;
}

// Represents a callback for a cell being clicked
export type CellClickHandler = (coords: Coordinates) => void;

// Represents a callback for settings being changed
export type SettingsChangeHandler = (settings: Partial<GameSettings>) => void;

// Represents a theme with colors and styles
export interface Theme {
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  accentColor: string;
  player0Color: string;
  player1Color: string;
  gridColor: string;
  highlightColor: string;
} 