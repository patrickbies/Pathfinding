import './App.css';
import React, { useState } from 'react'
import Pathfinding from './Pathfinding';

function App() {
  return (
    <div className="App">
      <Pathfinding
              w={60}
              h={25}
            />
    </div>
  );
}

export default App;
