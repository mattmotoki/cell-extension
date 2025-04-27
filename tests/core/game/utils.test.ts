import {
  getAvailableCells,
  isValidMove,
  getAdjacentCoordinates,
  getBoardValue
} from '@core';
import type { BoardState, Coordinates } from '@core';

describe('Game Utilities', () => {
  // Test data
  const emptyBoard: BoardState = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  const partiallyFilledBoard: BoardState = [
    [0, null, 1],
    [null, 0, null],
    [1, null, 0],
  ];

  const fullBoard: BoardState = [
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
  ];

  describe('getAvailableCells', () => {
    it('should return all cells for an empty board', () => {
      const available = getAvailableCells(emptyBoard);
      
      // 3x3 board should have 9 available cells
      expect(available).toHaveLength(9);
      
      // Check that all cells are included
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          expect(available).toContainEqual({ gridX: x, gridY: y });
        }
      }
    });

    it('should return only empty cells for a partially filled board', () => {
      const available = getAvailableCells(partiallyFilledBoard);
      
      // 4 cells are occupied, so 5 should be available
      expect(available).toHaveLength(5);
      
      // Check that only empty cells are included
      expect(available).toContainEqual({ gridX: 1, gridY: 0 });
      expect(available).toContainEqual({ gridX: 0, gridY: 1 });
      expect(available).toContainEqual({ gridX: 2, gridY: 1 });
      expect(available).toContainEqual({ gridX: 1, gridY: 2 });
      
      // Check that occupied cells are NOT included
      expect(available).not.toContainEqual({ gridX: 0, gridY: 0 });
      expect(available).not.toContainEqual({ gridX: 2, gridY: 0 });
      expect(available).not.toContainEqual({ gridX: 1, gridY: 1 });
      expect(available).not.toContainEqual({ gridX: 0, gridY: 2 });
      expect(available).not.toContainEqual({ gridX: 2, gridY: 2 });
    });

    it('should return an empty array for a full board', () => {
      const available = getAvailableCells(fullBoard);
      expect(available).toHaveLength(0);
      expect(available).toEqual([]);
    });
  });

  describe('isValidMove', () => {
    it('should return true for empty cells within board bounds', () => {
      // Valid moves on an empty cell
      expect(isValidMove(partiallyFilledBoard, { gridX: 1, gridY: 0 })).toBe(true);
      expect(isValidMove(partiallyFilledBoard, { gridX: 0, gridY: 1 })).toBe(true);
    });

    it('should return false for occupied cells', () => {
      // Invalid moves on occupied cells
      expect(isValidMove(partiallyFilledBoard, { gridX: 0, gridY: 0 })).toBe(false);
      expect(isValidMove(partiallyFilledBoard, { gridX: 1, gridY: 1 })).toBe(false);
    });

    it('should return false for coordinates outside the board bounds', () => {
      // Invalid moves outside the board
      expect(isValidMove(partiallyFilledBoard, { gridX: 3, gridY: 0 })).toBe(false);
      expect(isValidMove(partiallyFilledBoard, { gridX: -1, gridY: 0 })).toBe(false);
      expect(isValidMove(partiallyFilledBoard, { gridX: 0, gridY: 3 })).toBe(false);
      expect(isValidMove(partiallyFilledBoard, { gridX: 0, gridY: -1 })).toBe(false);
    });
  });

  describe('getAdjacentCoordinates', () => {
    it('should return all adjacent cells for a center cell', () => {
      const center: Coordinates = { gridX: 1, gridY: 1 };
      const adjacent = getAdjacentCoordinates(center, 3, 3);
      
      // Should have 8 adjacent cells (all directions)
      expect(adjacent).toHaveLength(8);
      
      // Check all 8 directions
      expect(adjacent).toContainEqual({ gridX: 0, gridY: 0 }); // top-left
      expect(adjacent).toContainEqual({ gridX: 1, gridY: 0 }); // top
      expect(adjacent).toContainEqual({ gridX: 2, gridY: 0 }); // top-right
      expect(adjacent).toContainEqual({ gridX: 0, gridY: 1 }); // left
      expect(adjacent).toContainEqual({ gridX: 2, gridY: 1 }); // right
      expect(adjacent).toContainEqual({ gridX: 0, gridY: 2 }); // bottom-left
      expect(adjacent).toContainEqual({ gridX: 1, gridY: 2 }); // bottom
      expect(adjacent).toContainEqual({ gridX: 2, gridY: 2 }); // bottom-right
    });

    it('should return only valid adjacent cells for a corner cell', () => {
      const corner: Coordinates = { gridX: 0, gridY: 0 };
      const adjacent = getAdjacentCoordinates(corner, 3, 3);
      
      // Should have 3 adjacent cells for top-left corner
      expect(adjacent).toHaveLength(3);
      
      // Check the 3 valid directions
      expect(adjacent).toContainEqual({ gridX: 1, gridY: 0 }); // right
      expect(adjacent).toContainEqual({ gridX: 0, gridY: 1 }); // bottom
      expect(adjacent).toContainEqual({ gridX: 1, gridY: 1 }); // bottom-right
      
      // Should not contain invalid coordinates
      expect(adjacent).not.toContainEqual({ gridX: -1, gridY: -1 });
      expect(adjacent).not.toContainEqual({ gridX: -1, gridY: 0 });
      expect(adjacent).not.toContainEqual({ gridX: 0, gridY: -1 });
    });

    it('should return only valid adjacent cells for an edge cell', () => {
      const edge: Coordinates = { gridX: 0, gridY: 1 };
      const adjacent = getAdjacentCoordinates(edge, 3, 3);
      
      // Should have 5 adjacent cells for a left edge
      expect(adjacent).toHaveLength(5);
      
      // Check the 5 valid directions
      expect(adjacent).toContainEqual({ gridX: 0, gridY: 0 }); // top
      expect(adjacent).toContainEqual({ gridX: 1, gridY: 0 }); // top-right
      expect(adjacent).toContainEqual({ gridX: 1, gridY: 1 }); // right
      expect(adjacent).toContainEqual({ gridX: 0, gridY: 2 }); // bottom
      expect(adjacent).toContainEqual({ gridX: 1, gridY: 2 }); // bottom-right
    });
  });

  describe('getBoardValue', () => {
    it('should return the value at the specified coordinates', () => {
      expect(getBoardValue(partiallyFilledBoard, { gridX: 0, gridY: 0 })).toBe(0);
      expect(getBoardValue(partiallyFilledBoard, { gridX: 2, gridY: 0 })).toBe(1);
      expect(getBoardValue(partiallyFilledBoard, { gridX: 1, gridY: 1 })).toBe(0);
      expect(getBoardValue(partiallyFilledBoard, { gridX: 1, gridY: 0 })).toBeNull();
    });

    it('should return null for coordinates outside the board bounds', () => {
      expect(getBoardValue(partiallyFilledBoard, { gridX: 3, gridY: 0 })).toBeNull();
      expect(getBoardValue(partiallyFilledBoard, { gridX: -1, gridY: 0 })).toBeNull();
      expect(getBoardValue(partiallyFilledBoard, { gridX: 0, gridY: 3 })).toBeNull();
      expect(getBoardValue(partiallyFilledBoard, { gridX: 0, gridY: -1 })).toBeNull();
    });
  });
}); 