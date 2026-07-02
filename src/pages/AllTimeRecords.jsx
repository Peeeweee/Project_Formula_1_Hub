import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllTimeChampions } from '../services/jolpicaApi';
import FadeInSection from '../components/FadeInSection';

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {champions.map((champ, i) => (
                <motion.div 
                  key={champ.driver.driverId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 10) * 0.05 }}
                  className="bg-[#1a1a24] p-4 rounded border border-f1-border flex flex-col hover:border-f1-red/50 transition duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-f1-muted font-bold text-lg">#{i + 1}</span>
                    <span className="bg-f1-red text-f1-light text-xs font-black px-2 py-1 rounded">
                      {champ.count} Titles
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-f1-light mb-1">
                    {champ.driver.givenName} {champ.driver.familyName}
                  </h3>
                  <p className="text-[10px] text-f1-muted uppercase tracking-wider">
                    {champ.driver.nationality}
                  </p>
                  <div className="mt-4 pt-3 border-t border-f1-border/50 text-[10px] text-f1-muted leading-relaxed">
                    <strong>Winning Years:</strong> {champ.years.reverse().join(', ')}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInSection>
      )}
    </div>
  );
}

export default AllTimeRecords;
