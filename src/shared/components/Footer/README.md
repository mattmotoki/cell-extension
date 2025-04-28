# Cross-Platform Footer Component

This directory contains a shared React Native component that can be used across web and mobile platforms without modification.

## Setup

React Native for Web has been set up in this project, allowing components to work seamlessly across platforms.

### Configuration

The project has been configured with:

- React Native and React Native Web installed
- Build system configured to alias 'react-native' to 'react-native-web' for web platforms
- TypeScript configured with React Native types

## Usage

You can import and use the component the same way for both web and mobile:

```tsx
// In your web platform
import Footer from '@shared/components/Footer';

const App = () => {
  return (
    <div>
      {/* Your app content */}
      <Footer />
    </div>
  );
};
```

```tsx
// In your React Native mobile app
import Footer from '@shared/components/Footer';

const App = () => {
  return (
    <View>
      {/* Your app content */}
      <Footer />
    </View>
  );
};
```

## Styling

The component uses the shared theme system from `@shared/styles/theme`, ensuring consistent styling across platforms.

If you need to add platform-specific styling, you can:

1. Pass a `style` prop to the component:

```tsx
<Footer style={{ marginBottom: 20 }} />
```

2. Use Platform-specific styles within the shared component:

```tsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      web: {
        // Web-specific styles
      },
      ios: {
        // iOS-specific styles
      },
      android: {
        // Android-specific styles
      },
    }),
  },
});
```

## Extending with Platform-Specific Features

If you need to add platform-specific features beyond styling:

1. Keep the core component in `@shared/components/Footer`
2. Create platform-specific wrappers in their respective directories:
   - `src/platforms/web/components/Footer.tsx`
   - `src/platforms/mobile/components/Footer.tsx`

For example, the mobile version might add device-specific padding or interactions:

```tsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      web: {
        // Web-specific styles
      },
      ios: {
        // iOS-specific styles
      },
      android: {
        // Android-specific styles
      },
    }),
  },
}); 