import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

const div = document.querySelector('div')
div.addEventListener('dragstart', (e) => {
  e.preventDefault()
})

div.addEventListener('drop', (e) => {
  e.preventDefault()
})

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
