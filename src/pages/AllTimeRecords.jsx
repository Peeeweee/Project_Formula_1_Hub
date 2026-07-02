import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllTimeChampions } from '../services/jolpicaApi';
import FadeInSection from '../components/FadeInSection';
import getWikipediaImage from '../utils/getWikipediaImage';

const ChampionCard = ({ champ, rank }) => {
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchId = champ.driver.url || `${champ.driver.givenName} ${champ.driver.familyName}`;
    getWikipediaImage(fetchId).then(url => {
      if (isMounted && url) {
        setImgUrl(url);
      }
    });
    return () => { isMounted = false; };
  }, [champ]);

  const yearsString = champ.years ? [...champ.years].sort((a, b) => b - a).join(', ') : '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (rank % 10) * 0.05, duration: 0.4 }}
      className="bg-[#1a1a24] rounded border border-f1-border flex flex-col hover:border-f1-red/50 transition duration-300 overflow-hidden relative group shadow-lg"
    >
      <div className="h-48 w-full bg-[#111116] relative overflow-hidden">
         {imgUrl ? (
           <img 
             src={imgUrl} 
             alt={`${champ.driver.givenName} ${champ.driver.familyName}`} 
             className="w-full h-full object-cover object-top opacity-60 group-hover:opacity-100 group-hover:scale-105 transition duration-500" 
             loading="lazy"
           />
         ) : (
           <div className="w-full h-full flex flex-col items-center justify-center text-f1-muted/30">
             <span className="text-4xl mb-2">👤</span>
             <span className="text-xs tracking-widest uppercase">No Photo</span>
           </div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] via-[#1a1a24]/40 to-transparent" />
         <div className="absolute top-2 left-3 text-white font-black text-3xl opacity-20 drop-shadow-md">#{rank}</div>
         <div className="absolute bottom-3 right-3 bg-f1-red text-f1-light text-[10px] font-black px-2.5 py-1 rounded-sm shadow-[0_0_10px_rgba(225,6,0,0.4)] tracking-wider">
           {champ.count} {champ.count > 1 ? 'TITLES' : 'TITLE'}
         </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col z-10 -mt-8">
        <h3 className="text-xl font-extrabold text-white mb-1 drop-shadow-md">
          {champ.driver.givenName} {champ.driver.familyName}
        </h3>
        <p className="text-[10px] text-f1-muted uppercase tracking-wider font-bold">
          {champ.driver.nationality}
        </p>
        
        <div className="mt-4 pt-3 border-t border-f1-border/50 text-[10px] text-f1-muted leading-relaxed">
          <span className="block mb-1 text-white font-bold tracking-wider">WINNING YEARS</span> 
          <span className="line-clamp-2" title={yearsString}>{yearsString || 'N/A'}</span>
        </div>
      </div>
    </motion.div>
  );
};

function AllTimeRecords() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lists = await getAllTimeChampions();
        
        // Count championships
        const counts = {};
        lists.forEach(seasonList => {
          const winner = seasonList.DriverStandings?.[0]?.Driver;
          if (winner) {
            if (!counts[winner.driverId]) {
              counts[winner.driverId] = {
                driver: winner,
                count: 0,
                years: []
              };
            }
            counts[winner.driverId].count += 1;
            counts[winner.driverId].years.push(seasonList.season);
          }
        });

        const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
        setChampions(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-16">
      <div>
        <div className="border-l-2 border-f1-red pl-2 mb-2">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
            F1 History
          </h4>
        </div>
        <h1 className="text-3xl font-extrabold text-f1-light tracking-tight flex items-baseline">
          🏆 All-Time Records
        </h1>
        <p className="text-f1-muted text-xs mt-1">Hall of fame spanning decades of Formula 1 World Championships.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-f1-muted text-sm font-bold uppercase tracking-widest">
          Loading Historical Archives...
        </div>
      ) : (
        <FadeInSection>
          <div className="bg-f1-panel border border-f1-border rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-black text-f1-light mb-6 uppercase tracking-wider border-b border-f1-border/40 pb-3">
              World Champions Hall of Fame
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {champions.map((champ, i) => (
                <ChampionCard key={champ.driver.driverId} champ={champ} rank={i + 1} />
              ))}
            </div>
          </div>
        </FadeInSection>
      )}
    </div>
  );
}

export default AllTimeRecords;
