/**
 * src/platforms/web/components/Navbar.tsx - Game Navigation Bar
 * 
 * Web-specific implementation of the Navbar component that uses the shared
 * cross-platform Navbar component with React Native for Web.
 * 
 * This component serves as a thin wrapper around the shared component,
 * providing any web-specific customizations if needed.
 */

import React from 'react';
import SharedNavbar from '@shared/components/Navbar';

// Define props for the toggle handler and panel state
interface NavbarProps {
  onMenuToggle: () => void;
  isPanelOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = (props) => {
  return <SharedNavbar {...props} />;
};

export default Navbar; 