import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joinSessionCode, setJoinSessionCode] = useState('');
  const [players, setPlayers] = useState([]); // Ensure players always starts as an empty array
  const [leader, setLeader] = useState('');
  const [bars, setBars] = useState(["Bar A", "Bar B", "Bar C", "Bar D"]);  // Ensure bars always starts as a valid array
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [isSessionCreated, setIsSessionCreated] = useState(false);
  const [isJoinedSession, setIsJoinedSession] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(30);  // 30-second countdown timer
  const [isVoting, setIsVoting] = useState(false);  // Track if voting is in progress
  const [errorMessage, setErrorMessage] = useState('');  // To hold any error message

  // Create Session
  const handleCreateSession = async () => {
    try {
      const response = await axios.post(
        'https://parseapi.back4app.com/functions/createSession',
        {},
        {
          headers: {
            'X-Parse-Application-Id': 'm4NgvFAIDaJTAUrhCwjCemFtHmrruxO8bprFftE1',
            'X-Parse-JavaScript-Key': 'potY5gIWktwnentz7lUqN5HzdPsrBtbnP8EfWHQo',
          }
        }
      );
      setSessionCode(response.data.result.sessionId);
      setIsSessionCreated(true);
      setLeader(playerName);  // The person creating the session becomes the leader
      setPlayers([playerName]);  // Add the leader to the players list
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  // Join Session
  const handleJoinSession = async () => {
    try {
      const response = await axios.post(
        'https://parseapi.back4app.com/functions/joinSession',
        { sessionId: joinSessionCode, playerName },
        {
          headers: {
            'X-Parse-Application-Id': 'm4NgvFAIDaJTAUrhCwjCemFtHmrruxO8bprFftE1',
            'X-Parse-JavaScript-Key': 'potY5gIWktwnentz7lUqN5HzdPsrBtbnP8EfWHQo',
          }
        }
      );

      // Set all session state after successfully joining
      setPlayers(response.data.players || []);
      setLeader(response.data.leader || '');
      setBars(response.data.bars || ["Bar A", "Bar B", "Bar C", "Bar D"]);
      setRound(response.data.round || 1);  // Ensure the current round is set
      setCurrentTurn(response.data.currentTurn || 0);  // Set the current turn
      setIsJoinedSession(true);
      setSessionCode(joinSessionCode);
      setGameStarted(response.data.gameStarted || false);  // Set the game state for joiners

      // Clear any previous error message
      setErrorMessage('');

      // Fetch session data again to refresh the leader's view
      fetchSessionData(joinSessionCode);
    } catch (error) {
      console.error("Error joining session:", error);
      setErrorMessage("Error joining the session. Please check the session code and try again.");
    }
  };

  // Function to fetch session data to refresh the view
  const fetchSessionData = async (sessionId) => {
    try {
      const response = await axios.post(
        'https://parseapi.back4app.com/functions/getSessionData',
        { sessionId },
        {
          headers: {
            'X-Parse-Application-Id': 'm4NgvFAIDaJTAUrhCwjCemFtHmrruxO8bprFftE1',
            'X-Parse-JavaScript-Key': 'potY5gIWktwnentz7lUqN5HzdPsrBtbnP8EfWHQo',
          }
        }
      );

      // Update the session state with the latest data
      setPlayers(response.data.players || []);
      setLeader(response.data.leader || '');
      setBars(response.data.bars || ["Bar A", "Bar B", "Bar C", "Bar D"]);
      setRound(response.data.round || 1);
      setCurrentTurn(response.data.currentTurn || 0);
      setGameStarted(response.data.gameStarted || false);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  // Start the game (leader only)
  const handleStartGame = async () => {
    try {
      const response = await axios.post(
        'https://parseapi.back4app.com/functions/startGame',
        { sessionId: sessionCode },
        {
          headers: {
            'X-Parse-Application-Id': 'm4NgvFAIDaJTAUrhCwjCemFtHmrruxO8bprFftE1',
          'X-Parse-JavaScript-Key': 'potY5gIWktwnentz7lUqN5HzdPsrBtbnP8EfWHQo',
          }
        }
      );
      setGameStarted(true);
      startVoting();  // Start the timer when the game starts
    } catch (error) {
      console.error("Error starting the game:", error);
    }
  };

  const startVoting = () => {
    setIsVoting(true);
    setTimer(30);  // Reset timer to 30 seconds

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setIsVoting(false);  // End voting after the timer finishes
          
          // If the timer expires, eliminate a random bar
          if (bars.length > 0) {
            const randomBar = bars[Math.floor(Math.random() * bars.length)];
            handleVoteBan(randomBar);  // Call handleVoteBan with the random bar
          }
        }
        return prev - 1;
      });
    }, 1000);  // Update the timer every second
  };

  // Vote to ban a bar
  const handleVoteBan = async (bar) => {
    try {
      const response = await axios.post(
        'https://parseapi.back4app.com/functions/voteBan',
        { sessionId: sessionCode, bar },
        {
          headers: {
            'X-Parse-Application-Id': 'm4NgvFAIDaJTAUrhCwjCemFtHmrruxO8bprFftE1',
          'X-Parse-JavaScript-Key': 'potY5gIWktwnentz7lUqN5HzdPsrBtbnP8EfWHQo',
          }
        }
      );
      setBars(response.data.remainingBars || []);
      setRound(response.data.round);
      setCurrentTurn(response.data.currentTurn);
      startVoting();  // Start the timer again after each vote
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  return (
    <div className="App" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Bar Voting App</h1>

      {!isSessionCreated && !isJoinedSession && (
        <div>
          <h2>Create a Session</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <br /><br />
          <button onClick={handleCreateSession}>Create Session</button>

          <hr />

          <h2>Join a Session</h2>
          <input
            type="text"
            placeholder="Enter session code"
            value={joinSessionCode}
            onChange={(e) => setJoinSessionCode(e.target.value)}
          />
          <br /><br />
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <br /><br />
          <button onClick={handleJoinSession}>Join Session</button>

          {/* Display error message if it exists */}
          {errorMessage && (
            <div style={{ color: 'red', marginTop: '10px' }}>
              {errorMessage}
            </div>
          )}
        </div>
      )}

      {(isSessionCreated || isJoinedSession) && !gameStarted && (
        <div>
          <h2>Session Code: {sessionCode}</h2>
          <h3>Leader: {leader}</h3>
          <h3>Players:</h3>
          <ul>
            {players.map((player, index) => (
              <li key={index}>{player}</li>
            ))}
          </ul>

          {/* Start game button for the leader */}
          {leader === playerName && (
            <button onClick={handleStartGame}>Start Game</button>
          )}
        </div>
      )}

      {gameStarted && (
        <div>
          <h2>Session Code: {sessionCode}</h2>
          <h3>Round {round}</h3>
          <h3>Current Turn: {players[currentTurn]}</h3>

          {/* Timer display */}
          {isVoting && (
            <div>
              <h3>Time left to vote: {timer} seconds</h3>
            </div>
          )}

          {/* Voting options */}
          <h3>Remaining Bars:</h3>
          <ul>
            {bars.map((bar, index) => (
              <li key={index}>
                {bar}{" "}
                <button
                  onClick={() => handleVoteBan(bar)}
                  disabled={players[currentTurn] !== playerName}
                >
                  Ban
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
