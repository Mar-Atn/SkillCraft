import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// Rating system testing tools moved to /experiments/rating-tests/
// Uncomment for development testing if needed:
// if (import.meta.env.DEV) {
//   console.log('Rating system tests available in /experiments/rating-tests/');
// }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)