import './styles/learning-upgrades.css';
import './styles/beginner-experience.css';
import './styles/brand.css';
import './styles/responsive.css';
import SiteNavigation from './components/SiteNavigation';
import { Link } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
const Teams = lazy(() => import('./pages/Teams'));
const Dictionary = lazy(() => import('./pages/Dictionary'));
const Venue = lazy(() => import('./pages/Venue'));
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
const GlobalSearch = lazy(() => import('./components/GlobalSearch'));
import { useOnlineStatus } from './hooks/useOnlineStatus';

const PageWrapper = ({ children }) => {
  const { pathname } = useLocation();
  return <div data-page={pathname} className="w-full ambient-page-surface"><ErrorBoundary><Suspense fallback={<div role="status" className="pt-28 pb-12 text-center text-f1-muted">Loading page…</div>}>{children}</Suspense></ErrorBoundary></div>;
};

function MainApp({ introPlaying }) {
  const location = useLocation();
  const requestedSection = new URLSearchParams(location.search).get('section');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isOnline = useOnlineStatus();
  // Close menu and scroll to the requested lesson when the route changes
  useEffect(() => {
    const anchor = requestedSection || location.hash.slice(1);
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
  }, [location.pathname, location.hash, requestedSection]);

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
      <a href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }} className="skip-link">Skip to content</a>
      {isSearchOpen && <Suspense fallback={null}><GlobalSearch isOpen onClose={() => setIsSearchOpen(false)} /></Suspense>}
      <AnimatedBackground path={location.pathname} enabled={!introPlaying} />
      <div className="relative z-10 flex-1 flex flex-col w-full">
      <SiteNavigation onSearch={() => setIsSearchOpen(true)} />
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="offline-banner fixed left-0 right-0 z-40 bg-f1-red text-white text-center py-2 text-sm font-bold uppercase tracking-wider shadow-lg"
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
            <Route path="/racers" element={<PageWrapper><Racers key={location.search} /></PageWrapper>} />
            <Route path="/cars" element={<PageWrapper><Cars /></PageWrapper>} />
            <Route path="/circuits" element={<PageWrapper><Circuits /></PageWrapper>} />
            <Route path="/strategy" element={<PageWrapper><Strategy /></PageWrapper>} />
            <Route path="/live-season" element={<PageWrapper><LiveSeason /></PageWrapper>} />
            <Route path="/all-time" element={<PageWrapper><AllTimeRecords /></PageWrapper>} />
            <Route path="/pit-wall-ai" element={<PageWrapper><PitWallAI /></PageWrapper>} />
            <Route path="/teams" element={<PageWrapper><Teams /></PageWrapper>} />
            <Route path="/dictionary" element={<PageWrapper><Dictionary /></PageWrapper>} />
            <Route path="/venues/:venueId" element={<PageWrapper><Venue /></PageWrapper>} />
            <Route path="*" element={<section className="experience-page"><p className="experience-kicker">BACK ON TRACK</p><h1>This page left the circuit.</h1><p>Use the navigation to find a lesson, or start with the essentials.</p><Link className="experience-primary" to="/">Back to Start Here →</Link></section>} />
            <Route path="/garage" element={<PageWrapper><Garage3D /></PageWrapper>} />
          </Routes>
        </>
      </main>
      <footer className="site-footer"><div><strong>FORMULA DC-1</strong><p>A way into the racing, the strategy and the engineering.</p><small>Independent educational project. Example data and historical systems are identified in their context.</small></div><nav aria-label="Footer resources"><Link to="/">Start learning</Link><Link to="/watch">Race companion</Link><Link to="/dictionary">Dictionary</Link><a href={`${import.meta.env.BASE_URL}pit-crew-base-attribution.txt`} target="_blank" rel="noreferrer">3D asset credits ↗</a></nav></footer>
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
