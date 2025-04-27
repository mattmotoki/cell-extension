import {
  getAvailableCells,
  isCellOccupied,
  getAdjacentCoordinatesMap,
  getCellOwner
} from '@core';
import type { BoardState, Coordinates } from '@core';

describe('Game Utilities', () => {
  // Test data - updated for new board structure
  const emptyBoard: BoardState = {
    gridWidth: 3,
    gridHeight: 3,
    occupiedCells: [{}, {}]
  };

  const partiallyFilledBoard: BoardState = {
    gridWidth: 3,
    gridHeight: 3,
    occupiedCells: [
      { 
        '0,0': { gridX: 0, gridY: 0 },
        '1,1': { gridX: 1, gridY: 1 },
        '2,2': { gridX: 2, gridY: 2 }
      },
      { 
        '2,0': { gridX: 2, gridY: 0 },
        '0,2': { gridX: 0, gridY: 2 }
      }
    ]
  };

  const fullBoard: BoardState = {
    gridWidth: 3,
    gridHeight: 3,
    occupiedCells: [
      { 
        '0,0': { gridX: 0, gridY: 0 },
        '0,2': { gridX: 0, gridY: 2 },
        '2,0': { gridX: 2, gridY: 0 },
        '2,2': { gridX: 2, gridY: 2 } 
      },
      { 
        '0,1': { gridX: 0, gridY: 1 },
        '1,0': { gridX: 1, gridY: 0 },
        '1,1': { gridX: 1, gridY: 1 },
        '1,2': { gridX: 1, gridY: 2 },
        '2,1': { gridX: 2, gridY: 1 }
      }
    ]
  };

  describe('getAvailableCells', () => {
    it('should return all cells for an empty board', () => {
      const available = getAvailableCells(emptyBoard);
      
      // 3x3 board should have 9 available cells
      expect(available.length).toBe(9);
      
      // Check that all cells are included
      const coordinates = available.map(cell => `${cell.gridX},${cell.gridY}`).sort();
      expect(coordinates).toEqual([
        '0,0', '0,1', '0,2', 
        '1,0', '1,1', '1,2', 
        '2,0', '2,1', '2,2'
      ].sort());
    });

    it('should return only empty cells for a partially filled board', () => {
      const available = getAvailableCells(partiallyFilledBoard);
      
      // 5 cells are occupied, so 4 should be available
      expect(available.length).toBe(4);
      
      // Convert to strings for easier comparison
      const availableCoords = available.map(coord => `${coord.gridX},${coord.gridY}`).sort();
      
      // These cells should be available
      expect(availableCoords).toContain('1,0');
      expect(availableCoords).toContain('1,2');
      expect(availableCoords).toContain('0,1');
      expect(availableCoords).toContain('2,1');
      
      // These cells should NOT be available
      expect(availableCoords).not.toContain('0,0');
      expect(availableCoords).not.toContain('0,2');
      expect(availableCoords).not.toContain('1,1');
      expect(availableCoords).not.toContain('2,0');
      expect(availableCoords).not.toContain('2,2');
    });

    it('should return an empty array for a full board', () => {
      const available = getAvailableCells(fullBoard);
      expect(available.length).toBe(0);
    });
  });

  describe('isCellOccupied', () => {
    it('should return true for occupied cells', () => {
      expect(isCellOccupied(partiallyFilledBoard, { gridX: 0, gridY: 0 })).toBe(true);
      expect(isCellOccupied(partiallyFilledBoard, { gridX: 2, gridY: 0 })).toBe(true);
    });

    it('should return false for empty cells', () => {
      expect(isCellOccupied(partiallyFilledBoard, { gridX: 1, gridY: 0 })).toBe(false);
      expect(isCellOccupied(partiallyFilledBoard, { gridX: 0, gridY: 1 })).toBe(false);
    });

    it('should return false for coordinates outside the board bounds', () => {
      expect(isCellOccupied(partiallyFilledBoard, { gridX: 3, gridY: 0 })).toBe(false);
      expect(isCellOccupied(partiallyFilledBoard, { gridX: -1, gridY: 0 })).toBe(false);
    });
  });

  describe('getAdjacentCoordinatesMap', () => {
    it('should return all valid adjacent cells for a center cell', () => {
      const center: Coordinates = { gridX: 1, gridY: 1 };
      const adjacentMap = getAdjacentCoordinatesMap(center, 3, 3);
      
      // Should have 8 directions
      expect(Object.keys(adjacentMap).length).toBe(8);
      
      // Check all 8 directions
      expect(adjacentMap['up-left']).toEqual({ gridX: 0, gridY: 0 });
      expect(adjacentMap['up']).toEqual({ gridX: 1, gridY: 0 });
      expect(adjacentMap['up-right']).toEqual({ gridX: 2, gridY: 0 });
      expect(adjacentMap['left']).toEqual({ gridX: 0, gridY: 1 });
      expect(adjacentMap['right']).toEqual({ gridX: 2, gridY: 1 });
      expect(adjacentMap['down-left']).toEqual({ gridX: 0, gridY: 2 });
      expect(adjacentMap['down']).toEqual({ gridX: 1, gridY: 2 });
      expect(adjacentMap['down-right']).toEqual({ gridX: 2, gridY: 2 });
    });

    // For a corner cell, it returns all directions but the invalid ones will be out of bounds
    it('should return all directions for a corner cell', () => {
      const corner: Coordinates = { gridX: 0, gridY: 0 };
      const adjacentMap = getAdjacentCoordinatesMap(corner, 3, 3);
      
      // Should have 8 directions, some out of bounds
      expect(Object.keys(adjacentMap).length).toBe(8);
      
      // Check the valid positions
      expect(adjacentMap['right']).toEqual({ gridX: 1, gridY: 0 });
      expect(adjacentMap['down']).toEqual({ gridX: 0, gridY: 1 });
      expect(adjacentMap['down-right']).toEqual({ gridX: 1, gridY: 1 });
      
      // Check the invalid positions (negative coordinates)
      expect(adjacentMap['up-left']).toEqual({ gridX: -1, gridY: -1 });
      expect(adjacentMap['up']).toEqual({ gridX: 0, gridY: -1 });
      expect(adjacentMap['left']).toEqual({ gridX: -1, gridY: 0 });
    });
  });

  describe('getCellOwner', () => {
    it('should return the player index who owns the cell', () => {
      expect(getCellOwner(partiallyFilledBoard, { gridX: 0, gridY: 0 })).toBe(0);
      expect(getCellOwner(partiallyFilledBoard, { gridX: 2, gridY: 0 })).toBe(1);
    });

    it('should return null for empty cells', () => {
      expect(getCellOwner(partiallyFilledBoard, { gridX: 1, gridY: 0 })).toBeNull();
      expect(getCellOwner(partiallyFilledBoard, { gridX: 0, gridY: 1 })).toBeNull();
    });

    it('should return null for coordinates outside the board bounds', () => {
      expect(getCellOwner(partiallyFilledBoard, { gridX: 3, gridY: 0 })).toBeNull();
      expect(getCellOwner(partiallyFilledBoard, { gridX: -1, gridY: 0 })).toBeNull();
    });
  });
}); 