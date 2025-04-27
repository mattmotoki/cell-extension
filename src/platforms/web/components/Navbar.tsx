/**
 * src/platforms/web/components/Navbar.tsx - Game Navigation Bar
 * 
 * React component that serves as the top navigation bar for the Cell Extension game.
 * Provides the game title and a button to toggle the settings panel.
 * 
 * Key features:
 * - Game title display
 * - Settings toggle button
 * - Responsive design that adapts to different screen sizes
 * - Visual feedback for active states
 * 
 * Technical approach:
 * - Simple functional component with minimal state
 * - Uses props for controlling settings panel visibility
 * - Clean semantic HTML with accessibility considerations
 * 
 * Relationships:
 * - Parent component is App.tsx
 * - Controls visibility of GameSettingsPanel
 * - Forms part of the overall app layout structure
 * 
 * Revision Log:
 *  
 * Note: This revision log should be updated whenever this file is modified. 
 * Do not use dates in the revision log.
 */

import React from 'react';

// Define props for the toggle handler and panel state
interface NavbarProps {
  onMenuToggle: () => void;
  isPanelOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isPanelOpen }) => {
  // Add the 'active' class to the menu button if the panel is open
  const menuButtonClasses = `game-settings-menu ${isPanelOpen ? 'active' : ''}`;

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/favicons/favicon-32x32.png" alt="Cell Extension Logo" />
        <h1 className="navbar-title">Cellmata</h1>
      </div>

      {/* Add onClick handler and dynamic classes */}
      <div 
        className={menuButtonClasses}
        id="game-settings-menu" 
        onClick={onMenuToggle} // Call the toggle function on click
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default Navbar; 