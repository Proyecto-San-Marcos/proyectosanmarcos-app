import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import HomeStatic from './pages/static/home.jsx'
import HomeApp from './pages/app/Home.jsx'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<HomeStatic />} />
        <Route path="/app/" element={<HomeApp />} />
      </Routes>
    </Router>
  </StrictMode>,
)