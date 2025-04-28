# Cross-Platform Theme System

This directory contains the core theme system for the Cell Extension application, designed to work across multiple platforms while maintaining a consistent look and feel.

## Purpose

The theme system provides a centralized place to define and manage design tokens such as:
- Colors
- Typography
- Component-specific styles
- Layout measurements
- Responsive values

By using this system, we ensure consistent styling across different platforms and make it easier to apply theme changes throughout the application.

## Structure

```
theme/
├── index.ts          # Main export file that combines all theme elements
├── colors.ts         # Color palette definitions
├── typography.ts     # Font families, sizes, weights, line heights
└── components/       # Component-specific theme variables
    ├── buttons.ts    # Button-specific styles
    ├── inputs.ts     # Form input styles
    └── layout.ts     # Layout and spacing values
```

## Usage

### React Web Example

```tsx
import theme from '@shared/styles/theme';
import styled from 'styled-components';

const PrimaryButton = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.main};
  font-size: ${theme.typography.fontSize.medium.vh};
  padding: ${theme.buttons.base.padding};
  border-radius: ${theme.buttons.base.borderRadius};
  border: none;
  
  &:hover {
    background-color: ${theme.buttons.base.hover.backgroundColor};
    transform: ${theme.buttons.base.hover.transform};
    box-shadow: ${theme.buttons.base.hover.boxShadow};
  }
`;
```

### React Native Example

```tsx
import { StyleSheet } from 'react-native';
import theme from '@shared/styles/theme';

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    padding: 12, // Convert the em values to specific units for React Native
    borderRadius: parseInt(theme.buttons.base.borderRadius),
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.main,
    fontSize: parseInt(theme.typography.fontSize.medium.px),
    fontWeight: theme.typography.fontWeight.semiBold.toString(),
  }
});
```

## Extending the Theme

To add new theme components or values:

1. Create a new file in the appropriate directory
2. Define your values using TypeScript objects/interfaces
3. Export both named exports and a default export
4. Import and add to the main `theme/index.ts` file

## Best Practices

- Always reference colors, sizes, and other values from the theme rather than hardcoding them
- When values need platform-specific adjustments, provide alternatives (like `vh` and `px` units for font sizes)
- Keep the theme structure flat and simple for easy consumption
- Document any non-obvious values or usage patterns

## Maintaining the Theme

When updating the theme:

1. Ensure backward compatibility or provide clear migration instructions
2. Update all related theme files to maintain consistency
3. Test changes across all supported platforms
4. Document significant changes in the theme file's revision history 