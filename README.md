# Cell-Collection

Players take turns placing their cells on the board. If a player places a new cell adjacent to one or more of their existing cells, their existing cells expand to include the new one.

Run the server locally with:
```
python -m http.server
```
then open the browser and go to:
```
http://0.0.0.0:8000/
```

## Technical Implementation Details

The game is built using JavaScript with D3.js for visualization and interactions. The codebase follows a modular architecture with the following key components:

### Core Components

- **Board Class**: Manages the game grid, handles cell placements, extensions, and visualizes the connections between cells. The board detects when a player places a cell adjacent to their existing cells and creates visual extensions.

- **Game Class**: Orchestrates the game flow, manages player turns, and integrates with scoring mechanisms. It handles transitions between players and determines when the game is over.

- **Cell Class**: Represents individual cells on the board with properties for position, player ownership, and neighbor relationships.

- **AIPlayer Class**: Implements computer opponent logic that evaluates potential moves based on scoring heuristics. The AI considers factors such as openness, centrality, edge proximity, and connection potential.

- **ScoreDisplay and ScoreChart Classes**: Handle visualization of game scores with real-time updates using D3.js for dynamic charting.

### Technical Features

- **Connected Components**: The game detects and manages groups of connected cells belonging to each player.

- **Dynamic Cell Extension**: Visual animations show when cells extend and connect to form larger components.

- **Responsive Visualization**: Game elements are rendered using SVG for scalable graphics.

- **Multiple Game Modes**: Support for player vs. player and player vs. AI gameplay.

- **Interactive Controls**: Game controls for resetting, toggling connections, and switching game modes.

- **Score Tracking**: Real-time score tracking with visual charts showing the progression of scores throughout the game.

### Implementation Details

- Uses D3.js for DOM manipulation and data visualization
- Implements a grid-based game board with interactive cells
- Uses SVG transitions for smooth visual effects
- Employs modular JavaScript with ES6 modules for code organization
- Implements heuristic-based AI opponent with configurable difficulty

## TODO

* Bug fix: sometimes we skip the AI's move
* UI/UX
    * Undo move

## Scoring Mechanisms

### Cell-Multiplication
> Product of the size (number of cells) of the connected components

Players earn points based on the product of their connected clusters. If a player has clusters containing 2, 3, and 4 cells, their score is 2 x 3 x 4 = 24 points. The challenge is in strategically grouping cells to maximize the overall multiplication effect.

### Cell-Connection
> The total number of directed edges (connections)

Players score points by creating as many connections as possible between their cells. The more connected a player's cells are, the higher their score. Blocking opponents by strategically placing cells can also play a key role in controlling the board.

### Cell-Maximization
> The size of the largest connected component

Only the largest connected cluster of a player's cells contributes to their score. The goal is to build the biggest continuous group while preventing opponents from forming larger ones.

### Cell-Extension
> The total number of undirected edges (extensions)

This is not a very interesting scoring mechanism.

