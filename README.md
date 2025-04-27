# Cellmata

Players take turns placing their cells on the board. If a player places a new cell adjacent to one or more of their existing cells, their existing cells expand to include the new one.

## Architecture Overview

This project uses a platform-agnostic architecture designed to support both web and mobile (React Native) platforms. The codebase is organized into the following structure:

```
src/
├── core/              # Platform-agnostic business logic
│   ├── game/          # Game state and rules
│   ├── ai/            # AI decision-making algorithms
│   ├── scoring/       # Scoring mechanisms
│   ├── store.ts       # Redux store configuration
│   └── types.ts       # Shared TypeScript interfaces
├── platforms/
│   ├── web/           # Web-specific components and hooks
│   │   └── components/
│   └── mobile/        # Mobile-specific components (future)
├── shared/            # Cross-platform utilities and components
└── App.tsx            # Main App component
```

### Core Concepts

- **Platform-Agnostic Logic**: All game rules, state management, and algorithms are implemented in the `core` directory without any platform-specific dependencies.
- **Redux Architecture**: Using Redux Toolkit for state management to facilitate state sharing across platforms.
- **Modular Components**: UI components are implemented separately for each platform but consume the same core logic.

## Tech Stack

- **Web**: React 18, TypeScript, Vite, Redux Toolkit
- **Mobile** (planned): React Native
- **Shared**: TypeScript, Redux Toolkit

## Migration Status

The project is currently being migrated from a monolithic React application to a platform-agnostic architecture.

### Completed
- Directory structure reorganization
- Redux integration
- Component migration to platform-specific directories
- Path alias configuration

### In Progress
- Core logic abstraction
- Game state management refactoring
- AI algorithm isolation

### Planned
- Complete core abstraction
- Create platform adapters
- Testing infrastructure
- Mobile platform foundation

## Migration Plan

### Phase 1: Core Abstraction (Current)
Extracting all game logic into the `src/core` directory to create a platform-independent engine:

1. Move all game state logic to Redux slices
2. Extract algorithms to pure functions
3. Create AI logic independent of UI
4. Define shared TypeScript types
5. Create a clear public API for the core

### Phase 2: Platform Adaptation
Ensuring web components properly consume the core:

1. Replace custom hooks with Redux
2. Identify and isolate platform-specific features
3. Create adapter patterns for platform differences

### Phase 3: Testing & Documentation
Adding comprehensive testing and documentation:

1. Unit tests for core logic
2. Component tests for UI
3. Documentation for architecture and development

### Phase 4: Mobile Foundation
Creating the foundation for React Native:

1. Set up React Native project
2. Import core logic
3. Implement platform-specific components
4. Create shared navigation system

## Development

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Folder Structure Guidelines

- **Keep core logic pure**: No React or DOM dependencies in the `core` directory
- **Platform-specific components**: All UI components should live in the respective platform directory
- **Shared utilities**: Common utilities that work across platforms go in `shared`

## Scoring Mechanisms

### Cell-Multiplication
> Product of the size (number of cells) of the connected components

### Cell-Connection
> Product of the number of directed edges (connections)

### Cell-Extension
> Product of the number of undirected edges (extensions)

## Cross-Platform Development

This project is designed to work on both web and mobile platforms by sharing core business logic. The strategy is:

1. **Share all business logic**: Game rules, state management, AI
2. **Platform-specific UI**: Separate UI implementations for web and mobile
3. **Common state management**: Redux for predictable state across platforms


## Running the application

### Web 
```
npm run dev
```

### Mobile (Future)
```
cd packages/mobile
npm run android
# or
npm run ios
```