import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import StartHere from './pages/StartHere';
import Racers from './pages/Racers';
import Cars from './pages/Cars';
import LiveSeason from './pages/LiveSeason';
import PitWallAI from './pages/PitWallAI';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-f1-dark text-f1-light">
        {/* Fixed Navigation Bar */}
        <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0f] border-b-2 border-f1-red h-16 flex items-center px-4 md:px-12 justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <span className="bg-f1-red text-f1-light font-black px-2.5 py-0.5 rounded-sm tracking-wider text-xl transform -skew-x-12 shadow-md shadow-f1-red/20">
              F1
            </span>
            <span className="font-extrabold tracking-wider text-f1-light text-md md:text-lg">
              INSIGHT HUB
            </span>
          </NavLink>

          {/* Navigation Links */}
          <div className="flex gap-2 md:gap-6 h-full items-center">
            {[
              { path: '/', label: 'Start Here' },
              { path: '/racers', label: 'Racers' },
              { path: '/cars', label: 'Cars' },
              { path: '/live-season', label: 'Live Season' },
              { path: '/pit-wall-ai', label: 'Pit Wall AI' }
            ].map(tab => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) => 
                  `h-full flex items-center px-1.5 md:px-4 border-b-2 font-bold uppercase tracking-wider text-[10px] md:text-xs transition-all duration-300 ${
                    isActive 
                      ? 'border-f1-red text-f1-light bg-f1-red/5' 
                      : 'border-transparent text-f1-muted hover:text-f1-light'
                  }`
                }
                end={tab.path === '/'}
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Page Content Container */}
        <div>
          <Routes>
            <Route path="/" element={<StartHere />} />
            <Route path="/racers" element={<Racers />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/live-season" element={<LiveSeason />} />
            <Route path="/pit-wall-ai" element={<PitWallAI />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
