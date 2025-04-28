/**
 * src/platforms/web/components/Navbar.tsx - Game Navigation Bar
 * 
 * React component that serves as the top navigation bar for the Cell Extension game.
 * Displays the game title and provides a responsive toggle button for the settings panel,
 * with visual feedback for active states and accessibility considerations.
 * 
 * Relationships:
 * - Controls visibility of GameSettingsPanel
 * 
 * Revision Log:
 *  
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