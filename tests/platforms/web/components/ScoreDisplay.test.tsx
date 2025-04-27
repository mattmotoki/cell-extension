import React from 'react';
import { screen } from '@testing-library/react';
import ScoreDisplay from '@web/components/ScoreDisplay';
import { renderWithProviders } from '../../../setup/testUtils';

describe('ScoreDisplay Component', () => {
  // Setup some test states
  const equalScoreState = {
    game: {
      boardState: Array(5).fill(Array(5).fill(null)),
      moveHistory: [],
      currentPlayer: 0,
      scores: [3, 3],
      progress: 'playing',
    },
    settings: {
      boardSize: 5,
      playerMode: 'human',
      firstPlayer: 0,
      scoringMechanism: 'cell-extension',
      aiDifficulty: 'medium',
    }
  };

  const player1WinningState = {
    game: {
      boardState: Array(5).fill(Array(5).fill(null)),
      moveHistory: [],
      currentPlayer: 1,
      scores: [5, 2],
      progress: 'playing',
    },
    settings: {
      boardSize: 5,
      playerMode: 'human',
      firstPlayer: 0,
      scoringMechanism: 'cell-extension',
      aiDifficulty: 'medium',
    }
  };

  const player2WinningState = {
    game: {
      boardState: Array(5).fill(Array(5).fill(null)),
      moveHistory: [],
      currentPlayer: 0,
      scores: [2, 7],
      progress: 'playing',
    },
    settings: {
      boardSize: 5,
      playerMode: 'human',
      firstPlayer: 0,
      scoringMechanism: 'cell-extension',
      aiDifficulty: 'medium',
    }
  };

  it('renders player scores correctly', () => {
    renderWithProviders(<ScoreDisplay />, { preloadedState: equalScoreState });
    
    // Check for player labels
    expect(screen.getByText(/player 1/i)).toBeInTheDocument();
    expect(screen.getByText(/player 2/i)).toBeInTheDocument();
    
    // Check for score values
    expect(screen.getByText('3')).toBeInTheDocument(); // Player 1 score
    expect(screen.getAllByText('3')).toHaveLength(2); // Both players have score 3
  });

  it('highlights the current player', () => {
    renderWithProviders(<ScoreDisplay />, { preloadedState: player1WinningState });
    
    // Get player score containers
    const player1Score = screen.getByTestId('player-0-score');
    const player2Score = screen.getByTestId('player-1-score');
    
    // Since currentPlayer is 1 (player 2's turn), player 2 should be highlighted
    expect(player2Score).toHaveClass('current-player');
    expect(player1Score).not.toHaveClass('current-player');
  });

  it('shows player 1 as winning when their score is higher', () => {
    renderWithProviders(<ScoreDisplay />, { preloadedState: player1WinningState });
    
    // Player 1 has 5 points vs Player 2's 2 points
    const player1Score = screen.getByTestId('player-0-score');
    const player2Score = screen.getByTestId('player-1-score');
    
    expect(player1Score).toHaveClass('winning');
    expect(player2Score).not.toHaveClass('winning');
  });

  it('shows player 2 as winning when their score is higher', () => {
    renderWithProviders(<ScoreDisplay />, { preloadedState: player2WinningState });
    
    // Player 2 has 7 points vs Player 1's 2 points
    const player1Score = screen.getByTestId('player-0-score');
    const player2Score = screen.getByTestId('player-1-score');
    
    expect(player1Score).not.toHaveClass('winning');
    expect(player2Score).toHaveClass('winning');
  });

  it('shows tied status when scores are equal', () => {
    renderWithProviders(<ScoreDisplay />, { preloadedState: equalScoreState });
    
    // Both players have 3 points
    const player1Score = screen.getByTestId('player-0-score');
    const player2Score = screen.getByTestId('player-1-score');
    
    // Neither should have 'winning' class but both could have a 'tied' class
    expect(player1Score).not.toHaveClass('winning');
    expect(player2Score).not.toHaveClass('winning');
    
    // If your implementation has a 'tied' class, you could test for that
    // expect(player1Score).toHaveClass('tied');
    // expect(player2Score).toHaveClass('tied');
  });

  it('displays AI opponent label when in AI mode', () => {
    const aiModeState = {
      ...player1WinningState,
      settings: {
        ...player1WinningState.settings,
        playerMode: 'ai',
      }
    };
    
    renderWithProviders(<ScoreDisplay />, { preloadedState: aiModeState });
    
    // Check if AI label is displayed instead of "Player 2"
    expect(screen.getByText(/ai/i)).toBeInTheDocument();
  });
}); 