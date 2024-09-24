import React, { useState } from 'react';

function App() {
  const [sessionCode, setSessionCode] = useState('');

  const handleJoinSession = () => {
    alert(`Joining session with code: ${sessionCode}`);
  };

  return (
    <div className="App" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Bar Voting App</h1>
      <input
        type="text"
        placeholder="Enter session code"
        value={sessionCode}
        onChange={(e) => setSessionCode(e.target.value)}
      />
      <br /><br />
      <button onClick={handleJoinSession}>Join Session</button>
    </div>
  );
}

export default App;
