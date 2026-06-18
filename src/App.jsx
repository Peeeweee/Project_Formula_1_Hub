import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import StartHere from './pages/StartHere';
import Racers from './pages/Racers';
import Cars from './pages/Cars';
import LiveSeason from './pages/LiveSeason';
import PitWallAI from './pages/PitWallAI';
import { ErrorBoundary } from './components';
import { useOnlineStatus } from './hooks/useOnlineStatus';

const navLinks = [
  { path: '/', label: 'Start Here' },
  { path: '/racers', label: 'Racers' },
  { path: '/cars', label: 'Cars' },
  { path: '/live-season', label: 'Live Season' },
  { path: '/pit-wall-ai', label: 'Pit Wall AI' }
];

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="w-full"
    >
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </motion.div>
  );
};

function MainApp() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isOnline = useOnlineStatus();

  // Close menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-f1-dark text-f1-light overflow-x-hidden flex flex-col">
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0f] border-b-2 border-f1-red h-16 flex items-center px-4 md:px-12 justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 relative z-50">
          <span className="font-extrabold tracking-wider text-f1-light text-md md:text-lg">
            FORMULA
          </span>
          <span className="font-extrabold tracking-wider text-[#e10600] text-md md:text-lg">
            DC-1
          </span>
        </NavLink>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex h-full items-center">
          {navLinks.map(tab => {
            const isActive = location.pathname === tab.path || (tab.path === '/' && location.pathname === '');
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`relative h-full flex items-center px-6 font-bold uppercase tracking-wider text-xs transition-colors duration-300 ${isActive ? 'text-f1-light' : 'text-f1-muted hover:text-f1-light'}`}
                end={tab.path === '/'}
              >
                <span className="relative z-10">{tab.label}</span>
                {isActive && (
                  <>
                    <motion.div
                      layoutId="activeTabBorder"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-f1-red z-0"
                    />
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-f1-red/5 z-0"
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Mobile Hamburger Icon */}
        <button 
          className="md:hidden text-f1-light relative z-50 p-2 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <div className="w-6 flex flex-col gap-1.5 items-end">
            <motion.span 
              animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 8 : 0 }} 
              className="w-full h-0.5 bg-f1-light block origin-left transition-all"
            />
            <motion.span 
              animate={{ opacity: isMobileMenuOpen ? 0 : 1 }} 
              className="w-4 h-0.5 bg-f1-light block transition-all"
            />
            <motion.span 
              animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }} 
              className="w-full h-0.5 bg-f1-light block origin-left transition-all"
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-[#0a0a0f] pt-20 px-6 pb-6 md:hidden flex flex-col gap-4 overflow-y-auto"
          >
            {navLinks.map(tab => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) => 
                  `block p-4 border-l-4 font-black uppercase tracking-wider text-lg transition-all ${
                    isActive 
                      ? 'border-f1-red text-f1-light bg-f1-red/10' 
                      : 'border-transparent text-f1-muted hover:text-f1-light hover:bg-[#1a1a24]'
                  }`
                }
                end={tab.path === '/'}
              >
                {tab.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-16 left-0 right-0 z-40 bg-f1-red text-white text-center py-2 text-sm font-bold uppercase tracking-wider shadow-lg"
          >
            You are offline. Some data may be outdated.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content Container */}
      <div className="flex-1 relative flex flex-col">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><StartHere /></PageWrapper>} />
            <Route path="/racers" element={<PageWrapper><Racers /></PageWrapper>} />
            <Route path="/cars" element={<PageWrapper><Cars /></PageWrapper>} />
            <Route path="/live-season" element={<PageWrapper><LiveSeason /></PageWrapper>} />
            <Route path="/pit-wall-ai" element={<PageWrapper><PitWallAI /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;
