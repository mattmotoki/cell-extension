# Test Suite Issues and Fixes

## Identified Problems

After examining the test suite for the Cell Extension game, I identified several key issues:

### 1. Module Resolution Issues

All test files showed linter errors with imports from the `@core` module:

```
Cannot find module '@core' or its corresponding type declarations.
```

This is caused by a mismatch between how TypeScript path aliases are configured in `tsconfig.json` and how Jest resolves these paths during testing.

### 2. Inconsistent Board State Representation

The codebase has two different board state representations:

**Older Tests (outdated):**
```typescript
boardState: [
  [null, null, null],
  [null, 0, null],
  // etc.
]
```

**Actual Implementation & Newer Tests:**
```typescript
boardState: {
  gridWidth: 6,
  gridHeight: 6,
  occupiedCells: [{}, {}]
}
```

This inconsistency suggests the application underwent a refactoring of the board state representation, but not all tests were updated accordingly.

### 3. Duplicate Test Utilities

Two utility files with overlapping functionality:
- `tests/setup/testUtils.tsx`
- `tests/setup/mockStore.ts`

## Implemented Solutions

### 1. Added Dedicated Jest Configuration

Created a Jest configuration file at `tests/setup/jest.config.js` to properly handle path aliases:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@core(.*)$': '<rootDir>/src/core$1',
    '^@web(.*)$': '<rootDir>/src/platforms/web$1',
    '^@shared(.*)$': '<rootDir>/src/shared$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.ts'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(d3|d3-array|d3-scale|d3-shape|d3-time|d3-time-format|d3-color|d3-interpolate|d3-format|d3-selection|d3-transition|d3-axis|d3-hierarchy|d3-path|d3-zoom)/)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts'
  ]
}
```

### 2. Updated Package.json Scripts

Modified test scripts to use the new configuration:

```json
"test": "jest --config tests/setup/jest.config.js",
"test:watch": "jest --config tests/setup/jest.config.js --watch",
"test:coverage": "jest --config tests/setup/jest.config.js --coverage",
```

### 3. Standardized Test Utilities

Updated `tests/setup/testUtils.tsx` to:

1. Use the current board state structure
2. Provide helper functions for creating consistent test data
3. Consolidate functionality from both utility files

Added utility functions:
- `createTestBoardState()` - Creates a board state with the correct structure
- `addCellToBoard()` - Helper to place cells on the board in tests

### 4. Updated Test Files

Modified test files to use the correct board state representation:

1. Updated `Board.test.tsx`
2. Updated `ScoreDisplay.test.tsx`

## Remaining Tasks

To fully fix the test suite, the following tasks should be completed:

1. Update all remaining test files to use the current board state structure
2. Delete the duplicate `mockStore.ts` file
3. Run the tests and fix any additional issues that arise

## Usage Examples

When writing new test files, use the following patterns:

```typescript
// Import the test utilities
import { renderWithProviders, createTestBoardState, addCellToBoard } from '../../../setup/testUtils';

// Create a test board
const emptyBoard = createTestBoardState(5, 5);

// Add cells to the board
const boardWithMoves = addCellToBoard(emptyBoard, 0, 1, 1); // Add player 0's cell at (1,1)

// Create a preloaded state
const preloadedState = {
  game: {
    boardState: boardWithMoves,
    history: [ /* ... */ ],
    // other fields
  },
  settings: {
    boardSize: '5',
    playerMode: 'user',
    firstPlayer: 'human',
    scoringMechanism: 'cell-extension',
    aiDifficulty: 'medium',
  }
};

// Render with the state
renderWithProviders(<YourComponent />, { preloadedState });
``` 