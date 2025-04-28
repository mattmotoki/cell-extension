/**
 * src/platforms/web/components/Footer.tsx - Application Footer
 * 
 * React component that renders the application footer with version information,
 * copyright notice, and displays the current scoring mechanism. Positioned at 
 * the bottom of the game container using responsive styling with CSS variables.
 * 
 * Relationships:
 * - Displays scoring mechanism information from settings
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@core';

const Footer: React.FC = () => {
  // Get scoring mechanism from Redux store
  const scoringMechanism = useSelector((state: RootState) => state.settings.scoringMechanism);
  // Format the scoring mechanism for display
  const scoringDescription = scoringMechanism.replace('cell-','').replace('-', ' ');
  
  const currentYear = new Date().getFullYear();
  
  return (
    <footer>
      <span>© {currentYear} Cellmata </span>
      <span>•</span>
      <span>Scoring: {scoringDescription}</span>
    </footer>
  );
};

export default Footer; 