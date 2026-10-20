import useDialogAccessibility from '../hooks/useDialogAccessibility';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getCurrentDriverStandings, 
  getCurrentConstructorStandings, 
  getSeasonRaces, 
  getSeasonWinners,
  getRoundStandings,
  getLastRaceResults 
} from '../services/jolpicaApi';
import { getLatestSession, getRaceWeather, getDriverPositions, getLapTimes } from '../services/openf1Api';
import { StatCard, SkeletonTable, PlotlyTooltip, PodiumPredictor } from '../components';
import DataNote from '../components/DataNote';
import { Link } from 'react-router-dom';
import { getCacheInfo } from '../services/cache';
import { standingsProgression, latestObservationDate } from '../utils/raceData';
import FadeInSection from '../components/FadeInSection';
import { getFlagEmoji } from '../utils/countryFlags';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';



const TEAM_COLORS = {
  'Red Bull Racing': '#3b82f6',
  'Ferrari': '#e10600',
  'McLaren': '#ff8700',
  'Mercedes': '#00a19c',
  'Aston Martin': '#229977',
  'Alpine': '#ff87bc',
  'Williams': '#005aff',
  'RB': '#6692ff',
  'Sauber': '#00e701',
  'Haas': '#ffffff'
};

const getDriverColor = (driver) => {
  const teamName = driver?.Constructors?.[0]?.name;
  return TEAM_COLORS[teamName] || '#888888';
};

const PIT_STOP_DATA = [
  { team: 'Red Bull Racing', avgTime: 2.15, color: '#001a30' },
  { team: 'Ferrari', avgTime: 2.34, color: '#e10600' },
  { team: 'McLaren', avgTime: 2.41, color: '#ff8700' },
  { team: 'Mercedes', avgTime: 2.58, color: '#00a19c' },
  { team: 'Aston Martin', avgTime: 2.82, color: '#229977' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

function calculateTimeLeft(dateStr) {
    const difference = +new Date(dateStr) - +new Date();
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0 };

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60)
    };
  }

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);



  return (
    <div className="mt-2 text-xs font-mono font-bold text-f1-red uppercase tracking-wider bg-f1-red/10 border border-f1-red/20 px-2 py-1 rounded inline-block">
      ⏳ Countdown: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
    </div>
  );
}

const LeaderSpotlight = ({ leaderDriver }) => {
  const [headshotUrl, setHeadshotUrl] = useState(null);
  const [teamColor, setTeamColor] = useState('#e10600');

  useEffect(() => {
    if (!leaderDriver) return;
    const fetchHeadshot = async () => {
      try {
        const number = leaderDriver.Driver.permanentNumber;
        const res = await fetch(`https://api.openf1.org/v1/drivers?session_key=latest&driver_number=${number}`);
        const data = await res.json();
        if (data && data.length > 0) {
          if (data[0].headshot_url) {
            let url = data[0].headshot_url.replace('d_driver_fallback_image.png/', '');
            url = url.split('.transform')[0];
            setHeadshotUrl(url);
          }
          if (data[0].team_colour) {
            setTeamColor(`#${data[0].team_colour}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch headshot', err);
      }
    };
    fetchHeadshot();
  }, [leaderDriver]);

  if (!leaderDriver) return null;
  const driver = leaderDriver.Driver;
  const constructor = leaderDriver.Constructors[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, scale: 0.95 }}
        animate={{ opacity: 1, height: 'auto', scale: 1 }}
        exit={{ opacity: 0, height: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mt-8 mb-8 relative overflow-hidden rounded-2xl shadow-2xl border bg-[#0f0f15]"
        style={{ borderColor: teamColor }}
      >
        <div className="absolute inset-0 z-0 opacity-20" style={{ background: `linear-gradient(to bottom right, ${teamColor}, transparent)` }}></div>
        
        {/* Animated background lines */}
        <motion.div 
          animate={{ x: [-1000, 1000] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 bottom-0 left-0 w-[200%] opacity-5 z-0 pointer-events-none" 
          style={{ backgroundImage: `radial-gradient(${teamColor} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
        />

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-sm">
          <div className="flex-1">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest rounded-sm mb-4"
              style={{ backgroundColor: teamColor, boxShadow: `0 0 10px ${teamColor}80` }}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Current Championship Leader
            </motion.div>
            <motion.h2 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-lg"
            >
              {driver.givenName} <span style={{ color: teamColor }}>{driver.familyName}</span>
            </motion.h2>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <div className="bg-white/5 px-6 py-3 rounded-xl border border-white/10 shadow-inner">
                <span className="text-f1-muted text-[10px] uppercase tracking-widest font-bold block mb-1">Constructor</span>
                <span className="text-white font-black text-xl">{constructor?.name || 'N/A'}</span>
              </div>
              <div className="px-6 py-3 rounded-xl border" style={{ backgroundColor: `${teamColor}33`, borderColor: `${teamColor}4d`, boxShadow: `0 0 15px ${teamColor}33` }}>
                <span className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: teamColor }}>Total Points</span>
                <span className="text-white font-black text-xl">{leaderDriver.points} PTS</span>
              </div>
              <div className="bg-white/5 px-6 py-3 rounded-xl border border-white/10 shadow-inner">
                <span className="text-f1-muted text-[10px] uppercase tracking-widest font-bold block mb-1">Wins</span>
                <span className="text-white font-black text-xl">{leaderDriver.wins}</span>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="hidden md:flex relative items-center justify-center w-56 h-56 rounded-full border-4 bg-[#0a0a0f] z-10 overflow-hidden"
            style={{ borderColor: teamColor, boxShadow: `0 0 80px ${teamColor}4d` }}
          >
            <div className="absolute inset-2 rounded-full border border-dashed animate-[spin_10s_linear_infinite] z-0" style={{ borderColor: `${teamColor}4d` }}></div>
            
            <span className="text-[140px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-white/40 to-f1-muted/5 tracking-tighter absolute z-10 top-2">
              {driver.permanentNumber || '1'}
            </span>

            {headshotUrl ? (
              <motion.img 
                initial={{ opacity: 0, y: 80, scale: 0.8, filter: "blur(15px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.1 }}
                src={headshotUrl} 
                alt={`${driver.givenName} ${driver.familyName}`}
                className="absolute bottom-[-15px] w-full h-[95%] object-cover z-20 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                style={{ objectPosition: 'top' }}
              />
            ) : null}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const DriverSpotlightModal = ({ spotlightDriver, onClose }) => {
  const dialogRef = useDialogAccessibility(true, onClose);
  const [headshotUrl, setHeadshotUrl] = useState(null);
  const [teamColor, setTeamColor] = useState('#e10600');

  useEffect(() => {
    if (!spotlightDriver) return;
    const fetchHeadshot = async () => {
      try {
        const number = spotlightDriver.Driver.permanentNumber;
        const res = await fetch(`https://api.openf1.org/v1/drivers?session_key=latest&driver_number=${number}`);
        const data = await res.json();
        if (data && data.length > 0) {
          if (data[0].headshot_url) {
            let url = data[0].headshot_url.replace('d_driver_fallback_image.png/', '');
            url = url.split('.transform')[0];
            setHeadshotUrl(url);
          }
          if (data[0].team_colour) {
            setTeamColor(`#${data[0].team_colour}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch headshot', err);
      }
    };
    fetchHeadshot();
  }, [spotlightDriver]);

  if (!spotlightDriver) return null;
  const driver = spotlightDriver.Driver;
  const constructor = spotlightDriver.Constructors[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={dialogRef} role="dialog" aria-modal="true" aria-label="Driver details" tabIndex={-1} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative overflow-hidden rounded-2xl shadow-2xl border bg-[#0f0f15] w-full max-w-4xl"
        style={{ borderColor: teamColor }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-white/50 hover:text-white bg-black/20 hover:bg-black/50 p-2 rounded-full backdrop-blur-sm transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="absolute inset-0 z-0 opacity-20" style={{ background: `linear-gradient(to bottom right, ${teamColor}, transparent)` }}></div>
        
        <motion.div 
          animate={{ x: [-1000, 1000] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 bottom-0 left-0 w-[200%] opacity-5 z-0 pointer-events-none" 
          style={{ backgroundImage: `radial-gradient(${teamColor} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
        />

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-sm">
          <div className="flex-1">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest rounded-sm mb-4"
              style={{ backgroundColor: teamColor, boxShadow: `0 0 10px ${teamColor}80` }}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Driver Profile
            </motion.div>
            <motion.h2 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-lg"
            >
              {driver.givenName} <span style={{ color: teamColor }}>{driver.familyName}</span>
            </motion.h2>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <div className="bg-white/5 px-6 py-3 rounded-xl border border-white/10 shadow-inner">
                <span className="text-f1-muted text-[10px] uppercase tracking-widest font-bold block mb-1">Constructor</span>
                <span className="text-white font-black text-xl">{constructor?.name || 'N/A'}</span>
              </div>
              <div className="px-6 py-3 rounded-xl border" style={{ backgroundColor: `${teamColor}33`, borderColor: `${teamColor}4d`, boxShadow: `0 0 15px ${teamColor}33` }}>
                <span className="text-[10px] uppercase tracking-widest font-bold block mb-1" style={{ color: teamColor }}>Total Points</span>
                <span className="text-white font-black text-xl">{spotlightDriver.points} PTS</span>
              </div>
              <div className="bg-white/5 px-6 py-3 rounded-xl border border-white/10 shadow-inner">
                <span className="text-f1-muted text-[10px] uppercase tracking-widest font-bold block mb-1">Wins</span>
                <span className="text-white font-black text-xl">{spotlightDriver.wins}</span>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="hidden md:flex relative items-center justify-center w-56 h-56 rounded-full border-4 bg-[#0a0a0f] z-10 overflow-hidden"
            style={{ borderColor: teamColor, boxShadow: `0 0 80px ${teamColor}4d` }}
          >
            <div className="absolute inset-2 rounded-full border border-dashed animate-[spin_10s_linear_infinite] z-0" style={{ borderColor: `${teamColor}4d` }}></div>
            
            <span className="text-[140px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-white/40 to-f1-muted/5 tracking-tighter absolute z-10 top-2">
              {driver.permanentNumber || '1'}
            </span>

            {headshotUrl ? (
              <motion.img 
                initial={{ opacity: 0, y: 80, scale: 0.8, filter: "blur(15px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.1 }}
                src={headshotUrl} 
                alt={`${driver.givenName} ${driver.familyName}`}
                className="absolute bottom-[-15px] w-full h-[95%] object-cover z-20 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                style={{ objectPosition: 'top' }}
              />
            ) : null}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Live Telemetry Tab ──────────────────────────────────────────────────────
function LiveTelemetryTab() {
  const [session, setSession] = useState(null);
  const [weather, setWeather] = useState(null);
  const [positions, setPositions] = useState([]);
  const [lapData, setLapData] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [telemetryError, setTelemetryError] = useState(null);

  const fetchTelemetry = async () => {
    try {
      const sessions = await getLatestSession();
      if (!sessions || sessions.length === 0) { setLoading(false); return; }
      const s = sessions[0];
      setSession(s);
      const sk = s.session_key;

      const [weatherData, posData] = await Promise.all([
        getRaceWeather(sk),
        getDriverPositions(sk),
      ]);

      if (weatherData.length > 0) setWeather(weatherData[weatherData.length - 1]);

      const latestPosMap = {};
      posData.forEach(p => {
        if (!latestPosMap[p.driver_number] || new Date(p.date) > new Date(latestPosMap[p.driver_number].date)) {
          latestPosMap[p.driver_number] = p;
        }
      });
      const ranked = Object.values(latestPosMap).sort((a, b) => a.position - b.position);
      setPositions(ranked);
      if (ranked.length > 0) setSelectedDriver(previous => ranked.some(row => row.driver_number === previous) ? previous : ranked[0].driver_number);

      setLastUpdated(latestObservationDate(weatherData, posData));
      setTelemetryError(null);
    } catch (err) {
      console.error('Telemetry fetch error:', err);
      setTelemetryError('Session data is unavailable. Any observations still shown are from the last successful retrieval.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch lap times for selected driver
  useEffect(() => {
    if (!session || !selectedDriver) return;
    getLapTimes(session.session_key, selectedDriver)
      .then(laps => {
        const chartData = laps.slice(-30).map(l => ({
          lap: l.lap_number,
          duration: l.lap_duration ? parseFloat(l.lap_duration.toFixed(3)) : null,
        })).filter(l => l.duration && l.duration < 300);
        setLapData(chartData);
      })
      .catch(() => {});
  }, [session, selectedDriver]);

  // Initial + poll every 15s
  useEffect(() => {
    void Promise.resolve().then(fetchTelemetry);
    const iv = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(iv);
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 text-f1-muted">
      <div className="w-8 h-8 border-2 border-f1-red border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-xs font-mono uppercase tracking-widest">Connecting to OpenF1 telemetry...</p>
    </div>
  );

  if (!session) return (
    <div className="text-center py-20 text-f1-muted">
      <div className="text-5xl mb-4">📡</div>
      <p className="font-mono text-sm">{telemetryError || 'No session data is available.'}</p>
      <button className="mt-4 underline" onClick={fetchTelemetry}>Retry connection</button>
      <p className="text-xs mt-2 opacity-60">Access and availability depend on the data provider.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <DataNote kind="OpenF1 session data">This is the latest available session, which may have ended. {lastUpdated && `Latest source observation: ${lastUpdated.toLocaleString()}.`} {telemetryError} <Link to="/watch" className="underline text-white">Understand the timing screen →</Link></DataNote>
      {/* Session Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e0e16] border border-f1-red/30 rounded-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-f1-red animate-pulse" />
          <div>
            <div className="text-[10px] text-f1-muted uppercase tracking-widest font-mono">Latest available session</div>
            <div className="text-white font-black text-sm">{session.session_name} — {session.location}, {session.country_name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-f1-muted font-mono">
          {lastUpdated && <span>Observed {lastUpdated.toLocaleTimeString()}</span>}
          <span className="px-2 py-0.5 rounded bg-f1-red/20 text-f1-red border border-f1-red/30 uppercase">{session.session_type}</span>
        </div>
      </div>

      <p className="text-sm text-f1-muted">Lower lap times mean faster laps. A spike may reflect traffic, a pit stop or flags; lap duration alone cannot identify the cause.</p>
      {/* Weather Cards */}
      {weather && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Air Temp', value: `${weather.air_temperature?.toFixed(1)}°C`, icon: '🌡' },
            { label: 'Track Temp', value: `${weather.track_temperature?.toFixed(1)}°C`, icon: '🏎' },
            { label: 'Humidity', value: `${weather.humidity?.toFixed(0)}%`, icon: '💧' },
            { label: 'Wind Speed', value: `${weather.wind_speed?.toFixed(1)} m/s`, icon: '💨' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-[#0e0e16] border border-f1-border rounded-xl px-4 py-3 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-[9px] text-f1-muted uppercase tracking-widest">{label}</div>
              <div className="text-white font-black text-base">{value || '—'}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Position Board */}
        <div className="bg-[#0e0e16] border border-f1-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-f1-border flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-f1-light">Latest observed positions</span>
            <span className="text-[10px] text-f1-muted font-mono">{positions.length} drivers</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {positions.length === 0 ? (
              <div className="text-f1-muted text-xs font-mono text-center py-8">No position data available</div>
            ) : positions.map(p => (
              <button
                key={p.driver_number}
                onClick={() => setSelectedDriver(p.driver_number)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-f1-border/40 transition text-left ${
                  selectedDriver === p.driver_number ? 'bg-f1-red/10' : 'hover:bg-white/5'
                }`}
              >
                <span className="w-6 h-6 rounded bg-f1-red/20 text-f1-red text-[10px] font-black flex items-center justify-center">
                  {p.position}
                </span>
                <span className="text-[11px] font-mono font-bold text-white flex-1">#{p.driver_number}</span>
                {selectedDriver === p.driver_number && (
                  <span className="text-[9px] text-f1-red font-mono">SELECTED ▶</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Lap Time Chart */}
        <div className="bg-[#0e0e16] border border-f1-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-f1-border">
            <span className="text-[11px] font-black uppercase tracking-widest text-f1-light">
              Lap Times — Driver #{selectedDriver}
            </span>
          </div>
          <div className="p-4 h-72">
            {lapData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-f1-muted text-xs font-mono">
                No lap data available for this driver
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lapData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1d2e" />
                  <XAxis dataKey="lap" tick={{ fill: '#888', fontSize: 10 }} label={{ value: 'Lap', position: 'insideBottom', fill: '#888', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#888', fontSize: 10 }} domain={['auto', 'auto']} tickFormatter={v => `${v}s`} />
                  <Tooltip
                    contentStyle={{ background: '#0e0e16', border: '1px solid #e1060044', borderRadius: 8 }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}
                    formatter={v => [`${v}s`, 'Lap Time']}
                  />
                  <Line type="monotone" dataKey="duration" stroke="#e10600" strokeWidth={2} dot={{ fill: '#e10600', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveSeason() {

  const [driversData, setDriversData] = useState(null);
  const [constructorsData, setConstructorsData] = useState(null);
  const [calendarRaces, setCalendarRaces] = useState([]);
  const [lastRace, setLastRace] = useState(null);
  const [progressionData, setProgressionData] = useState([]);
  const [visibleDrivers, setVisibleDrivers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarRefreshing, setCalendarRefreshing] = useState(false);

  // OpenF1 State
  const [snapshotError, setSnapshotError] = useState(null);
  const [openF1Data, setOpenF1Data] = useState({ session: null, weather: null, positions: [] });
  const [openF1Loading, setOpenF1Loading] = useState(true);
  const [openF1Refreshing, setOpenF1Refreshing] = useState(false);
  const [showLeaderSpotlight, setShowLeaderSpotlight] = useState(false);
  const [selectedTableDriver, setSelectedTableDriver] = useState(null);

  // Pagination State
  const [driverPage, setDriverPage] = useState(1);
  const [constructorPage, setConstructorPage] = useState(1);
  const [raceResultPage, setRaceResultPage] = useState(1);
  const [openF1Page, setOpenF1Page] = useState(1);
  const [liveTab, setLiveTab] = useState('season');
  const ITEMS_PER_PAGE = 10;

  const fetchOpenF1Data = async (isRefresh = false) => {
    if (isRefresh) setOpenF1Refreshing(true);
    else setOpenF1Loading(true);
    try {
      const sessions = await getLatestSession();
      if (!sessions || sessions.length === 0) {
        setOpenF1Data({ session: null, weather: null, positions: [] });
        return;
      }
      const session = sessions[0];
      const sessionKey = session.session_key;

      const [weatherData, positionsData] = await Promise.all([
        getRaceWeather(sessionKey),
        getDriverPositions(sessionKey)
      ]);

      const latestWeather = weatherData.length > 0 ? weatherData[weatherData.length - 1] : null;
      
      const latestPosMap = {};
      positionsData.forEach(p => {
        const driver = p.driver_number;
        if (!latestPosMap[driver] || new Date(p.date) > new Date(latestPosMap[driver].date)) {
          latestPosMap[driver] = p;
        }
      });
      const rankedPositions = Object.values(latestPosMap).sort((a, b) => a.position - b.position);

      setOpenF1Data({ session, weather: latestWeather, positions: rankedPositions });
      setSnapshotError(null);
      
      // Give the animation time to be seen if it was a refresh
      if (isRefresh) {
        await new Promise(r => setTimeout(r, 1200));
      }
    } catch (err) {
      console.error(err);
      setSnapshotError('Session feed unavailable. Any snapshot still shown is from the last successful retrieval.');
    } finally {
      setOpenF1Loading(false);
      setOpenF1Refreshing(false);
    }
  };

  const [seasonFetchedAt, setSeasonFetchedAt] = useState(null);
  const [progressionError, setProgressionError] = useState(null);
  const [progressionLoading, setProgressionLoading] = useState(false);
  const seasonAlive = useRef(true);
  const fetchSeasonData = async (isRefresh = false) => {
    if (isRefresh) setCalendarRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [driversRes, constructorsRes, calendarRes, lastRaceRes] = await Promise.allSettled([
        getCurrentDriverStandings(isRefresh), getCurrentConstructorStandings(isRefresh),
        getSeasonRaces('current', isRefresh), getLastRaceResults(isRefresh),
      ]);
      if (driversRes.status === 'rejected') throw driversRes.reason;
      const drivers = driversRes.value;
      setDriversData(drivers);
      setSeasonFetchedAt(getCacheInfo('current_driver_standings')?.timestamp);
      if (constructorsRes.status === 'fulfilled') setConstructorsData(constructorsRes.value);
      if (lastRaceRes.status === 'fulfilled') setLastRace(lastRaceRes.value);
      const partial = [constructorsRes, calendarRes, lastRaceRes].some(result => result.status === 'rejected');
      if (partial) setError('Some feeds are unavailable. Available observations are shown; missing results remain unavailable.');
      const calendar = calendarRes.status === 'fulfilled' ? calendarRes.value : [];
      const now = new Date();
      const completedRounds = Number(drivers.round || 0);
      const next = calendar.find(race => new Date(`${race.date}T${race.time || '12:00:00Z'}`) > now);
      setCalendarRaces(calendar.map(race => ({ ...race, isCompleted: Number(race.round) <= completedRounds, isNext: race === next, winner: Number(race.round) <= completedRounds ? 'Result unavailable' : 'TBD' })));
      const top5Ids = (drivers.DriverStandings || []).slice(0, 5).map(row => row.Driver.driverId);
      setVisibleDrivers(Object.fromEntries(top5Ids.map(id => [id, true])));
      setProgressionError(null);
      setProgressionLoading(true);
      setLoading(false);
      const rounds = Array.from({ length: completedRounds }, (_, index) => index + 1);
      const observations = [];
      const winnerResponse = await getSeasonWinners(drivers.season, isRefresh).catch(() => []);
      const resultsByRound = new Map(winnerResponse.map(race => [Number(race.round), race.Results || []]));
      // Bound concurrency so a full season does not burst dozens of API requests.
      for (let offset = 0; offset < rounds.length; offset += 3) {
        if (!seasonAlive.current) return;
        const batch = await Promise.all(rounds.slice(offset, offset + 3).map(async round => {
          const standings = await getRoundStandings(drivers.season, round, isRefresh).catch(() => null);
          return { round, standings };
        }));
        observations.push(...batch);
      }
      if (observations.some(row => !row.standings)) setProgressionError('Some round standings are unavailable. Gaps in the chart indicate missing data.');
      setProgressionData(standingsProgression(observations, top5Ids));
      if (calendarRes.status === 'fulfilled') setCalendarRaces(calendar.map(race => {
        const result = resultsByRound.get(Number(race.round))?.[0]?.Driver;
        return { ...race, isCompleted: Number(race.round) <= completedRounds, isNext: race === next, winner: result ? `${result.givenName} ${result.familyName}` : Number(race.round) <= completedRounds ? 'Result unavailable' : 'TBD' };
      }));
    } catch (err) {
      console.error('Season feed unavailable:', err);
      setError('Championship data could not be refreshed. Any data still shown is from the last successful retrieval.');
    } finally {
      setLoading(false);
      setCalendarRefreshing(false);
      setProgressionLoading(false);
    }
  };

  useEffect(() => {
    seasonAlive.current = true;
    void Promise.resolve().then(fetchOpenF1Data);
    void Promise.resolve().then(fetchSeasonData);

    // Auto-refresh OpenF1 data every 15 seconds for reactive feel
    const interval = setInterval(() => {
      fetchOpenF1Data(true);
    }, 15000);

    return () => { seasonAlive.current = false; clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <div className="pt-32 pb-12 text-center max-w-7xl mx-auto">
        <SkeletonTable rows={5} cols={4} />
        <p className="text-xs text-f1-muted uppercase font-bold tracking-wider mt-4">Synchronizing telemetry data feeds...</p>
      </div>
    );
  }

  // Standings Lists
  const driversList = driversData?.DriverStandings || [];
  const constructorsList = constructorsData?.ConstructorStandings || [];

  // Stat Card Details
  const leaderDriver = driversList[0];
  const leaderName = leaderDriver ? `${leaderDriver.Driver.givenName} ${leaderDriver.Driver.familyName}` : 'N/A';
  const leaderPoints = leaderDriver ? leaderDriver.points : '0';
  const completedRacesCount = driversData?.round || '0';

  const firstPoints = parseFloat(driversList[0]?.points || 0);
  const secondPoints = parseFloat(driversList[1]?.points || 0);
  const closestGap = firstPoints - secondPoints;

  const leaderConstructor = constructorsList[0];
  const constructorName = leaderConstructor ? leaderConstructor.Constructor.name : 'N/A';
  const constructorPoints = leaderConstructor ? leaderConstructor.points : '0';

  // Top 5 drivers for progression chart
  const top5Drivers = driversList.slice(0, 5);

  const toggleDriverVisibility = (driverId) => {
    setVisibleDrivers(prev => ({
      ...prev,
      [driverId]: !prev[driverId]
    }));
  };

  const latestCompletedRoundKey = progressionData.length > 0 
    ? progressionData[progressionData.length - 1].round 
    : 'R8';

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-16">
      {/* Title */}
      <div>
        <div className="border-l-2 border-f1-red pl-2 mb-2">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Season & session data
          </h4>
        </div>
        <h1 className="text-3xl font-extrabold text-f1-light tracking-tight flex items-baseline">
          🏁 Current Season Standings 
          <span className="text-sm font-bold text-f1-red ml-4 tracking-normal uppercase bg-f1-red/10 px-2 py-1 rounded">
            (Points Reset Yearly)
          </span>
        </h1>
        <p className="text-f1-muted text-xs mt-1">Championship standings from Jolpica, with the latest available session observations from OpenF1.</p>
      </div>

      <DataNote kind="Season data" source={{ label: 'Jolpica', url: 'https://api.jolpi.ca/ergast/f1/' }}>Season {driversData?.season || 'unavailable'} · round {driversData?.round || 'unavailable'}. {seasonFetchedAt && `Standings retrieved ${new Date(seasonFetchedAt).toLocaleString()}.`} Results follow provider publication times. <Link to="/watch" className="underline text-white">New to timing screens? Start here →</Link></DataNote>
      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-f1-border/40 pb-0 mb-4">
        {[
          { id: 'season', label: '📊 Season Overview' },
          { id: 'telemetry', label: '🔴 Live Telemetry' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setLiveTab(t.id)}
            className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
              liveTab === t.id
                ? 'border-f1-red text-white'
                : 'border-transparent text-f1-muted hover:text-f1-light'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {liveTab === 'telemetry' && <LiveTelemetryTab />}

      {liveTab === 'season' && <>

      {error && (
        <div className="bg-f1-red/10 border border-f1-red text-f1-light text-xs px-4 py-3 rounded">
          ⚠️ {error} <button onClick={() => fetchSeasonData(true)} disabled={calendarRefreshing} className="ml-2 underline">Retry season feeds</button>
        </div>
      )}

      {!driversList.length && <p className="text-f1-muted">No championship standings available yet.</p>}
      {/* SECTION 1: Stat Cards */}
      <FadeInSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          label="Championship Leader" 
          value={leaderDriver ? leaderDriver.Driver.familyName : 'N/A'}
          sub={`${leaderName}`} 
          delta={`${leaderPoints} PTS`} 
          onClick={() => setShowLeaderSpotlight(!showLeaderSpotlight)}
        />
        <StatCard 
          label="Races Completed" 
          value={`${completedRacesCount}`} 
          sub={`${driversData?.season || 'Current'} Championship Calendar`} 
          delta={`Out of ${calendarRaces.length || 24}`} 
          onClick={() => setShowLeaderSpotlight(!showLeaderSpotlight)}
        />
        <StatCard 
          label="Championship Lead" 
          value={`${closestGap.toFixed(0)} PTS`} 
          sub={driversList[1] ? `Ahead of ${driversList[1].Driver.familyName}` : 'N/A'} 
          delta="Points Lead" 
          onClick={() => setShowLeaderSpotlight(!showLeaderSpotlight)}
        />
        <StatCard 
          label="Leading Constructor" 
          value={constructorName} 
          sub="Current team points leader"
          delta={`${constructorPoints} PTS`} 
          onClick={() => setShowLeaderSpotlight(!showLeaderSpotlight)}
        />
        <StatCard 
          label="Leader's Total Points" 
          value={`${leaderPoints}`} 
          sub={leaderName} 
          delta="PTS" 
          onClick={() => setShowLeaderSpotlight(!showLeaderSpotlight)}
        />
      </div>
      {showLeaderSpotlight && <LeaderSpotlight leaderDriver={leaderDriver} />}
        </FadeInSection>

      {snapshotError && <p role="status" className="text-sm text-amber-300">{snapshotError}</p>}
      {/* SECTION: Latest Session Snapshot */}
      <FadeInSection>
        <div className="border-l-2 border-f1-red pl-2 mb-4 mt-8">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            OpenF1 API
          </h4>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-f1-light tracking-tight">
            Latest Session Snapshot
          </h2>
          <motion.button 
            whileTap={{ scale: 0.97 }}
            onClick={() => fetchOpenF1Data(true)}
            className="flex items-center gap-2 bg-[#1a1a24] hover:bg-[#2a2a35] text-f1-light text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-sm border border-f1-border transition duration-200"
          >
            {openF1Refreshing ? 'PIT STOP...' : '🔄 Refresh'}
          </motion.button>
        </div>

        <div className={`bg-f1-panel border border-f1-border rounded-lg p-6 shadow-xl relative overflow-hidden transition duration-300`}>
          {/* F1 Starting Lights Refresh Effect */}
          <AnimatePresence>
            {openF1Refreshing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-4 right-4 flex gap-2 z-50 bg-[#0a0a0f] p-2 rounded-md shadow-xl border border-f1-border"
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={`light-${i}`}
                    initial={{ backgroundColor: '#2a2a35', boxShadow: 'none' }}
                    animate={{ backgroundColor: '#e10600', boxShadow: '0 0 8px #e10600' }}
                    transition={{ delay: i * 0.15, duration: 0.1, repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.5 }}
                    className="w-3 h-3 rounded-full"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {openF1Loading && !openF1Refreshing ? (
            <div className="py-8 text-center text-f1-muted text-sm font-bold uppercase tracking-widest flex justify-center items-center gap-3">
              <div className="w-4 h-4 border-2 border-f1-red border-t-transparent rounded-full animate-spin"></div>
              Connecting to OpenF1 Live Feed...
            </div>
          ) : !openF1Data.session ? (
            <div className="py-8 text-center text-f1-muted text-sm">
              No session observations are available from the provider. Use Refresh to try again.
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-f1-light">
                  {openF1Data.session.country_name || openF1Data.session.circuit_short_name} - {openF1Data.session.session_name}
                </h3>
                <p className="text-xs text-f1-muted">{new Date(openF1Data.session.date_start).toLocaleString()}</p>
              </div>

              {openF1Data.weather && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                  <div className="bg-[#0a0a0f] border border-f1-border p-4 rounded flex flex-col items-center justify-center">
                    <span className="text-[10px] text-f1-muted uppercase font-bold text-center mb-1">Air Temp</span>
                    <motion.span key={`air-${openF1Data.weather.air_temperature}`} initial={{ opacity: 0.5, scale: 1.2, color: '#e10600' }} animate={{ opacity: 1, scale: 1, color: '#ffffff' }} className="text-lg font-black text-f1-light">{openF1Data.weather.air_temperature}°C</motion.span>
                  </div>
                  <div className="bg-[#0a0a0f] border border-f1-border p-4 rounded flex flex-col items-center justify-center">
                    <span className="text-[10px] text-f1-muted uppercase font-bold text-center mb-1">Track Temp</span>
                    <motion.span key={`track-${openF1Data.weather.track_temperature}`} initial={{ opacity: 0.5, scale: 1.2, color: '#e10600' }} animate={{ opacity: 1, scale: 1, color: '#ffffff' }} className="text-lg font-black text-f1-light">{openF1Data.weather.track_temperature}°C</motion.span>
                  </div>
                  <div className="bg-[#0a0a0f] border border-f1-border p-4 rounded flex flex-col items-center justify-center">
                    <span className="text-[10px] text-f1-muted uppercase font-bold text-center mb-1">Humidity</span>
                    <motion.span key={`hum-${openF1Data.weather.humidity}`} initial={{ opacity: 0.5, scale: 1.2, color: '#e10600' }} animate={{ opacity: 1, scale: 1, color: '#ffffff' }} className="text-lg font-black text-f1-light">{openF1Data.weather.humidity}%</motion.span>
                  </div>
                  <div className="bg-[#0a0a0f] border border-f1-border p-4 rounded flex flex-col items-center justify-center">
                    <span className="text-[10px] text-f1-muted uppercase font-bold text-center mb-1">Wind</span>
                    <motion.span key={`wind-${openF1Data.weather.wind_speed}`} initial={{ opacity: 0.5, scale: 1.2, color: '#e10600' }} animate={{ opacity: 1, scale: 1, color: '#ffffff' }} className="text-lg font-black text-f1-light">{openF1Data.weather.wind_speed} m/s</motion.span>
                  </div>
                  <div className="bg-[#0a0a0f] border border-f1-border p-4 rounded flex flex-col items-center justify-center">
                    <span className="text-[10px] text-f1-muted uppercase font-bold text-center mb-1">Rainfall</span>
                    <motion.span key={`rain-${openF1Data.weather.rainfall}`} initial={{ opacity: 0.5, scale: 1.2, color: '#e10600' }} animate={{ opacity: 1, scale: 1, color: '#ffffff' }} className="text-lg font-black text-f1-light">{openF1Data.weather.rainfall ? 'Yes' : 'No'}</motion.span>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-f1-muted uppercase tracking-wider mb-3">Latest observed positions</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left relative bg-[#0a0a0f] border border-f1-border rounded">
                    <thead className="bg-[#111116] z-10 outline outline-1 outline-f1-border/40">
                      <tr className="border-b border-f1-border text-f1-muted uppercase font-bold">
                        <th className="py-2 px-4 w-20">Pos</th>
                        <th className="py-2 px-4">Driver</th>
                        <th className="py-2 px-4 text-right">Last Update</th>
                      </tr>
                    </thead>
                    <motion.tbody 
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                      }}
                      initial="hidden"
                      animate="show"
                      className="divide-y divide-f1-border/30 font-mono text-f1-light"
                    >
                      {openF1Data.positions.slice((openF1Page - 1) * ITEMS_PER_PAGE, openF1Page * ITEMS_PER_PAGE).map((p) => {
                        const driverInfo = driversList.find(d => d.Driver.permanentNumber === p.driver_number.toString());
                        const driverName = driverInfo ? `${driverInfo.Driver.givenName} ${driverInfo.Driver.familyName}` : `Driver #${p.driver_number}`;
                        const constructorName = driverInfo ? driverInfo.Constructors[0]?.name : 'Unknown';
                        
                        return (
                          <motion.tr 
                            key={`openf1-pos-${p.driver_number}`}
                            variants={{
                              hidden: { opacity: 0, x: -10 },
                              show: { opacity: 1, x: 0 }
                            }}
                            className="hover:bg-[#1a1a24] transition duration-150"
                          >
                            <td className="py-3 px-4 font-bold text-f1-red">
                              {p.position === 1 || p.position === '1' ? '🥇 P1' : 
                               p.position === 2 || p.position === '2' ? '🥈 P2' : 
                               p.position === 3 || p.position === '3' ? '🥉 P3' : 
                               `P${p.position}`}
                            </td>
                            <td className="py-3 px-4 font-bold text-f1-light">
                              {driverName}
                              <span className="text-[10px] text-f1-muted font-normal block">{constructorName}</span>
                            </td>
                            <td className="py-3 px-4 text-right text-[10px] text-f1-muted">{new Date(p.date).toLocaleTimeString()}</td>
                          </motion.tr>
                        );
                      })}
                    </motion.tbody>
                  </table>
                  <div className="flex items-center justify-between border-t border-f1-border/40 pt-4 mt-4 text-xs font-bold text-f1-muted uppercase tracking-wider">
                    <span>Showing {(openF1Page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(openF1Page * ITEMS_PER_PAGE, openF1Data.positions.length)} of {openF1Data.positions.length} Drivers</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setOpenF1Page(Math.max(1, openF1Page - 1))}
                        disabled={openF1Page === 1}
                        className={`px-3 py-1 rounded transition ${openF1Page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-f1-light hover:bg-f1-red/10'}`}>
                        PREV
                      </button>
                      <button 
                        onClick={() => setOpenF1Page(Math.min(Math.ceil(openF1Data.positions.length / ITEMS_PER_PAGE), openF1Page + 1))}
                        disabled={openF1Page === Math.ceil(openF1Data.positions.length / ITEMS_PER_PAGE)}
                        className={`px-3 py-1 rounded transition ${openF1Page === Math.ceil(openF1Data.positions.length / ITEMS_PER_PAGE) ? 'opacity-50 cursor-not-allowed bg-[#1a1a24] text-f1-muted' : 'bg-f1-light text-[#0a0a0f] hover:bg-f1-red hover:text-white'}`}>
                        NEXT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </FadeInSection>

      <p className="text-sm text-f1-muted">{progressionLoading ? 'Loading published round totals… ' : ''}Points progression uses published championship totals after each round, including Sprint points. {progressionError} Gaps are left unfilled when a total is unavailable.</p>
      {/* Standings Tables */}
      <FadeInSection>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Driver Standings Table */}
        <div className="bg-f1-panel border border-f1-border rounded-lg p-6 shadow-xl">
          <h2 className="text-lg font-black text-f1-light mb-4 uppercase tracking-wider border-b border-f1-border/40 pb-2">
            Driver Standings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left relative">
              <thead className="bg-f1-panel z-10 outline outline-1 outline-f1-border/40">
                <tr className="border-b border-f1-border text-f1-muted uppercase font-bold">
                  <th className="py-2 text-center w-12">Pos</th>
                  <th className="py-2">Driver</th>
                  <th className="py-2">Constructor</th>
                  <th className="py-2 text-center w-16">Wins</th>
                  <th className="py-2 text-center w-16">Pts Behind</th>
                  <th className="py-2 text-right w-16">Points</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="divide-y divide-f1-border/30 font-mono text-f1-light"
              >
                {driversList.slice((driverPage - 1) * ITEMS_PER_PAGE, driverPage * ITEMS_PER_PAGE).map((driver, index) => {
                  const realIndex = (driverPage - 1) * ITEMS_PER_PAGE + index;
                  const currentGap = realIndex === 0 ? '-' : `-${(firstPoints - parseFloat(driver.points)).toFixed(0)}`;
                  return (
                    <motion.tr 
                      key={`driver-row-${driver.Driver.driverId}`} 
                      variants={itemVariants}
                      onClick={() => setSelectedTableDriver(driver)}
                      className="hover:bg-f1-red/10 transition duration-150 cursor-pointer group"
                    >
                      <td className="py-3 text-center font-bold text-f1-muted group-hover:text-f1-red transition">
                        {driver.position === '1' ? '🥇' : driver.position === '2' ? '🥈' : driver.position === '3' ? '🥉' : driver.position}
                      </td>
                      <td className="py-3 font-sans font-bold group-hover:text-f1-light transition">
                        {driver.Driver.givenName} {driver.Driver.familyName}
                        <span className="text-[10px] text-f1-muted font-normal block">{driver.Driver.nationality}</span>
                      </td>
                      <td className="py-3 font-sans text-f1-muted group-hover:text-f1-light transition">{driver.Constructors[0]?.name || 'N/A'}</td>
                      <td className="py-3 text-center group-hover:text-f1-light transition">{driver.wins}</td>
                      <td className="py-3 text-center text-f1-muted group-hover:text-f1-light transition">{currentGap}</td>
                      <td className="py-3 text-right font-bold text-f1-light group-hover:text-f1-red transition">{driver.points}</td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
            <div className="flex items-center justify-between border-t border-f1-border/40 pt-4 mt-4 text-xs font-bold text-f1-muted uppercase tracking-wider">
              <span>Showing {(driverPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(driverPage * ITEMS_PER_PAGE, driversList.length)} of {driversList.length} Drivers</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setDriverPage(Math.max(1, driverPage - 1))}
                  disabled={driverPage === 1}
                  className={`px-3 py-1 rounded transition ${driverPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-f1-light hover:bg-f1-red/10'}`}>
                  PREV
                </button>
                <button 
                  onClick={() => setDriverPage(Math.min(Math.ceil(driversList.length / ITEMS_PER_PAGE), driverPage + 1))}
                  disabled={driverPage === Math.ceil(driversList.length / ITEMS_PER_PAGE)}
                  className={`px-3 py-1 rounded transition ${driverPage === Math.ceil(driversList.length / ITEMS_PER_PAGE) ? 'opacity-50 cursor-not-allowed bg-[#1a1a24] text-f1-muted' : 'bg-f1-light text-[#0a0a0f] hover:bg-f1-red hover:text-white'}`}>
                  NEXT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Constructor Standings Table */}
        <div className="bg-f1-panel border border-f1-border rounded-lg p-6 shadow-xl">
          <h2 className="text-lg font-black text-f1-light mb-4 uppercase tracking-wider border-b border-f1-border/40 pb-2">
            Constructor Standings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left relative">
              <thead className="bg-f1-panel z-10 outline outline-1 outline-f1-border/40">
                <tr className="border-b border-f1-border text-f1-muted uppercase font-bold">
                  <th className="py-2 text-center w-12">Pos</th>
                  <th className="py-2">Constructor</th>
                  <th className="py-2">Nationality</th>
                  <th className="py-2 text-center w-16">Wins</th>
                  <th className="py-2 text-right w-20">Points</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="divide-y divide-f1-border/30 font-mono text-f1-light"
              >
                {constructorsList.slice((constructorPage - 1) * ITEMS_PER_PAGE, constructorPage * ITEMS_PER_PAGE).map((team) => (
                  <motion.tr 
                    key={`constructor-row-${team.Constructor.constructorId || team.Constructor.name}`} 
                    variants={itemVariants}
                    className="hover:bg-f1-dark/40 transition duration-150"
                  >
                    <td className="py-3 text-center font-bold text-f1-muted">
                      {team.position === '1' ? '🥇' : team.position === '2' ? '🥈' : team.position === '3' ? '🥉' : team.position}
                    </td>
                    <td className="py-3 font-sans font-bold">{team.Constructor.name}</td>
                    <td className="py-3 font-sans text-f1-muted">{team.Constructor.nationality}</td>
                    <td className="py-3 text-center">{team.wins}</td>
                    <td className="py-3 text-right font-bold text-f1-light">{team.points}</td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
            <div className="flex items-center justify-between border-t border-f1-border/40 pt-4 mt-4 text-xs font-bold text-f1-muted uppercase tracking-wider">
              <span>Showing {(constructorPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(constructorPage * ITEMS_PER_PAGE, constructorsList.length)} of {constructorsList.length} Teams</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setConstructorPage(Math.max(1, constructorPage - 1))}
                  disabled={constructorPage === 1}
                  className={`px-3 py-1 rounded transition ${constructorPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-f1-light hover:bg-f1-red/10'}`}>
                  PREV
                </button>
                <button 
                  onClick={() => setConstructorPage(Math.min(Math.ceil(constructorsList.length / ITEMS_PER_PAGE), constructorPage + 1))}
                  disabled={constructorPage === Math.ceil(constructorsList.length / ITEMS_PER_PAGE)}
                  className={`px-3 py-1 rounded transition ${constructorPage === Math.ceil(constructorsList.length / ITEMS_PER_PAGE) ? 'opacity-50 cursor-not-allowed bg-[#1a1a24] text-f1-muted' : 'bg-f1-light text-[#0a0a0f] hover:bg-f1-red hover:text-white'}`}>
                  NEXT
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </FadeInSection>

      {/* SECTION 2: Season Calendar */}
      <FadeInSection className="space-y-6">
        <div className="border-l-2 border-f1-red pl-2 mb-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            Race Schedule
          </h4>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-f1-light tracking-tight">📅 Season Calendar</h2>
            <p className="text-f1-muted text-xs mt-1">Full {driversData?.season || 'Current'} calendar list. Highlights include completed status winners and live upcoming countdowns.</p>
          </div>
          <motion.button 
            whileTap={{ scale: 0.97 }}
            onClick={() => fetchSeasonData(true)}
            className="flex items-center gap-2 bg-[#1a1a24] hover:bg-[#2a2a35] text-f1-light text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-sm border border-f1-border transition duration-200"
          >
            {calendarRefreshing ? 'UPDATING...' : '🔄 Refresh'}
          </motion.button>
        </div>

        {/* Podium Predictor Widget */}
        <PodiumPredictor key={`${driversData?.season}_${calendarRaces.find(r => r.isNext)?.round}_${driversList.length}`} drivers={driversList} raceId={`${driversData?.season || 'current'}_${calendarRaces.find(r => r.isNext)?.round || 'none'}`} nextRaceName={calendarRaces.find(r => r.isNext)?.raceName || 'Next race to be confirmed'} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {calendarRaces.map((race) => (
            <div
              key={`race-${race.round}`}
              className={`bg-f1-panel p-5 rounded-lg border transition duration-300 flex flex-col justify-between space-y-4 relative ${
                race.isNext 
                  ? 'border-f1-red shadow-lg shadow-f1-red/10' 
                  : 'border-f1-border hover:border-f1-muted'
              }`}
            >
              {race.isNext && (
                <div className="absolute top-3 right-3 text-[9px] bg-f1-red text-f1-light font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                  Next GP
                </div>
              )}
              <div>
                <div className="flex justify-between items-center text-[10px] text-f1-muted font-black uppercase tracking-wider mb-2">
                  <span>Round {race.round}</span>
                  <span className="text-sm">{getFlagEmoji(race.Circuit?.Location?.country)}</span>
                </div>
                <h3 className="font-extrabold text-base text-f1-light leading-tight">
                  {race.raceName}
                </h3>
                <p className="text-[11px] text-f1-muted mt-1 leading-snug">
                  {race.Circuit?.circuitName}
                </p>
              </div>

              <div className="border-t border-f1-border/40 pt-3 flex flex-col justify-between">
                <span className="text-[10px] text-f1-muted font-bold">
                  Race Date: {race.date}
                </span>

                {race.isCompleted ? (
                  <div className="mt-2 flex items-center justify-between bg-f1-dark/40 border border-f1-border/50 px-2 py-1.5 rounded text-[11px] font-medium text-f1-light">
                    <span>✔️ Winner: {race.winner || "TBD"}</span>
                  </div>
                ) : race.isNext ? (
                  <Countdown targetDate={`${race.date}T${race.time || '14:00:00Z'}`} />
                ) : (
                  <div className="mt-2 text-[10px] text-f1-muted uppercase font-bold tracking-wider">
                    ⚪ Scheduled
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </FadeInSection>

      {/* SECTION 3: Last Race Breakdown */}
      {lastRace && lastRace.Results && (
        <FadeInSection className="space-y-6">
          <div className="border-l-2 border-f1-red pl-2 mb-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
              Race Analysis
            </h4>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-f1-light tracking-tight">🏁 Last Race Breakdown: {lastRace.raceName}</h2>
            <p className="text-f1-muted text-xs mt-1">Full telemetry results table and pit stop analysis from {lastRace.Circuit?.circuitName} on {lastRace.date}.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Table Column */}
            <div className="lg:col-span-2 bg-f1-panel border border-f1-border rounded-lg p-6 shadow-xl">
              <h3 className="text-base font-extrabold text-f1-light mb-4 uppercase tracking-wider border-b border-f1-border/40 pb-2">
                Official Race Results
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-f1-border text-f1-muted uppercase font-bold">
                      <th className="py-2 text-center w-12">Pos</th>
                      <th className="py-2">Driver</th>
                      <th className="py-2">Constructor</th>
                      <th className="py-2 text-center w-16">Laps</th>
                      <th className="py-2 text-center w-24">Time/Status</th>
                      <th className="py-2 text-right w-16">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-f1-border/30 font-mono text-f1-light">
                    {lastRace.Results.slice((raceResultPage - 1) * ITEMS_PER_PAGE, raceResultPage * ITEMS_PER_PAGE).map((result) => {
                      const isP1 = result.position === '1';
                      const hasFastestLap = result.FastestLap?.rank === '1' || result.FastestLap?.rank === 1;
                      
                      return (
                        <tr 
                          key={`result-row-${result.Driver.driverId}`} 
                          className="hover:bg-f1-dark/40 transition duration-150"
                        >
                          <td className={`py-3 text-center font-bold ${isP1 ? 'text-f1-red text-sm font-black' : 'text-f1-muted'}`}>
                            {result.position}
                          </td>
                          <td className="py-3 font-sans font-bold flex items-center gap-2">
                            <span>{result.Driver.givenName} {result.Driver.familyName}</span>
                            {hasFastestLap && (
                              <span className="text-[9px] bg-purple-900/40 border border-purple-500 text-purple-300 font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-0.5">
                                💜 {result.FastestLap.Time?.time || "FL"}
                              </span>
                            )}
                          </td>
                          <td className="py-3 font-sans text-f1-muted">{result.Constructor.name}</td>
                          <td className="py-3 text-center">{result.laps}</td>
                          <td className="py-3 text-center text-f1-light">{result.Time?.time || result.status}</td>
                          <td className="py-3 text-right font-bold text-f1-light">+{result.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-f1-border/40 pt-4 mt-4 text-xs font-bold text-f1-muted uppercase tracking-wider">
                <span>Showing {(raceResultPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(raceResultPage * ITEMS_PER_PAGE, lastRace.Results.length)} of {lastRace.Results.length} Drivers</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setRaceResultPage(Math.max(1, raceResultPage - 1))}
                    disabled={raceResultPage === 1}
                    className={`px-3 py-1 rounded transition ${raceResultPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-f1-light hover:bg-f1-red/10'}`}>
                    PREV
                  </button>
                  <button 
                    onClick={() => setRaceResultPage(Math.min(Math.ceil(lastRace.Results.length / ITEMS_PER_PAGE), raceResultPage + 1))}
                    disabled={raceResultPage === Math.ceil(lastRace.Results.length / ITEMS_PER_PAGE)}
                    className={`px-3 py-1 rounded transition ${raceResultPage === Math.ceil(lastRace.Results.length / ITEMS_PER_PAGE) ? 'opacity-50 cursor-not-allowed bg-[#1a1a24] text-f1-muted' : 'bg-f1-light text-[#0a0a0f] hover:bg-f1-red hover:text-white'}`}>
                    NEXT
                  </button>
                </div>
              </div>
            </div>

            {/* Pit Stop Stats Column */}
            <div className="lg:col-span-1 bg-f1-panel border border-f1-border rounded-lg p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-f1-light mb-1 uppercase tracking-wider">
                  ⏱️ Pit Stop Efficiency
                </h3>
<DataNote kind="Illustration">Fixed example stationary stop durations, not a current team ranking. Total pit-lane time loss is much larger than the tire-change time.</DataNote>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={PIT_STOP_DATA} 
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" opacity={0.4} />
                      <XAxis type="number" stroke="#999999" fontSize={10} domain={[0, 3.5]} tickLine={false} />
                      <YAxis dataKey="team" type="category" stroke="#cccccc" fontSize={12} width={110} tickLine={false} fontWeight="bold" />
                      <Tooltip content={<PlotlyTooltip xKey="team" yFormatter={(val) => `${val}s`} />} />
                      <Bar 
                        dataKey="avgTime" 
                        radius={[0, 2, 2, 0]}
                        barSize={12}
                      >
                        {PIT_STOP_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#e10600'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              <div className="mt-4 p-3.5 bg-f1-dark/60 border border-f1-border rounded text-[11px] text-f1-muted leading-relaxed">
                ℹ️ **Fastest Pit Crew Award**: Red Bull Racing continues to lead pitlane speed profiles, clocking sub-2.2s tire transitions consistently.
              </div>
            </div>
          </div>
        </FadeInSection>
      )}

      {/* SECTION 4: Points Progression Chart */}
      {progressionData.length > 0 && (
        <FadeInSection className="space-y-6">
          <div className="border-l-2 border-f1-red pl-2 mb-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
              Championship Growth
            </h4>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-f1-light tracking-tight">📈 Points Progression Chart</h2>
            <p className="text-f1-muted text-xs mt-1">Cumulative driver points progression over the completed season rounds. Click legend items to toggle lines.</p>
          </div>

          <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressionData} margin={{ top: 20, right: 30, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" opacity={0.4} />
                  <XAxis dataKey="round" stroke="#666666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666666" fontSize={10} tickLine={false} />
                  <Tooltip content={<PlotlyTooltip xKey="round" />} />
                  
                  <ReferenceLine 
                    x={latestCompletedRoundKey} 
                    stroke="#e10600" 
                    strokeDasharray="3 3" 
                    label={{ value: 'LATEST COMPLETED', fill: '#e10600', fontSize: 8, position: 'top', fontWeight: 'bold' }} 
                  />

                  {top5Drivers.map(d => {
                    const id = d.Driver.driverId;
                    const isVisible = visibleDrivers[id] !== false;
                    if (!isVisible) return null;

                    return (
                      <Line 
                        key={id}
                        type="monotone"
                        dataKey={id}
                        name={`${d.Driver.givenName} ${d.Driver.familyName}`}
                        stroke={getDriverColor(d)}
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 1 }}
                        activeDot={{ r: 6 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Custom Interactive Legend */}
            <div className="flex flex-wrap gap-3 justify-center mt-6 border-t border-f1-border/30 pt-4">
              {top5Drivers.map(d => {
                const id = d.Driver.driverId;
                const isVisible = visibleDrivers[id] !== false;
                const color = getDriverColor(d);
                return (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    key={id}
                    onClick={() => toggleDriverVisibility(id)}
                    className={`px-3 py-1.5 rounded-sm border text-[11px] font-bold transition duration-200 flex items-center gap-2 select-none ${
                      isVisible 
                        ? 'bg-[#0f0f18] text-f1-light border-f1-border hover:border-f1-red' 
                        : 'bg-f1-dark/40 text-f1-muted border-f1-border/40 opacity-40 hover:opacity-60'
                    }`}
                    style={{ borderLeftColor: isVisible ? color : undefined, borderLeftWidth: isVisible ? '3px' : undefined }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span>{d.Driver.givenName} {d.Driver.familyName}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </FadeInSection>
      )}

      <AnimatePresence>
        {selectedTableDriver && (
          <DriverSpotlightModal 
            spotlightDriver={selectedTableDriver} 
            onClose={() => setSelectedTableDriver(null)} 
          />
        )}
      </AnimatePresence>
      </>}
    </div>
  );
}

export default LiveSeason;
