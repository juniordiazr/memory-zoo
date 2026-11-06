import React, { useLayoutEffect, useRef, useState } from 'react';
import Card from './Card';

const GameBoard = ({ cards, onCardClick, difficulty, isDisabled, isShuffling }) => {
  const boardRef = useRef(null);
  const [availableHeight, setAvailableHeight] = useState(null);

  useLayoutEffect(() => {
    const board = boardRef.current;
    const updateSize = () => {
      // Use the document position so scrolling does not resize the board.
      const top = board.getBoundingClientRect().top + window.scrollY;
      // Reserve the complete footer, including its margin and decorative stripe.
      const footer = document.querySelector('.zoo-footer');
      const footerSpace = footer ? footer.getBoundingClientRect().height + parseFloat(getComputedStyle(footer).marginTop || '0') : 0;
      setAvailableHeight(Math.max(120, window.innerHeight - top - footerSpace - 8));
    };
    const observer = new ResizeObserver(updateSize);
    [board.parentElement, ...document.querySelectorAll('.zoo-header, .game-header, .game-controls, .zoo-footer')]
      .forEach(element => observer.observe(element));
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div 
      ref={boardRef}
      className={`game-board ${isShuffling ? 'shuffling' : ''}`}
      data-difficulty={difficulty.id}
      style={{
        '--board-available-height': availableHeight === null ? undefined : `${availableHeight}px`,
        gridTemplateColumns: `repeat(${difficulty.cols}, 1fr)`,
        gridTemplateRows: `repeat(${difficulty.rows}, 1fr)`
      }}
      role="grid"
      aria-label={`${difficulty.name} difficulty game board with ${cards.length} cards`}
    >
      {cards.map((card) => (
        <Card 
          key={card.id} 
          card={card} 
          onClick={onCardClick}
          isDisabled={isDisabled}
        />
      ))}
    </div>
  );
};

export default GameBoard;