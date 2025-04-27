/**
 * src/platforms/web/components/Footer.tsx - Application Footer
 * 
 * React component that renders the application footer with version information
 * and copyright notice. Positioned at the bottom of the game container.
 * 
 * Key features:
 * - Consistent styling with the rest of the application
 * - Displays copyright and version information
 * - Shows current scoring mechanism being used
 * - Uses CSS variables for responsive sizing
 * 
 * Technical approach:
 * - Simple stateless functional component
 * - Uses CSS variables for responsive sizing
 * - Follows the same styling pattern as other components
 * 
 * Relationships:
 * - Rendered at the bottom of the main game container
 * - Styled according to global theme variables
 * - Displays information from the Redux store
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