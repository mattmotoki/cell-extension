/**
 * src/platforms/web/components/GameControls.tsx - Game Control Buttons
 * 
 * Web-specific implementation of the GameControls component that uses the shared
 * cross-platform component with React Native for Web.
 * 
 * This component serves as a thin wrapper around the shared component,
 * providing any web-specific customizations if needed.
 * 
 * Relationships:
 * - Receives callback handlers from App.tsx
 */

import React from 'react';
import SharedGameControls from '@shared/components/GameControls';

interface GameControlsProps {
  onUndo: () => void;
  onReset: () => void;
  isUndoDisabled: boolean;
}

const GameControls: React.FC<GameControlsProps> = (props) => {
  return <SharedGameControls {...props} />;
};

export default GameControls; 