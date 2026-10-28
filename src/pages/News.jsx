import NewsImage from '../components/NewsImage';
import teamLogos from '../data/teamLogos.json';
import { localImage } from '../utils/getWikipediaImage';
import useDialogAccessibility from '../hooks/useDialogAccessibility';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DataNote from '../components/DataNote';
import { getCacheInfo } from '../services/cache';
import { fetchLiveF1News } from '../services/newsService';
import { NewsTicker } from '../components';
import FadeInSection from '../components/FadeInSection';
import { useFavorites } from '../hooks/useFavorites';

const CATEGORIES = ['ALL', 'BREAKING', 'TECHNICAL', 'DEVELOPMENT', 'TELEMETRY', 'POWER UNIT', 'PADDOCK', 'BOOKMARKED'];

const QUICK_TAGS = [
  { 
    label: 'Ferrari', 
    query: 'Ferrari', 
    color: '#e10600', 
    logo: 'https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png' 
  },
  { 
    label: 'Mercedes', 
    query: 'Mercedes', 
    color: '#6a6a6a',
    logo: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.mercedesamgf1.com&size=256' 
  },
  { 
    label: 'Red Bull', 
    query: 'Red Bull', 
    color: '#919191',
    logo: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.redbullracing.com&size=256' 
  },
  { 
    label: 'McLaren', 
    query: 'McLaren', 
    color: '#e10600',
    logo: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.mclaren.com&size=256' 
  },
  { 
    label: 'Aston Martin', 
    query: 'Aston Martin', 
    color: '#666666',
    logo: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.astonmartinf1.com&size=256' 
  },
  { 
    label: 'Lewis Hamilton', 
    query: 'Hamilton', 
    color: '#e10600', 
    avatar: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png' 
  },
  { 
    label: 'Max Verstappen', 
    query: 'Verstappen', 
    color: '#919191',
    avatar: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png' 
  },
  { 
    label: 'Kimi Antonelli', 
    query: 'Antonelli', 
    color: '#6a6a6a',
    avatar: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KIMANT01_Kimi_Antonelli/kimant01.png' 
  },
  { 
    label: 'Charles Leclerc', 
    query: 'Leclerc', 
    color: '#e10600', 
    avatar: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png' 
  },
  { 
    label: 'Lando Norris', 
    query: 'Norris', 
    color: '#e10600',
    avatar: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png' 
  },
  { 
    label: 'Fernando Alonso', 
    query: 'Alonso', 
    color: '#666666',
    avatar: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png' 
  }
];

export default function News() {
  const [articles, setArticles] = useState([]);
  const [feedError, setFeedError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const articleDialogRef = useDialogAccessibility(Boolean(selectedArticle), () => setSelectedArticle(null));
  const { toggleFavorite, isFavorite } = useFavorites();

  // Live Auto-Update State
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [toastMessage, setToastMessage] = useState(null);

  const loadNews = async (isSync = false) => {
    if (isSync) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchLiveF1News(isSync);
      setFeedError(null);
      setFetchedAt(getCacheInfo('rss_news')?.timestamp);
      setArticles(prev => {
        if (isSync && prev.length > 0 && data.length > prev.length) {
          const diff = data.length - prev.length;
          setToastMessage(`LIVE WIRE: ${diff} New paddock dispatch${diff > 1 ? 'es' : ''} received!`);
          setTimeout(() => setToastMessage(null), 5000);
        }
        return data;
      });
    } catch (err) {
      setFeedError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(60);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => loadNews());
  }, []);

  // Keep polling outside state updater functions (which React can replay).
  useEffect(() => {
    if (!autoUpdate) return;
    const interval = setInterval(() => loadNews(true), 60000);
    const countdownTimer = setInterval(() => setCountdown(value => value <= 1 ? 60 : value - 1), 1000);
    return () => { clearInterval(interval); clearInterval(countdownTimer); };
  }, [autoUpdate]);

  const filteredArticles = articles.filter(item => {
    const matchesCategory = selectedCategory === 'ALL'
      || (selectedCategory === 'BOOKMARKED' ? isFavorite(item.id) : item.category === selectedCategory);
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
                          item.title.toLowerCase().includes(queryLower) || 
                          item.snippet.toLowerCase().includes(queryLower) ||
                          item.content.toLowerCase().includes(queryLower) ||
                          item.source.toLowerCase().includes(queryLower) ||
                          item.author.toLowerCase().includes(queryLower);
    return matchesCategory && matchesSearch;
  });

  const heroArticle = articles[0];
  const trendingArticles = articles.filter(a => a.trending || articles.indexOf(a) < 3);

  const handleTagClick = (tagQuery) => {
    if (searchQuery.toLowerCase() === tagQuery.toLowerCase()) {
      setSearchQuery('');
    } else {
      setSearchQuery(tagQuery);
    }
  };

  return (
    <div className="pt-20 pb-16 min-h-screen bg-[#080808] text-f1-light relative">
      <NewsTicker headlines={articles.slice(0, 8)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6"><DataNote kind={feedError ? 'Feed unavailable' : 'Publisher RSS'}>{articles[0]?.delivery === 'snapshot' ? `Saved publisher edition from ${new Date(articles[0].retrievedAt).toLocaleString()}. Live feeds are temporarily unavailable.` : 'F1-only publisher feeds: Autosport and Motorsport.com.'} Categories are automatically assigned; summaries may be incomplete. {fetchedAt && `Retrieved ${new Date(fetchedAt).toLocaleString()}.`} {feedError && `${feedError} Any articles still shown are from the last successful retrieval.`} {feedError && <button onClick={() => loadNews(true)} className="ml-2 underline text-white">Retry</button>}</DataNote></div>

      {/* Live Toast Alert for New Wire Articles */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 0, opacity: 1 }}
            className="fixed top-24 right-6 z-50 bg-f1-red text-white text-xs font-mono font-bold px-4 py-3 rounded-lg shadow-2xl border border-white/20 flex items-center gap-3"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* CNN Style Header */}
        <div className="border-b border-f1-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="bg-f1-red text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-widest rounded-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {articles[0]?.delivery === 'snapshot' ? 'SAVED PADDOCK EDITION' : 'F1 PADDOCK WIRE'}
              </span>
              
              {/* Auto Sync Indicator & Control */}
              <div className="flex items-center gap-2 bg-[#151515] border border-f1-border px-3 py-1 rounded text-[10px] font-mono text-f1-muted">
                <span>AUTO-SYNC:</span>
                <button
                  onClick={() => setAutoUpdate(!autoUpdate)}
                  className={`font-bold uppercase tracking-wider ${autoUpdate ? 'text-red-400' : 'text-f1-muted'}`}
                >
                  {autoUpdate ? `ON (${countdown}s)` : 'OFF'}
                </button>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-mono italic">
              F1 PADDOCK <span className="text-f1-red font-sans not-italic">WIRE</span>
            </h1>
            <p className="text-f1-muted text-sm mt-1 max-w-2xl">
              Formula 1 reporting from specialist publishers. Fresh headlines, race analysis and technical developments.
            </p>
          </div>

          {/* Action Bar: Manual Refresh + Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => loadNews(true)}
              disabled={refreshing}
              className="bg-[#151515] hover:bg-[#242424] text-f1-light border border-f1-border text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded flex items-center justify-center gap-2 transition"
            >
              <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Syncing...' : 'Sync Wire'}
            </motion.button>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search Ferrari, Hamilton, Max, Kimi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#151515] border border-f1-border text-xs text-f1-light px-4 py-2.5 rounded focus:outline-none focus:border-f1-red transition font-mono pr-8"
              />
              {searchQuery ? (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-f1-muted hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              ) : (
                <svg className="absolute right-3 top-2.5 text-f1-muted w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* SEARCHABLE DRIVERS & TEAMS QUICK-TAG BAR (FLEX WRAP + BRAND LOGOS + DRIVER AVATARS - NO SCROLLBAR) */}
        <div className="bg-[#101010] border border-f1-border/60 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-f1-muted">
            <span className="flex items-center gap-2 font-bold text-f1-red">
              <span className="w-2 h-2 rounded-full bg-f1-red animate-pulse" />
              QUICK SEARCH BY TEAM OR DRIVER:
            </span>
            {searchQuery && (
              <span className="text-white font-bold">
                Active Filter: <span className="text-f1-red">"{searchQuery}"</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {QUICK_TAGS.map(tag => {
              const isSelected = searchQuery.toLowerCase() === tag.query.toLowerCase();
              return (
                <button
                  key={tag.query}
                  onClick={() => handleTagClick(tag.query)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border transition duration-200 flex items-center gap-2.5 ${
                    isSelected 
                      ? 'bg-f1-red text-white border-f1-red shadow-lg shadow-f1-red/30' 
                      : 'bg-[#181818] text-f1-light border-f1-border/60 hover:border-f1-red/60 hover:bg-[#1f1f1f]'
                  }`}
                >
                  {tag.logo ? (
                    <div className="w-5 h-5 rounded bg-white/10 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                      <img 
                        src={`${import.meta.env.BASE_URL}${teamLogos[({ Ferrari:'ferrari', Mercedes:'mercedes', 'Red Bull':'red_bull', McLaren:'mclaren', 'Aston Martin':'aston_martin' })[tag.label]]?.path || 'favicon.svg'}`}
                        alt={tag.label} 
                        className="max-w-full max-h-full object-contain" 
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.target.parentElement.style.backgroundColor = tag.color; e.target.style.display = 'none'; }}
                      />
                    </div>
                  ) : tag.avatar ? (
                    <img 
                      src={localImage(tag.label) || `${import.meta.env.BASE_URL}favicon.svg`}
                      alt={tag.label} 
                      className="w-5 h-5 rounded-full object-cover bg-black/40 border border-white/20 shrink-0" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                  )}
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-f1-border/40">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              role="button" tabIndex={0} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setSelectedCategory(cat); } } } onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition duration-200 ${
                selectedCategory === cat 
                  ? 'bg-f1-red text-white shadow-lg shadow-f1-red/20' 
                  : 'bg-[#151515] text-f1-muted hover:text-white hover:bg-[#202020]'
              }`}
            >
              {cat === 'BOOKMARKED' ? '★ Bookmarked' : cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-f1-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs font-mono text-f1-muted uppercase tracking-widest">Connecting to real-time RSS telemetry feeds...</p>
          </div>
        ) : (
          <>
            {/* HERO FEATURED ARTICLE (CNN Top Story style) */}
            {heroArticle && selectedCategory === 'ALL' && !searchQuery && (
              <FadeInSection>
                <div 
                  role="button" tabIndex={0} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setSelectedArticle(heroArticle); } } } onClick={() => setSelectedArticle(heroArticle)}
                  className="group cursor-pointer relative overflow-hidden rounded-2xl border border-f1-border bg-[#101010] grid grid-cols-1 lg:grid-cols-12 shadow-2xl hover:border-f1-red transition duration-300"
                >
                  <div className="lg:col-span-7 relative h-72 lg:h-auto overflow-hidden">
                    <NewsImage
                      src={heroArticle.imageUrl} 
                      alt={heroArticle.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-transparent to-transparent lg:hidden" />
                  </div>

                  <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-f1-red/20 text-f1-red border border-f1-red/40 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest rounded-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-f1-red animate-ping" />
                          {heroArticle.category}
                        </span>
                        <span className="text-[11px] text-f1-muted font-mono">{heroArticle.readTime}</span>
                      </div>

                      <h2 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight group-hover:text-f1-red transition duration-200 mb-4">
                        {heroArticle.title}
                      </h2>

                      <p className="text-f1-muted text-sm leading-relaxed mb-6">
                        {heroArticle.snippet}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-f1-border/40 pt-4 text-xs text-f1-muted font-mono">
                      <span>By {heroArticle.author}</span>
                      <span className="text-f1-red font-bold uppercase tracking-wider group-hover:translate-x-1 transition">Read Story →</span>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            )}

            {/* MAIN CONTENT GRID + SIDEBAR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* News Masonry Cards */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between border-l-2 border-f1-red pl-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-f1-red">
                    Latest Paddock Dispatches ({filteredArticles.length})
                  </h3>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-f1-muted hover:text-f1-red font-mono underline"
                    >
                      Clear Search Filter
                    </button>
                  )}
                </div>

                {filteredArticles.length === 0 ? (
                  <div className="bg-[#101010] border border-f1-border p-12 text-center rounded-xl text-f1-muted font-mono text-xs space-y-3">
                    <p className="text-white font-bold text-sm">No articles found matching "{searchQuery}"</p>
                    <p>Try searching for "Ferrari", "Mercedes", "Hamilton", or "Verstappen"</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 bg-f1-red text-white text-xs font-bold uppercase px-4 py-2 rounded"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredArticles.map((article) => (
                      <motion.div
                        key={article.id}
                        whileHover={{ y: -4 }}
                        role="button" tabIndex={0} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setSelectedArticle(article); } } } onClick={() => setSelectedArticle(article)}
                        className="bg-[#101010] border border-f1-border hover:border-f1-red/50 rounded-xl overflow-hidden shadow-lg cursor-pointer flex flex-col justify-between transition duration-200 group"
                      >
                        <div>
                          <div className="h-44 overflow-hidden relative">
                            <NewsImage
                              src={article.imageUrl} 
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                            />
                            <span className="absolute top-3 left-3 bg-[#0c0c0c]/80 backdrop-blur-sm border border-f1-border text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                              {article.category}
                            </span>
                          </div>

                          <div className="p-5">
                            <div className="text-[10px] text-f1-muted font-mono mb-2">
                              {article.date ? new Date(article.date).toLocaleString() : 'Date unavailable'} • {article.readTime}
                            </div>
                            <h4 className="font-extrabold text-base text-white group-hover:text-f1-red transition leading-snug mb-2">
                              {article.title}
                            </h4>
                            <p className="text-xs text-f1-muted line-clamp-3 leading-relaxed">
                              {article.snippet}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 pt-0 text-[11px] font-mono text-f1-muted flex justify-between items-center border-t border-f1-border/30 mt-4">
                          <span>{article.source}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={e => { e.stopPropagation(); toggleFavorite('article', article.id, article.title); }}
                              className={`transition-all ${
                                isFavorite(article.id)
                                  ? 'text-f1-red'
                                  : 'text-white/20 hover:text-white/60'
                              }`}
                              title={isFavorite(article.id) ? 'Remove bookmark' : 'Bookmark article'}
                            >
                              {isFavorite(article.id) ? '★' : '☆'}
                            </button>
                            <span className="text-f1-red font-bold">Read →</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar: Trending & Paddock Wire */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#101010] border border-f1-border rounded-xl p-6 shadow-xl">
                  <h3 className="text-xs font-black uppercase tracking-widest text-f1-red border-b border-f1-border/40 pb-3 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-f1-red animate-pulse" />
                    TRENDING IN THE PADDOCK
                  </h3>

                  <div className="divide-y divide-f1-border/40 space-y-4">
                    {trendingArticles.map((art, idx) => (
                      <div 
                        key={`trending-${art.id}`}
                        role="button" tabIndex={0} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setSelectedArticle(art); } } } onClick={() => setSelectedArticle(art)}
                        className="pt-4 first:pt-0 cursor-pointer group flex items-start gap-4"
                      >
                        <span className="text-2xl font-black text-f1-red/40 font-mono group-hover:text-f1-red transition">
                          0{idx + 1}
                        </span>
                        <div>
                          <span className="text-[9px] text-f1-red font-bold uppercase tracking-wider block mb-1">
                            {art.category}
                          </span>
                          <h4 className="text-xs font-bold text-white group-hover:text-f1-red transition leading-snug">
                            {art.title}
                          </h4>
                          <span className="text-[10px] text-f1-muted font-mono mt-1 block">
                            {art.readTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newsletter / Bulletin Card */}
                <div className="bg-gradient-to-br from-[#e10600] to-[#0c0c0c] border border-f1-red/40 rounded-xl p-6 text-center">
                  <h4 className="font-extrabold text-sm text-white uppercase tracking-wider mb-2">
                    Publisher feed status
                  </h4>
                  <p className="text-xs text-f1-muted mb-4 leading-relaxed">
                    Auto-refresh runs every 60 seconds when enabled. New dispatches are automatically sorted to the top.
                  </p>
                  <button 
                    onClick={() => loadNews(true)}
                    className="w-full bg-f1-red hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded transition shadow-lg shadow-f1-red/20"
                  >
                    Force Live Refresh
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* FULL ARTICLE READ MODAL */}
        <AnimatePresence>
          {selectedArticle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              ref={articleDialogRef} role="dialog" aria-modal="true" aria-label="News article" tabIndex={-1}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#111111] border border-f1-red/50 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl my-8 relative"
              >
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-f1-red text-white p-2 rounded-full backdrop-blur-sm transition"
                >
                  ✕
                </button>

                <div className="h-64 sm:h-80 overflow-hidden relative">
                  <NewsImage src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="bg-f1-red text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest mb-2 inline-block">
                      {selectedArticle.category}
                    </span>
                    <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                      {selectedArticle.title}
                    </h2>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-wrap items-center justify-between text-xs text-f1-muted font-mono border-b border-f1-border/40 pb-4">
                    <span>Source: {selectedArticle.source}</span>
                    <span>By {selectedArticle.author}</span>
                    <span>Published: {selectedArticle.date ? new Date(selectedArticle.date).toLocaleDateString() : 'Date unavailable'}</span>
                  </div>

                  <div className="text-sm text-f1-light leading-relaxed space-y-4 font-sans">
                    <p className="text-base font-semibold text-white/90 leading-normal border-l-2 border-f1-red pl-4 py-1 italic">
                      "{selectedArticle.snippet}"
                    </p>
                    <p>
                      {selectedArticle.content}
                    </p>
                    <p>
                      As engineering departments shift focus towards aerodynamic upgrades and power unit durability, technical directors across the pit lane have emphasized the importance of high-speed floor balance and clean airflow distribution.
                    </p>
                  </div>

                  {selectedArticle.url && (
                    <div className="pt-4 border-t border-f1-border/40 flex justify-end">
                      <a 
                        href={selectedArticle.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-f1-red hover:bg-red-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded transition inline-flex items-center gap-2"
                      >
                        Read Full Original Source ↗
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
