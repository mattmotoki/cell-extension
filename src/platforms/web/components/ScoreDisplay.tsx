import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { PlayerIndex, BoardState, ScoringMechanismId } from '@core/types';
import { getConnectedComponents, parsePositionKey, createPositionKey } from '@core/game/GameBoardLogic';
import { RootState } from '@core/store';
import * as d3 from 'd3';

const ScoreDisplay: React.FC = () => {
  const scores = useSelector((state: RootState) => state.game.scores);
  const currentPlayer = useSelector((state: RootState) => state.game.currentPlayer);
  const boardState = useSelector((state: RootState) => state.game.boardState);
  const scoringMechanism = useSelector((state: RootState) => state.settings.scoringMechanism);
  const playerColors = ["#00FF00", "#1E90FF"];

  const scoresRef = useRef<HTMLDivElement>(null);
  const breakdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateScoreDisplay();
  }, [scores, currentPlayer, boardState, scoringMechanism]);

  const getAdjacentPositions = (gridX: number, gridY: number): [number, number][] => {
    return [
      [gridX + 1, gridY],
      [gridX - 1, gridY],
      [gridX, gridY + 1],
      [gridX, gridY - 1]
    ];
  };

  const calculateComponentSize = (component: string[], scoringMech: ScoringMechanismId): number => {
    if (component.length === 1) return 1;
    
    switch(scoringMech) {
      case 'cell-multiplication':
        return component.length;
          
      case 'cell-connection':
        let connectionCount = 0;
        
        for (let cellKey of component) {
          const [gridX, gridY] = parsePositionKey(cellKey);
          
          const adjacentPositions = getAdjacentPositions(gridX, gridY);
          
          for (let [adjX, adjY] of adjacentPositions) {
            const adjKey = createPositionKey(adjX, adjY);
            if (component.includes(adjKey)) {
              connectionCount++;
            }
          }
        }
        
        return connectionCount / 2;
          
      case 'cell-extension':
        let extensionSum = 0;
        const processedEdges = new Set<string>();
        
        for (let cellKey of component) {
          const [gridX, gridY] = parsePositionKey(cellKey);
          
          const adjacentPositions = getAdjacentPositions(gridX, gridY);
          
          for (let [adjX, adjY] of adjacentPositions) {
            const adjKey = createPositionKey(adjX, adjY);
            
            if (component.includes(adjKey)) {
              const edge = cellKey < adjKey 
                ? `${cellKey}-${adjKey}` 
                : `${adjKey}-${cellKey}`;
              
              if (!processedEdges.has(edge)) {
                extensionSum++;
                processedEdges.add(edge);
              }
            }
          }
        }
        
        return extensionSum > 0 ? extensionSum : 1;
          
      default:
        return component.length;
    }
  };

  const calculateBreakdownText = (score: number, components: string[][], scoringMech: ScoringMechanismId): string => {
    if (score === 0 || !components || components.length === 0) {
      return `${score} = 0`;
    }
    
    const componentSizes = components.map(component => {
      return calculateComponentSize(component, scoringMech);
    });
    
    const sizesText = componentSizes.sort((a, b) => b - a).join('×');
    return `${score} = ${sizesText}`;
  };

  const updateScoreDisplay = () => {
    if (!scoresRef.current || !breakdownRef.current) return;

    const componentsP1 = getConnectedComponents(boardState, 0);
    const componentsP2 = getConnectedComponents(boardState, 1);
    
    const breakdownText1 = calculateBreakdownText(scores[0], componentsP1, scoringMechanism);
    const breakdownText2 = calculateBreakdownText(scores[1], componentsP2, scoringMechanism);
    
    const player1Color = playerColors[0];
    const player2Color = playerColors[1];
    
    const player1LabelStyle = currentPlayer === 0 
      ? `color: ${player1Color}; font-weight: 600; border-bottom: 2px solid ${player1Color};` 
      : `color: ${player1Color}; font-weight: 500;`;
        
    const player2LabelStyle = currentPlayer === 1 
      ? `color: ${player2Color}; font-weight: 600; border-bottom: 2px solid ${player2Color};` 
      : `color: ${player2Color}; font-weight: 500;`;
    
    scoresRef.current.innerHTML = `
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <div style="text-align: left; padding-right: 10px;">
          <div style="${player1LabelStyle}">Player 1: ${scores[0]}</div>
        </div>
        <div style="text-align: right; padding-left: 10px;">
          <div style="${player2LabelStyle}">Player 2: ${scores[1]}</div>
        </div>
      </div>
    `;
    
    breakdownRef.current.innerHTML = `
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <div style="text-align: left; padding-right: 10px;">
          <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em; opacity: 0.9; color: ${player1Color};">${breakdownText1}</div>
        </div>
        <div style="text-align: right; padding-left: 10px;">
          <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em; opacity: 0.9; color: ${player2Color};">${breakdownText2}</div>
        </div>
      </div>
    `;
  };

  const scoringDescription = scoringMechanism.replace('cell-','').replace('-', ' ');

  return (
    <div id="scores-container" title={`Scoring: ${scoringDescription}`}>
      <div id="player-scores" ref={scoresRef}></div>
      <div id="score-breakdown" ref={breakdownRef}></div>
    </div>
  );
};

export default ScoreDisplay; 