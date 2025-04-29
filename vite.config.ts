import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'
import { tamaguiExtractPlugin, tamaguiPlugin } from '@tamagui/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  clearScreen: false,
  plugins: [
    tamaguiPlugin({
      config: './tamagui.config.ts',
      components: ['tamagui'],
      disableExtraction: process.env.NODE_ENV === 'development',
    }),
    react(), 
    tsconfigPaths(),
    tamaguiExtractPlugin()
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      // Use our shared Picker component instead of the platform-specific one
      '@react-native-picker/picker': resolve(__dirname, 'src/shared/components/Picker.tsx'),
    },
  },
  optimizeDeps: {
    include: [
      '@tamagui/core',
      '@tamagui/web',
      '@tamagui/animations-react-native',
      '@tamagui/font-inter',
      '@tamagui/shorthands',
      '@tamagui/themes',
    ],
    esbuildOptions: {
      mainFields: ['module', 'main'],
      resolveExtensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    },
  },
  build: {
    minify: process.env.NODE_ENV === 'production',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
}) 