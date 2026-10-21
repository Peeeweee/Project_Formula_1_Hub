import './styles/learning-upgrades.css';
import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
const StartHere = lazy(() => import('./pages/StartHere'));
const Racers = lazy(() => import('./pages/Racers'));
const Cars = lazy(() => import('./pages/Cars'));
const LiveSeason = lazy(() => import('./pages/LiveSeason'));
const PitWallAI = lazy(() => import('./pages/PitWallAI'));
const AllTimeRecords = lazy(() => import('./pages/AllTimeRecords'));
const Circuits = lazy(() => import('./pages/Circuits'));
const Strategy = lazy(() => import('./pages/Strategy'));
const News = lazy(() => import('./pages/News'));
const Garage3D = lazy(() => import('./pages/Garage3D'));
import ErrorBoundary from './components/ErrorBoundary';
import AnimatedBackground from './components/AnimatedBackground';
import IntroScreen from './components/IntroScreen';

const WatchRace = lazy(() => import('./pages/WatchRace'));
import useDialogAccessibility from './hooks/useDialogAccessibility';
const GlobalSearch = lazy(() => import('./components/GlobalSearch'));
import { useOnlineStatus } from './hooks/useOnlineStatus';
import f1LogoSrc from './assets/f1_logo.svg';

const navLinks = [
  { path: '/', label: 'Learn F1' },
  { path: '/watch', label: 'Watch a Race' },
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

const PageWrapper = ({ children }) => <div className="w-full ambient-page-surface"><ErrorBoundary><Suspense fallback={<div role="status" className="pt-28 pb-12 text-center text-f1-muted">Loading page…</div>}>{children}</Suspense></ErrorBoundary></div>;

function MainApp({ introPlaying }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isOnline = useOnlineStatus();
  const mobileNavRef = useDialogAccessibility(isMobileMenuOpen, () => setIsMobileMenuOpen(false));

  const [navGroup, setNavGroup] = useState(null);
  const groups = [
    { label: 'Explore', paths: ['/racers', '/cars', '/circuits', '/all-time', '/pit-wall-ai', '/garage'] },
    { label: 'Follow the Season', paths: ['/live-season', '/news'] },
  ];

  // Close menu and scroll to the requested lesson when the route changes
  useEffect(() => {
    const anchor = new URLSearchParams(location.search).get('section') || location.hash.slice(1);
    if (!anchor) window.scrollTo(0, 0);
    // Lazy pages may mount after the route effect; observe until the anchor appears.
    const scroll = () => {
      const target = anchor && document.getElementById(anchor);
      if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
      return Boolean(target);
    };
    if (!anchor || scroll()) return;
    const observer = new MutationObserver(() => { if (scroll()) observer.disconnect(); });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname, location.hash, location.search]);

  // Ctrl+K / Cmd+K global shortcut for search
  const handleGlobalKey = useCallback((e) => {
    if (e.key === 'Escape') { setNavGroup(null); setIsMobileMenuOpen(false); }
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
      <a href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }} className="skip-link">Skip to content</a>
      {isSearchOpen && <Suspense fallback={null}><GlobalSearch isOpen onClose={() => setIsSearchOpen(false)} /></Suspense>}
      <AnimatedBackground path={location.pathname} enabled={!introPlaying} />
      <div className="relative z-10 flex-1 flex flex-col w-full">
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0f] border-b-2 border-f1-red h-16 flex items-center px-4 md:px-12 justify-between">
        {/* Logo */}
        <NavLink 
          to="/" 
          className="flex items-center gap-3 relative z-50 group"
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
          <NavLink to="/" end className="nav-learn-link">Learn F1</NavLink>
          {groups.map(group => (
            <div key={group.label} className="relative h-full flex items-center" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setNavGroup(null); }}>
              <button aria-expanded={navGroup === group.label} aria-controls={`nav-${group.label.replaceAll(' ', '-')}`} onClick={() => setNavGroup(navGroup === group.label ? null : group.label)} className={`h-full px-3 lg:px-5 text-xs font-bold uppercase tracking-wide ${group.paths.includes(location.pathname) ? 'text-white border-b-2 border-f1-red' : 'text-f1-muted hover:text-white'}`}>{group.label} ▾</button>
              {navGroup === group.label && <div id={`nav-${group.label.replaceAll(' ', '-')}`} className="absolute top-16 right-0 w-56 rounded-b-xl border border-f1-border bg-[#0a0a0f] p-2 shadow-xl">
                {navLinks.filter(tab => group.paths.includes(tab.path)).map(tab => <NavLink key={tab.path} to={tab.path} end={tab.path === '/'} onClick={() => setNavGroup(null)} className={({ isActive }) => `block rounded-lg px-4 py-3 text-sm font-bold ${isActive ? 'bg-f1-red/15 text-white' : 'text-f1-muted hover:bg-white/5 hover:text-white'}`}>{tab.label}</NavLink>)}
              </div>}
            </div>
          ))}


          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="nav-search" aria-label="Search"
            title="Search (Ctrl+K)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <span className="hidden lg:inline">Search</span>
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
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
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
            ref={mobileNavRef} role="dialog" aria-modal="true" aria-label="Navigation" tabIndex={-1} id="mobile-navigation" className="fixed inset-0 z-40 bg-[#0a0a0f] pt-20 px-6 pb-6 md:hidden flex flex-col gap-4 overflow-y-auto"
          >
            <button className="self-end px-4 py-2 text-white font-bold" onClick={() => setIsMobileMenuOpen(false)}>Close menu ✕</button>
            {navLinks.map(tab => (
              <NavLink
                key={tab.path}
                to={tab.path}
                onClick={() => setIsMobileMenuOpen(false)}
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
      <main id="main-content" tabIndex={-1} className="flex-1 relative flex flex-col">
        <>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><StartHere /></PageWrapper>} />
            <Route path="/watch" element={<PageWrapper><WatchRace /></PageWrapper>} />
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
        </>
      </main>
      </div>
    </div>
  );
}

function App() {
  const [introPlaying, setIntroPlaying] = useState(true);
  const finishIntro = useCallback(() => {
    setIntroPlaying(false);
    requestAnimationFrame(() => document.getElementById('main-content')?.focus({ preventScroll: true }));
  }, []);
  return <MotionConfig reducedMotion="user"><Router>
    <div inert={introPlaying} aria-hidden={introPlaying || undefined}><MainApp introPlaying={introPlaying} /></div>
    {introPlaying && <IntroScreen onComplete={finishIntro} />}
  </Router></MotionConfig>;
}

export default App;
