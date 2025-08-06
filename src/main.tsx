import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// Load rating system testing tools in development
if (import.meta.env.DEV) {
  import('./utils/testRatingSystem');
  import('./utils/comprehensiveRatingTest');
  import('./utils/testEWMA');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)