/**
 * src/shared/styles/theme/components/inputs.ts
 * 
 * Defines styling for form inputs and controls.
 * Includes styles for dropdowns, selects, text inputs, etc.
 */

import colors from '../colors';
import typography from '../typography';
import layout from './layout';

// Base input styles shared across all input types
export const baseInput = {
  backgroundColor: colors.background.input,
  color: colors.text.primary,
  borderRadius: layout.borderRadius.medium,
  padding: '0.5em 0.8em',
  fontSize: typography.fontSize.small,
  fontFamily: typography.fontFamily.main,
  border: 'none',
  outline: 'none',
};

// Dropdown/select input styles
export const dropdown = {
  ...baseInput,
  position: 'relative',
  display: 'inline-block',
  minWidth: '8em',
  cursor: 'pointer',
  
  // Select element within dropdown
  select: {
    width: '100%',
    backgroundColor: 'transparent',
    padding: '0.15em 0.3em',
    paddingRight: '1.8em', // Space for arrow
    appearance: 'none',
    cursor: 'pointer',
    
    // Dropdown arrow styling
    backgroundImage: "url(\"data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.2em center',
    backgroundSize: '1.5em',
  },
};

// Text input styles
export const textInput = {
  ...baseInput,
  padding: '0.6em 0.8em',
  
  // Focus state
  focus: {
    borderColor: colors.primary,
    boxShadow: `0 0 0 2px ${colors.primary}33`, // 20% opacity primary color
  },
};

// Number input styles
export const numberInput = {
  ...textInput,
  
  // Control buttons
  buttons: {
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
};

// Checkbox styles
export const checkbox = {
  size: '1.2em',
  backgroundColor: colors.background.input,
  borderRadius: '3px',
  checkedColor: colors.primary,
  
  // Focus state
  focus: {
    outline: `2px solid ${colors.primary}33`, // 20% opacity primary color
  },
};

// Radio button styles
export const radio = {
  ...checkbox,
  borderRadius: '50%',
};

// Input states
export const inputStates = {
  default: {},
  focus: {
    outline: `2px solid ${colors.primary}33`, // 20% opacity primary color
  },
  disabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    borderColor: '#ff5555',
    outlineColor: '#ff555533', // 20% opacity error color
  },
};

// Export all input styles
const inputs = {
  base: baseInput,
  dropdown,
  textInput,
  numberInput,
  checkbox,
  radio,
  states: inputStates,
};

export default inputs; 