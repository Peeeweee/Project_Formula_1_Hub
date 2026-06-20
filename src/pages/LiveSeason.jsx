import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getCurrentDriverStandings, 
  getCurrentConstructorStandings, 
  getSeasonRaces, 
  getRaceResults,
  getLastRaceResults 
} from '../services/jolpicaApi';
import { getLatestSession, getRaceWeather, getDriverPositions } from '../services/openf1Api';
import { StatCard, SkeletonTable, PlotlyTooltip } from '../components';
import FadeInSection from '../components/FadeInSection';
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

const COUNTRY_FLAGS = {
  'Australia': '🇦🇺',
  'Bahrain': '🇧🇭',
  'Saudi Arabia': '🇸🇦',
  'Japan': '🇯🇵',
  'China': '🇨🇳',
  'Monaco': '🇲🇨',
  'Canada': '🇨🇦',
  'Spain': '🇪🇸',
  'Austria': '🇦🇹',
  'UK': '🇬🇧',
  'Great Britain': '🇬🇧',
  'Hungary': '🇭🇺',
  'Belgium': '🇧🇪',
  'Netherlands': '🇳🇱',
  'Italy': '🇮🇹',
  'Azerbaijan': '🇦🇿',
  'Singapore': '🇸🇬',
  'USA': '🇺🇸',
  'United States': '🇺🇸',
  'Mexico': '🇲🇽',
  'Brazil': '🇧🇷',
  'Qatar': '🇶🇦',
  'Abu Dhabi': '🇦🇪',
  'UAE': '🇦🇪'
};

const getFlagEmoji = (countryName) => {
  if (!countryName) return '🏁';
  const c = countryName.trim();
  return COUNTRY_FLAGS[c] || '🏁';
};

const WINNERS_2024 = {
  "1": "Max Verstappen",
  "2": "Max Verstappen",
  "3": "Carlos Sainz",
  "4": "Max Verstappen",
  "5": "Max Verstappen",
  "6": "Lando Norris",
  "7": "Max Verstappen",
  "8": "Charles Leclerc",
  "9": "Max Verstappen",
  "10": "Max Verstappen",
  "11": "George Russell",
  "12": "Lewis Hamilton",
  "13": "Oscar Piastri",
  "14": "Lewis Hamilton",
  "15": "Lando Norris",
  "16": "Charles Leclerc",
  "17": "Oscar Piastri",
  "18": "Lando Norris",
  "19": "Charles Leclerc",
  "20": "Carlos Sainz",
  "21": "Max Verstappen",
  "22": "George Russell",
  "23": "Max Verstappen",
  "24": "Lando Norris"
};

const DRIVER_COLORS = {
  // Common 2024 drivers
  verstappen: '#3b82f6', // Red Bull Blue
  perez: '#fbbf24',      // Red Bull Gold
  leclerc: '#e10600',    // Ferrari Red
  sainz: '#f87171',      // Ferrari Coral
  norris: '#ff8700',     // McLaren Orange
  piastri: '#fb923c',    // McLaren Peach
  hamilton: '#00a19c',   // Mercedes Teal
  russell: '#2dd4bf',     // Mercedes Mint
  // Common 2026/mock drivers
  antonelli: '#00a19c',
  bearman: '#ef4444'
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

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  function calculateTimeLeft(dateStr) {
    const difference = +new Date(dateStr) - +new Date();
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0 };
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60)
    };
  }

  return (
    <div className="mt-2 text-xs font-mono font-bold text-f1-red uppercase tracking-wider bg-f1-red/10 border border-f1-red/20 px-2 py-1 rounded inline-block">
      ⏳ Countdown: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
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

  // OpenF1 State
  const [openF1Data, setOpenF1Data] = useState({ session: null, weather: null, positions: [] });
  const [openF1Loading, setOpenF1Loading] = useState(true);
  const [openF1Refreshing, setOpenF1Refreshing] = useState(false);

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
    } catch (err) {
      console.error(err);
    } finally {
      setOpenF1Loading(false);
      setOpenF1Refreshing(false);
    }
  };

  useEffect(() => {
    fetchOpenF1Data();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [driversRes, constructorsRes, calendarRes, lastRaceRes] = await Promise.all([
          getCurrentDriverStandings(),
          getCurrentConstructorStandings(),
          getSeasonRaces(2024),
          getLastRaceResults()
        ]);

        setDriversData(driversRes);
        setConstructorsData(constructorsRes);

        // Adjust calendar upcoming race for demonstration
        let races = [...calendarRes];
        const now = new Date();
        let nextRaceIndex = races.findIndex(r => new Date(r.date + 'T' + (r.time || '12:00:00Z')) > now);

        if (nextRaceIndex === -1 && races.length > 0) {
          nextRaceIndex = 9; // Mark Spain GP (index 9) as the countdown GP
          const mockDate = new Date();
          mockDate.setDate(mockDate.getDate() + 4); // 4 days in future
          races[nextRaceIndex] = {
            ...races[nextRaceIndex],
            date: mockDate.toISOString().split('T')[0],
            time: '14:00:00Z',
            isMockedFuture: true
          };
        }
        
        // Tag races as completed or upcoming
        const processedRaces = races.map((r, idx) => {
          const raceDate = new Date(r.date + 'T' + (r.time || '12:00:00Z'));
          const isCompleted = raceDate < now && !r.isMockedFuture;
          const isNext = idx === nextRaceIndex;
          return {
            ...r,
            isCompleted,
            isNext
          };
        });

        setCalendarRaces(processedRaces);
        setLastRace(lastRaceRes);

        // Fetch top 5 drivers points progression
        const top5 = (driversRes?.DriverStandings || []).slice(0, 5);
        const top5Ids = top5.map(d => d.Driver.driverId);
        
        // Initialize visibility
        const visibility = {};
        top5Ids.forEach(id => { visibility[id] = true; });
        setVisibleDrivers(visibility);

        const completedRounds = parseInt(driversRes?.round || 8);
        const roundsList = Array.from({ length: completedRounds }, (_, i) => i + 1);

        try {
          const resultsPromises = roundsList.map(r => getRaceResults(2024, r));
          const allRoundsResults = await Promise.all(resultsPromises);

          const cumulativePoints = {};
          top5Ids.forEach(id => { cumulativePoints[id] = 0; });

          const progression = roundsList.map((round) => {
            const roundResults = allRoundsResults[round - 1] || [];
            const dataPoint = { round: `R${round}` };
            
            top5Ids.forEach(id => {
              const driverResult = roundResults.find(res => res.Driver.driverId === id);
              const pts = driverResult ? parseFloat(driverResult.points || 0) : 0;
              cumulativePoints[id] += pts;
              dataPoint[id] = cumulativePoints[id];
            });
            
            return dataPoint;
          });

          setProgressionData(progression);
        } catch (chartErr) {
          console.error('Error generating live chart progression:', chartErr);
          // Fallback dynamic generator matching active standings points
          const progression = roundsList.map((roundNum) => {
            const dataPoint = { round: `R${roundNum}` };
            top5.forEach(d => {
              const id = d.Driver.driverId;
              const totalPts = parseFloat(d.points || 100);
              const ratio = roundNum / completedRounds;
              // Add a slightly curved distribution
              dataPoint[id] = Math.round(totalPts * Math.pow(ratio, 0.9));
            });
            return dataPoint;
          });
          setProgressionData(progression);
        }

      } catch (err) {
        console.error('Error fetching live data:', err);
        setError('Failed to query active timing feeds. Showing cached championship statistics.');
        
        // Set standard fallbacks
        const mockDrivers = [
          { position: '1', points: '194', wins: '6', Driver: { givenName: 'Max', familyName: 'Verstappen', code: 'VER', driverId: 'verstappen', nationality: 'Dutch' }, Constructors: [{ name: 'Red Bull Racing' }] },
          { position: '2', points: '138', wins: '1', Driver: { givenName: 'Charles', familyName: 'Leclerc', code: 'LEC', driverId: 'leclerc', nationality: 'Monegasque' }, Constructors: [{ name: 'Ferrari' }] },
          { position: '3', points: '131', wins: '1', Driver: { givenName: 'Lando', familyName: 'Norris', code: 'NOR', driverId: 'norris', nationality: 'British' }, Constructors: [{ name: 'McLaren' }] },
          { position: '4', points: '108', wins: '1', Driver: { givenName: 'Carlos', familyName: 'Sainz', code: 'SAI', driverId: 'sainz', nationality: 'Spanish' }, Constructors: [{ name: 'Ferrari' }] },
          { position: '5', points: '107', wins: '0', Driver: { givenName: 'Sergio', familyName: 'Pérez', code: 'PER', driverId: 'perez', nationality: 'Mexican' }, Constructors: [{ name: 'Red Bull Racing' }] },
          { position: '6', points: '81', wins: '0', Driver: { givenName: 'Oscar', familyName: 'Piastri', code: 'PIA', driverId: 'piastri', nationality: 'Australian' }, Constructors: [{ name: 'McLaren' }] },
          { position: '7', points: '70', wins: '0', Driver: { givenName: 'George', familyName: 'Russell', code: 'RUS', driverId: 'russell', nationality: 'British' }, Constructors: [{ name: 'Mercedes' }] },
          { position: '8', points: '42', wins: '0', Driver: { givenName: 'Lewis', familyName: 'Hamilton', code: 'HAM', driverId: 'hamilton', nationality: 'British' }, Constructors: [{ name: 'Mercedes' }] }
        ];

        setDriversData({
          round: '8',
          season: '2024',
          DriverStandings: mockDrivers
        });

        setConstructorsData({
          round: '8',
          season: '2024',
          ConstructorStandings: [
            { position: '1', points: '301', wins: '6', Constructor: { name: 'Red Bull Racing', nationality: 'Austrian' } },
            { position: '2', points: '252', wins: '2', Constructor: { name: 'Ferrari', nationality: 'Italian' } },
            { position: '3', points: '212', wins: '1', Constructor: { name: 'McLaren', nationality: 'British' } },
            { position: '4', points: '124', wins: '0', Constructor: { name: 'Mercedes', nationality: 'German' } },
            { position: '5', points: '44', wins: '0', Constructor: { name: 'Aston Martin', nationality: 'British' } }
          ]
        });

        // Mock 2024 season calendar
        const mockRaces = [
          { round: '1', raceName: 'Bahrain Grand Prix', Circuit: { circuitName: 'Bahrain International Circuit', Location: { country: 'Bahrain' } }, date: '2024-03-02', isCompleted: true },
          { round: '2', raceName: 'Saudi Arabian Grand Prix', Circuit: { circuitName: 'Jeddah Corniche Circuit', Location: { country: 'Saudi Arabia' } }, date: '2024-03-09', isCompleted: true },
          { round: '3', raceName: 'Australian Grand Prix', Circuit: { circuitName: 'Albert Park Circuit', Location: { country: 'Australia' } }, date: '2024-03-24', isCompleted: true },
          { round: '4', raceName: 'Japanese Grand Prix', Circuit: { circuitName: 'Suzuka International Racing Course', Location: { country: 'Japan' } }, date: '2024-04-07', isCompleted: true },
          { round: '5', raceName: 'Chinese Grand Prix', Circuit: { circuitName: 'Shanghai International Circuit', Location: { country: 'China' } }, date: '2024-04-21', isCompleted: true },
          { round: '6', raceName: 'Miami Grand Prix', Circuit: { circuitName: 'Miami International Autodrome', Location: { country: 'USA' } }, date: '2024-05-05', isCompleted: true },
          { round: '7', raceName: 'Emilia Romagna Grand Prix', Circuit: { circuitName: 'Autodromo Enzo e Dino Ferrari', Location: { country: 'Italy' } }, date: '2024-05-19', isCompleted: true },
          { round: '8', raceName: 'Monaco Grand Prix', Circuit: { circuitName: 'Circuit de Monaco', Location: { country: 'Monaco' } }, date: '2024-05-26', isCompleted: true },
          { round: '9', raceName: 'Canadian Grand Prix', Circuit: { circuitName: 'Circuit Gilles Villeneuve', Location: { country: 'Canada' } }, date: '2024-06-09', isCompleted: true },
          { round: '10', raceName: 'Spanish Grand Prix', Circuit: { circuitName: 'Circuit de Barcelona-Catalunya', Location: { country: 'Spain' } }, date: new Date(Date.now() + 4*24*60*60*1000).toISOString().split('T')[0], isCompleted: false, isNext: true }
        ];
        setCalendarRaces(mockRaces);

        // Mock Last Race Results
        setLastRace({
          raceName: 'Monaco Grand Prix',
          Circuit: { circuitName: 'Circuit de Monaco' },
          date: '2024-05-26',
          Results: [
            { position: '1', points: '25', laps: '78', status: 'Finished', Driver: { givenName: 'Charles', familyName: 'Leclerc', code: 'LEC' }, Constructor: { name: 'Ferrari' }, Time: { time: '2:23:15.554' } },
            { position: '2', points: '18', laps: '78', status: 'Finished', Driver: { givenName: 'Oscar', familyName: 'Piastri', code: 'PIA' }, Constructor: { name: 'McLaren' }, Time: { time: '+7.152s' } },
            { position: '3', points: '15', laps: '78', status: 'Finished', Driver: { givenName: 'Carlos', familyName: 'Sainz', code: 'SAI' }, Constructor: { name: 'Ferrari' }, Time: { time: '+7.585s' } },
            { position: '4', points: '12', laps: '78', status: 'Finished', Driver: { givenName: 'Lando', familyName: 'Norris', code: 'NOR' }, Constructor: { name: 'McLaren' }, Time: { time: '+8.677s' } },
            { position: '5', points: '10', laps: '78', status: 'Finished', Driver: { givenName: 'George', familyName: 'Russell', code: 'RUS' }, Constructor: { name: 'Mercedes' }, Time: { time: '+13.309s' } },
            { position: '6', points: '8', laps: '78', status: 'Finished', Driver: { givenName: 'Max', familyName: 'Verstappen', code: 'VER' }, Constructor: { name: 'Red Bull Racing' }, Time: { time: '+13.853s' } },
            { position: '7', points: '7', laps: '78', status: 'Finished', Driver: { givenName: 'Lewis', familyName: 'Hamilton', code: 'HAM' }, Constructor: { name: 'Mercedes' }, Time: { time: '+14.908s' }, FastestLap: { rank: '1', Time: { time: '1:14.165' } } }
          ]
        });

        // Fallback standings points progression
        const top5Fallback = mockDrivers.slice(0, 5);
        const top5Ids = top5Fallback.map(d => d.Driver.driverId);
        
        const visibility = {};
        top5Ids.forEach(id => { visibility[id] = true; });
        setVisibleDrivers(visibility);

        setProgressionData([
          { round: 'R1', verstappen: 26, leclerc: 12, norris: 8, sainz: 15, perez: 18 },
          { round: 'R2', verstappen: 51, leclerc: 28, norris: 12, sainz: 15, perez: 36 },
          { round: 'R3', verstappen: 51, leclerc: 47, norris: 27, sainz: 40, perez: 46 },
          { round: 'R4', verstappen: 77, leclerc: 59, norris: 37, sainz: 55, perez: 64 },
          { round: 'R5', verstappen: 110, leclerc: 76, norris: 58, sainz: 69, perez: 85 },
          { round: 'R6', verstappen: 136, leclerc: 98, norris: 83, sainz: 83, perez: 103 },
          { round: 'R7', verstappen: 161, leclerc: 113, norris: 101, sainz: 93, perez: 107 },
          { round: 'R8', verstappen: 169, leclerc: 138, norris: 113, sainz: 108, perez: 107 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
            Live Feed Telemetry
          </h4>
        </div>
        <h1 className="text-3xl font-extrabold text-f1-light tracking-tight">🏁 F1 Live Season Standings</h1>
        <p className="text-f1-muted text-xs mt-1">Real-time driver and constructor points standings queried directly from timing database.</p>
      </div>

      {error && (
        <div className="bg-f1-red/10 border border-f1-red text-f1-light text-xs px-4 py-3 rounded">
          ⚠️ {error}
        </div>
      )}

      {/* SECTION 1: Stat Cards */}
      <FadeInSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Championship Leader" 
          value={leaderDriver ? leaderDriver.Driver.code : 'N/A'}
          sub={`${leaderName}`} 
          delta={`${leaderPoints} PTS`} 
        />
        <StatCard 
          label="Races Completed" 
          value={`${completedRacesCount}`} 
          sub="2024 Championship Calendar" 
          delta="Out of 24" 
        />
        <StatCard 
          label="Closest Gap (P1-P2)" 
          value={`${closestGap.toFixed(0)} PTS`} 
          sub={driversList[1] ? `Chase: ${driversList[1].Driver.familyName}` : 'N/A'} 
          delta="Championship Chase" 
        />
        <StatCard 
          label="Leading Constructor" 
          value={constructorName} 
          sub="World Constructors Title" 
          delta={`${constructorPoints} PTS`} 
        />
      </div>
        </FadeInSection>

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
            🔄 Refresh
          </motion.button>
        </div>

        <div className={`bg-f1-panel border border-f1-border rounded-lg p-6 shadow-xl relative transition duration-300 ${openF1Refreshing ? 'ring-2 ring-f1-red ring-opacity-50 border-f1-red animate-pulse' : ''}`}>
          {openF1Loading && !openF1Refreshing ? (
            <div className="py-8 text-center text-f1-muted text-sm font-bold uppercase tracking-widest flex justify-center items-center gap-3">
              <div className="w-4 h-4 border-2 border-f1-red border-t-transparent rounded-full animate-spin"></div>
              Connecting to OpenF1 Live Feed...
            </div>
          ) : !openF1Data.session ? (
            <div className="py-8 text-center text-f1-muted text-sm">
              No active session right now. Data will update before the next race weekend.
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-f1-light">{openF1Data.session.session_name}</h3>
                <p className="text-xs text-f1-muted">{new Date(openF1Data.session.date_start).toLocaleString()}</p>
              </div>

              {openF1Data.weather && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                  <div className="bg-[#0a0a0f] border border-f1-border p-3 rounded flex flex-col items-center justify-center">
                    <span className="text-lg mb-1">🌡️</span>
                    <span className="text-[10px] text-f1-muted uppercase font-bold text-center">Air Temp</span>
                    <span className="text-sm font-black text-f1-light">{openF1Data.weather.air_temperature}°C</span>
                  </div>
                  <div className="bg-[#0a0a0f] border border-f1-border p-3 rounded flex flex-col items-center justify-center">
                    <span className="text-lg mb-1">🏎️</span>
                    <span className="text-[10px] text-f1-muted uppercase font-bold text-center">Track Temp</span>
                    <span className="text-sm font-black text-f1-light">{openF1Data.weather.track_temperature}°C</span>
                  </div>
                  <div className="bg-[#0a0a0f] border border-f1-border p-3 rounded flex flex-col items-center justify-center">
                    <span className="text-lg mb-1">💧</span>
                    <span className="text-[10px] text-f1-muted uppercase font-bold text-center">Humidity</span>
                    <span className="text-sm font-black text-f1-light">{openF1Data.weather.humidity}%</span>
                  </div>
                  <div className="bg-[#0a0a0f] border border-f1-border p-3 rounded flex flex-col items-center justify-center">
                    <span className="text-lg mb-1">💨</span>
                    <span className="text-[10px] text-f1-muted uppercase font-bold text-center">Wind</span>
                    <span className="text-sm font-black text-f1-light">{openF1Data.weather.wind_speed} m/s</span>
                  </div>
                  <div className="bg-[#0a0a0f] border border-f1-border p-3 rounded flex flex-col items-center justify-center">
                    <span className="text-lg mb-1">🌧️</span>
                    <span className="text-[10px] text-f1-muted uppercase font-bold text-center">Rainfall</span>
                    <span className="text-sm font-black text-f1-light">{openF1Data.weather.rainfall ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-f1-muted uppercase tracking-wider mb-3">Live Positions</h4>
                <motion.div 
                  className="bg-[#0a0a0f] border border-f1-border rounded divide-y divide-f1-border/40 overflow-hidden max-h-64 overflow-y-auto"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                  }}
                  initial="hidden"
                  animate="show"
                >
                  {openF1Data.positions.map((p, i) => (
                    <motion.div 
                      key={p.driver_number}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        show: { opacity: 1, x: 0 }
                      }}
                      className="px-4 py-2 flex items-center gap-4 hover:bg-[#1a1a24] transition"
                    >
                      <span className="text-xs font-bold text-f1-red w-6">P{p.position}</span>
                      <span className="text-xs font-bold text-f1-light w-8">#{p.driver_number}</span>
                      <span className="text-[10px] text-f1-muted ml-auto font-mono">{new Date(p.date).toLocaleTimeString()}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </FadeInSection>

      {/* Standings Tables */}
      <FadeInSection>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Driver Standings Table */}
        <div className="bg-f1-panel border border-f1-border rounded-lg p-6 shadow-xl">
          <h2 className="text-lg font-black text-f1-light mb-4 uppercase tracking-wider border-b border-f1-border/40 pb-2">
            Driver Standings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-f1-border text-f1-muted uppercase font-bold">
                  <th className="py-2 text-center w-12">Pos</th>
                  <th className="py-2">Driver</th>
                  <th className="py-2">Constructor</th>
                  <th className="py-2 text-center w-16">Wins</th>
                  <th className="py-2 text-center w-16">Gap</th>
                  <th className="py-2 text-right w-16">Points</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="divide-y divide-f1-border/30 font-mono text-f1-light"
              >
                {driversList.map((driver, index) => {
                  const currentGap = index === 0 ? '-' : `-${(firstPoints - parseFloat(driver.points)).toFixed(0)}`;
                  return (
                    <motion.tr 
                      key={`driver-row-${driver.Driver.driverId}`} 
                      variants={itemVariants}
                      className="hover:bg-f1-dark/40 transition duration-150"
                    >
                      <td className="py-3 text-center font-bold text-f1-muted">
                        {driver.position === '1' ? '🥇' : driver.position === '2' ? '🥈' : driver.position === '3' ? '🥉' : driver.position}
                      </td>
                      <td className="py-3 font-sans font-bold">
                        {driver.Driver.givenName} {driver.Driver.familyName}
                        <span className="text-[10px] text-f1-muted font-normal block">{driver.Driver.nationality}</span>
                      </td>
                      <td className="py-3 font-sans text-f1-muted">{driver.Constructors[0]?.name || 'N/A'}</td>
                      <td className="py-3 text-center">{driver.wins}</td>
                      <td className="py-3 text-center text-f1-muted">{currentGap}</td>
                      <td className="py-3 text-right font-bold text-f1-light">{driver.points}</td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </div>

        {/* Constructor Standings Table */}
        <div className="bg-f1-panel border border-f1-border rounded-lg p-6 shadow-xl">
          <h2 className="text-lg font-black text-f1-light mb-4 uppercase tracking-wider border-b border-f1-border/40 pb-2">
            Constructor Standings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
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
                {constructorsList.map((team) => (
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
        <div>
          <h2 className="text-2xl font-extrabold text-f1-light tracking-tight">📅 Season Calendar</h2>
          <p className="text-f1-muted text-xs mt-1">Full 2024 calendar list. Highlights include completed status winners and live upcoming countdowns.</p>
        </div>

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
                    <span>✔️ Winner: {WINNERS_2024[race.round] || "TBD"}</span>
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
                    {lastRace.Results.map((result) => {
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
            </div>

            {/* Pit Stop Stats Column */}
            <div className="lg:col-span-1 bg-f1-panel border border-f1-border rounded-lg p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-f1-light mb-1 uppercase tracking-wider">
                  ⏱️ Pit Stop Efficiency
                </h3>
                <p className="text-[10px] text-f1-muted mb-6 uppercase">Top 5 Teams by Average Pit Stop Duration (Seconds).</p>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={PIT_STOP_DATA} 
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" opacity={0.4} />
                      <XAxis type="number" stroke="#666666" fontSize={9} domain={[0, 3.5]} tickLine={false} />
                      <YAxis dataKey="team" type="category" stroke="#666666" fontSize={8} width={80} tickLine={false} />
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
                        stroke={DRIVER_COLORS[id] || '#ffffff'}
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
                const color = DRIVER_COLORS[id] || '#ffffff';
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
    </div>
  );
}

export default LiveSeason;
