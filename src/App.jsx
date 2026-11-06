import { useEffect, useRef, useState } from 'react';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import PlayerForm from './components/PlayerForm';
import Ranking from './components/Ranking';
import { ZooHeader, ZooFooter } from './components/ZooShell';
import { useTimer } from './hooks/useTimer';
import { useGameLogic } from './hooks/useGameLogic';
import { DIFFICULTY_LEVELS } from './utils/gameConfig';
import { addResult, readRanking, saveRanking } from './utils/ranking';
import './App.css';
import './Zoo.css';
import './PlayerFlow.css';

const difficulty = DIFFICULTY_LEVELS[1];

function GameSession({ player, onFinish, onRestart }) {
  const game = useGameLogic(difficulty);
  const timer = useTimer(game.gameStarted, game.gameComplete);
  const finished = useRef(false);

  useEffect(() => {
    if ((game.gameComplete || timer.seconds >= 60) && !finished.current) {
      finished.current = true;
      onFinish({ completed: game.gameComplete, timedOut: !game.gameComplete, time: Math.min(timer.seconds, 60), moves: game.moves });
    }
  }, [game.gameComplete, game.moves, timer.seconds, onFinish]);

  const endGame = () => {
    if (finished.current) return;
    finished.current = true;
    onFinish({ completed: game.gameComplete, time: timer.seconds, moves: game.moves });
  };

  return <>
    <p className="player-greeting">¡A jugar, {player.name}! Tienes 1 minuto desde la primera carta.</p>
    <GameControls moves={game.moves} seconds={timer.seconds} formatTime={timer.formatTime}
      onRestart={onRestart} onGameOver={endGame} gameComplete={game.gameComplete} />
    <GameBoard cards={game.cards} onCardClick={game.flipCard} difficulty={difficulty}
      isDisabled={game.flippedCards.length >= 2 || game.gameComplete || timer.seconds >= 60} isShuffling={false} />
  </>;
}

export default function MemoryCardGame() {
  const [screen, setScreen] = useState('registration');
  const [player, setPlayer] = useState(null);
  const [sessionId, setSessionId] = useState(0);
  const [ranking, setRanking] = useState(readRanking);
  const [result, setResult] = useState(null);
  const [storageError, setStorageError] = useState(false);

  const start = () => {
    setSessionId(id => id + 1);
    setScreen('game');
  };
  const finish = outcome => {
    const entry = { ...outcome, name: player.name, playerId: player.email };
    if (outcome.completed) {
      const updated = addResult(ranking, entry);
      setRanking(updated);
      setStorageError(!saveRanking(updated));
    }
    setResult(entry);
    setScreen('ranking');
  };

  return (
    <div className={`memory-game ${screen === 'registration' ? 'registration-screen' : screen === 'game' ? 'game-screen' : ''}`}>
      <ZooHeader />
      <header className="game-header">
        <h1>Memory Zoo</h1>
        <p>Encuentra todas las parejas y disfruta un momento Zoo.</p>
      </header>
      <main id="juego" className="game-main">
        {screen === 'registration' && <PlayerForm onPlay={details => { setPlayer(details); start(); }} />}
        {screen === 'game' && <GameSession key={sessionId} player={player} onFinish={finish} onRestart={start} />}
        {screen === 'ranking' && <Ranking entries={ranking} result={result} storageError={storageError}
          onPlayAgain={start} onNewPlayer={() => { setPlayer(null); setScreen('registration'); }} />}
      </main>
      <ZooFooter />
    </div>
  );
}
