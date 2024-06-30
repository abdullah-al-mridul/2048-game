import React, { useState, useEffect, useRef } from "react";
import BGM from "../assets/mp3/preloader.mp3"; // Import background music file
import { FaPlay } from "react-icons/fa"; // Import play icon from react-icons library
import { FaPause } from "react-icons/fa"; // Import pause icon from react-icons library

const App = () => {
  const [board, setBoard] = useState([]); // State to manage the game board
  const [score, setScore] = useState(0); // State to manage the score
  const [gameOver, setGameOver] = useState(false); // State to track game over status
  const [disco, setDisco] = useState(false); // State to toggle disco effect
  const [audioPlay, setAudioPlay] = useState(true); // State to toggle audio play
  const audioRef = useRef(null); // Reference to the audio element

  // Initialize the game board and add initial tiles
  useEffect(() => {
    const newBoard = Array.from({ length: 4 }, () =>
      // Create a 4x4 board filled with zeros
      Array.from({ length: 4 }, () => 0)
    );
    addNewTile(newBoard); // Add initial tiles to the board
    setBoard(newBoard); // Set the initial board state

    // Effect cleanup function (equivalent to componentWillUnmount in class components)
    return () => {
      // Clean up event listeners when the component unmounts
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []); // Empty dependency array ensures this effect runs only once after initial render

  // Effect to manage disco effect based on audio play state
  useEffect(() => {
    if (!audioPlay) {
      setDisco(true); // Activate disco effect class
    } else {
      setDisco(false); // Deactivate disco effect class
    }
  }, [audioPlay]); // Run this effect whenever audioPlay state changes

  // Function to add a new tile (2 or 4) to a random empty spot on the board
  const addNewTile = (currentBoard) => {
    let emptySpots = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentBoard[i][j] === 0) {
          emptySpots.push({ x: i, y: j });
        }
      }
    }
    if (emptySpots.length > 0) {
      const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
      currentBoard[spot.x][spot.y] = Math.random() < 0.9 ? 2 : 4; // 90% chance for 2, 10% chance for 4
    }
  };

  // Function to handle keyboard input
  const handleKeyPress = (event) => {
    if (!gameOver) {
      if (event.key === "ArrowUp") moveUp();
      else if (event.key === "ArrowDown") moveDown();
      else if (event.key === "ArrowLeft") moveLeft();
      else if (event.key === "ArrowRight") moveRight();
    }
  };

  // Function to handle merging tiles in a row
  const mergeTiles = (row) => {
    let newRow = row.filter((num) => num !== 0); // Filter out empty tiles (zeros)
    let scoreToAdd = 0; // Variable to store additional score from merged tiles

    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] *= 2; // Merge tiles (double the value)
        scoreToAdd += newRow[i]; // Add merged tile value to score
        newRow[i + 1] = 0; // Set next tile to zero after merging
      }
    }

    newRow = newRow.filter((num) => num !== 0); // Remove zeros again after merging
    while (newRow.length < 4) {
      newRow.push(0); // Ensure row length is 4 by adding zeros at the end
    }

    setScore((prevScore) => prevScore + scoreToAdd); // Update score
    return newRow; // Return the merged row
  };

  // Function to move tiles up
  const moveUp = () => {
    let newBoard = [...board]; // Create a copy of the board
    let moved = false; // Variable to track if any tile moved

    for (let col = 0; col < 4; col++) {
      let row = [];
      for (let rowIdx = 0; rowIdx < 4; rowIdx++) {
        row.push(newBoard[rowIdx][col]); // Extract column into a row array
      }

      let mergedRow = mergeTiles(row); // Merge tiles in the row
      moved = moved || !arraysEqual(row, mergedRow); // Check if any tiles moved

      for (let rowIdx = 0; rowIdx < 4; rowIdx++) {
        newBoard[rowIdx][col] = mergedRow[rowIdx]; // Update board with merged row
      }
    }

    if (moved) {
      addNewTile(newBoard); // Add a new tile after moving
      setBoard(newBoard); // Update board state
      checkGameOver(newBoard); // Check if the game is over
    }
  };

  // Function to move tiles down
  const moveDown = () => {
    let newBoard = [...board]; // Create a copy of the board
    let moved = false; // Variable to track if any tile moved

    for (let col = 0; col < 4; col++) {
      let row = [];
      for (let rowIdx = 3; rowIdx >= 0; rowIdx--) {
        row.push(newBoard[rowIdx][col]); // Extract column into a row array (reversed)
      }

      let mergedRow = mergeTiles(row); // Merge tiles in the row
      moved = moved || !arraysEqual(row, mergedRow); // Check if any tiles moved

      for (let rowIdx = 3; rowIdx >= 0; rowIdx--) {
        newBoard[rowIdx][col] = mergedRow.pop(); // Update board with merged row (reversed)
      }
    }

    if (moved) {
      addNewTile(newBoard); // Add a new tile after moving
      setBoard(newBoard); // Update board state
      checkGameOver(newBoard); // Check if the game is over
    }
  };

  // Function to move tiles left
  const moveLeft = () => {
    let newBoard = [...board]; // Create a copy of the board
    let moved = false; // Variable to track if any tile moved

    for (let row = 0; row < 4; row++) {
      let mergedRow = mergeTiles(newBoard[row]); // Merge tiles in the row
      moved = moved || !arraysEqual(newBoard[row], mergedRow); // Check if any tiles moved
      newBoard[row] = mergedRow; // Update board with merged row
    }

    if (moved) {
      addNewTile(newBoard); // Add a new tile after moving
      setBoard(newBoard); // Update board state
      checkGameOver(newBoard); // Check if the game is over
    }
  };

  // Function to move tiles right
  const moveRight = () => {
    let newBoard = [...board]; // Create a copy of the board
    let moved = false; // Variable to track if any tile moved

    for (let row = 0; row < 4; row++) {
      let mergedRow = mergeTiles(newBoard[row].slice().reverse()).reverse(); // Merge tiles in the row (reversed)
      moved = moved || !arraysEqual(newBoard[row], mergedRow); // Check if any tiles moved
      newBoard[row] = mergedRow; // Update board with merged row (reversed)
    }

    if (moved) {
      addNewTile(newBoard); // Add a new tile after moving
      setBoard(newBoard); // Update board state
      checkGameOver(newBoard); // Check if the game is over
    }
  };

  // Function to check if the game is over (no empty spots and no adjacent tiles with same value)
  const checkGameOver = (currentBoard) => {
    let gameOver = true; // Assume game over initially

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentBoard[i][j] === 0) {
          gameOver = false; // Game is not over if there's an empty spot
        }

        if (
          (i < 3 && currentBoard[i][j] === currentBoard[i + 1][j]) || // Check vertically adjacent tiles
          (j < 3 && currentBoard[i][j] === currentBoard[i][j + 1]) // Check horizontally adjacent tiles
        ) {
          gameOver = false; // Game is not over if there are adjacent tiles with the same value
        }
      }
    }

    setGameOver(gameOver); // Update game over state
  };

  // Helper function to check if two arrays are equal
  const arraysEqual = (arr1, arr2) => {
    return JSON.stringify(arr1) === JSON.stringify(arr2); // Compare arrays by converting them to strings
  };

  // Effect to listen for keyboard events
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress); // Add event listener for keydown

    return () => {
      document.removeEventListener("keydown", handleKeyPress); // Clean up event listener
    };
  }, [board, gameOver]); // Run this effect whenever board or gameOver state changes

  // Function to handle audio play/pause
  const audioPlayHandler = (state) => {
    if (!state === true) {
      audioRef.current.play(); // Play audio if state is true
    } else {
      audioRef.current.pause(); // Pause audio if state is false
    }
  };

  // Effect to log a console message once after component mounts
  useEffect(() => {
    console.log(
      "%c Designed and Developed by Abdullah ", // Log a styled message in the console
      "background-image: linear-gradient(90deg,#8000ff,#6bc5f8); color: white;font-weight:900;font-size:1rem; padding:20px;"
    );
  }, []); // Empty dependency array ensures this effect runs only once after initial render

  // Function to handle touch start event for mobile swipe
  // Function to handle touch start event for mobile swipe
  const handleTouchStart = (event) => {
    event.preventDefault(); // Prevent default touch behavior (e.g., scrolling or refresh)

    const touchStartX = event.touches[0].clientX; // Get initial touch X position
    const touchStartY = event.touches[0].clientY; // Get initial touch Y position

    const handleTouchMove = (event) => {
      event.preventDefault(); // Prevent default touch behavior

      const touchEndX = event.touches[0].clientX; // Get current touch X position
      const touchEndY = event.touches[0].clientY; // Get current touch Y position

      const dx = touchEndX - touchStartX; // Calculate X distance moved
      const dy = touchEndY - touchStartY; // Calculate Y distance moved

      // Determine swipe direction based on the larger movement
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) moveRight(); // Swipe right
        else moveLeft(); // Swipe left
      } else {
        if (dy > 0) moveDown(); // Swipe down
        else moveUp(); // Swipe up
      }

      document.removeEventListener("touchmove", handleTouchMove); // Remove touchmove listener
      document.removeEventListener("touchend", handleTouchEnd); // Remove touchend listener
    };

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove); // Remove touchmove listener
      document.removeEventListener("touchend", handleTouchEnd); // Remove touchend listener
    };

    document.addEventListener("touchmove", handleTouchMove); // Add touchmove listener
    document.addEventListener("touchend", handleTouchEnd); // Add touchend listener
  };

  return (
    <>
      <div className="game-container" onTouchStart={handleTouchStart}>
        {/* Game container */}
        <h1 className="text-[#38bdf8] text-[22px] mb-3 font-bold">2048 GAME</h1>
        <p className="text-[#38bdf8]">Score: {score}</p>
        <div
          className={`game-board bg-[#33415580] border border-[#64748b4d] ${
            gameOver ? "game-over" : ""
          }`}
        >
          {/* Game board */}
          {gameOver && <h2 className="text-[#38bff8c7] mb-3">Game Over!</h2>}
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {/* Render each row of the board */}
              {row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`tile tile-${cell}`}
                >
                  {/* Render each tile */}
                  {cell !== 0 && cell}
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-8 text-[#38bff8c7] font-semibold">
          Use arrow keys or swipe to move tiles
        </p>
        <span
          onClick={() => {
            setAudioPlay(!audioPlay); // Toggle audio play state
            audioPlayHandler(!audioPlay); // Play or pause audio
          }}
          className={`fixed bottom-[10px]  text-[#38bff8c7] right-[10px] cursor-pointer h-[30px] w-[30px] ${
            disco ? "disco-effect" : ""
          }`}
        >
          {/* Toggle play/pause button */}
          {audioPlay ? (
            <FaPlay className="w-full h-full" />
          ) : (
            <FaPause className="w-full h-full" />
          )}
        </span>
        <span className="text-[#38bff8c7]  tracking-[2px] fixed bottom-0 left-[3px] text-[10px]">
          Design and Developed by{" "}
          <a
            href="https://www.facebook.com/abdullah.al.mridul.dev"
            target="_blank"
          >
            Abdullah
          </a>
        </span>
      </div>
      <audio
        style={{ display: "none" }}
        loop
        controls
        ref={audioRef}
        src={BGM}
        type="audio/mp3"
      />
    </>
  );
};

export default App;
