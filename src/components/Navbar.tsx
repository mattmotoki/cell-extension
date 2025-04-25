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
        <h1 className="navbar-title">Cell Production</h1>
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