import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    // We point to localhost for now; tomorrow we change this to your Render URL
    fetch('https://ai-backend-poorva.onrender.com/api/greet?name=Poorva')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => setMessage("Backend not reached."));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>{message}</h1>
      <p>If you see a greeting above, your connection is working!</p>
    </div>
  );
}

export default App;