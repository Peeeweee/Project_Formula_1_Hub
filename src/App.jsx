import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import StartHere from './pages/StartHere';
import Racers from './pages/Racers';
import Cars from './pages/Cars';
import LiveSeason from './pages/LiveSeason';
import PitWallAI from './pages/PitWallAI';
import AllTimeRecords from './pages/AllTimeRecords';
import Circuits from './pages/Circuits';
import Strategy from './pages/Strategy';
import News from './pages/News';
import Garage3D from './pages/Garage3D';
import { ErrorBoundary, IntroScreen, AnimatedBackground } from './components';
import GlobalSearch from './components/GlobalSearch';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import f1LogoSrc from './assets/f1_logo.svg';

const navLinks = [
  { path: '/', label: 'Start Here' },
  { path: '/news', label: 'News Wire' },
  { path: '/racers', label: 'Racers' },
  { path: '/cars', label: 'Cars' },
  { path: '/circuits', label: 'Circuits' },
  { path: '/strategy', label: 'Strategy' },
  { path: '/live-season', label: 'Live Season' },
  { path: '/all-time', label: 'All-Time Records' },
  { path: '/pit-wall-ai', label: 'Pit Wall AI' },
  { path: '/garage', label: '3D Garage' },
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

function MainApp({ onResetIntro }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isOnline = useOnlineStatus();

  // Close menu and scroll to top when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Ctrl+K / Cmd+K global shortcut for search
  const handleGlobalKey = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setIsSearchOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, [handleGlobalKey]);

  return (
    <div className="min-h-screen bg-f1-dark text-f1-light overflow-x-hidden flex flex-col">
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AnimatedBackground isStartHere={location.pathname === '/'} />
      <div className="relative z-10 flex-1 flex flex-col w-full">
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0f] border-b-2 border-f1-red h-16 flex items-center px-4 md:px-12 justify-between">
        {/* Logo */}
        <NavLink 
          to="/" 
          className="flex items-center gap-3 relative z-50 group"
          onClick={() => {
            if (onResetIntro) onResetIntro();
          }}
        >
          {/* Official F1 Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src={f1LogoSrc}
              alt="Formula 1"
              style={{ height: '22px', width: 'auto' }}
            />
          </motion.div>

          {/* Divider */}
          <span className="w-px h-5 bg-white/20 shrink-0" />

          {/* Custom Brand */}
          <div className="flex items-center gap-1">
            <span className="font-extrabold tracking-wider text-f1-light text-md md:text-lg leading-none">
              FORMULA
            </span>
            <span className="font-extrabold tracking-wider text-[#e10600] text-md md:text-lg leading-none">
              DC-1
            </span>
          </div>
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

          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="ml-2 h-8 flex items-center gap-2 px-3 rounded bg-[#0e0e15] border border-f1-red/30 text-f1-red hover:bg-f1-red hover:text-white hover:border-f1-red transition-all text-xs font-bold font-mono uppercase tracking-widest shadow-[0_0_15px_rgba(225,6,0,0.15)] hover:shadow-[0_0_20px_rgba(225,6,0,0.4)]"
            title="Search (Ctrl+K)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <span className="hidden lg:inline">CTRL+K</span>
          </button>
        </div>

        {/* Mobile: Search + Hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="text-f1-light relative z-50 p-2 focus:outline-none"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>
        <button 
          className="text-f1-light relative z-50 p-2 focus:outline-none"
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
        </div>
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
            <Route path="/news" element={<PageWrapper><News /></PageWrapper>} />
            <Route path="/racers" element={<PageWrapper><Racers /></PageWrapper>} />
            <Route path="/cars" element={<PageWrapper><Cars /></PageWrapper>} />
            <Route path="/circuits" element={<PageWrapper><Circuits /></PageWrapper>} />
            <Route path="/strategy" element={<PageWrapper><Strategy /></PageWrapper>} />
            <Route path="/live-season" element={<PageWrapper><LiveSeason /></PageWrapper>} />
            <Route path="/all-time" element={<PageWrapper><AllTimeRecords /></PageWrapper>} />
            <Route path="/pit-wall-ai" element={<PageWrapper><PitWallAI /></PageWrapper>} />
            <Route path="/garage" element={<PageWrapper><Garage3D /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}

function App() {
  const [introComplete, setIntroComplete] = useState(false);

  React.useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("fdc1_intro_seen");
    if (hasSeenIntro) {
      setIntroComplete(true);
    }
  }, []);

  const handleResetIntro = () => {
    sessionStorage.removeItem("fdc1_intro_seen");
    setIntroComplete(false);
  };

  return (
    <Router>
      {!introComplete && <IntroScreen onComplete={() => setIntroComplete(true)} />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: introComplete ? 'block' : 'none' }}
      >
        <MainApp onResetIntro={handleResetIntro} />
      </motion.div>
    </Router>
  );
}

export default App;
