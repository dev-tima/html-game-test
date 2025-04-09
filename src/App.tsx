import { useEffect, useRef } from 'react'
import './App.css'
import { createGame } from './game'

function App() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Check if the game container exists
    if (!gameContainerRef.current) return;
    
    // Create the game instance
    const game = createGame();
    
    // Cleanup function to destroy the game when component unmounts
    return () => {
      game.destroy(true);
    }
  }, []);
  
  return (
    <div className="app">
      <h1>🎲 Emoji Sudoku Game 🎲</h1>
      <div id="game-container" ref={gameContainerRef} />
      <div className="instructions">
        <h2>How to Play</h2>
        <p>1. Click on an empty cell to select it 👆</p>
        <p>2. Click a number from 1-9 below or press keys 1-9 on your keyboard ⌨️</p>
        <p>3. Use the control buttons:</p>
        <p>   🔄 - Restart game</p>
        <p>   🔍 - Check your answers</p>
        <p>   🧩 - Show solution</p>
      </div>
    </div>
  )
}

export default App
