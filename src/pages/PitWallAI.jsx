import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ZAxis, Cell } from 'recharts';
import * as d3 from 'd3';
import driverClusters from '../data/driver_clusters.json';
import podiumPredictions from '../data/podium_predictions.json';
import anomalySummary from '../data/lap_anomalies/summary.json';
import networkData from '../data/sna/constructor_network.json';
import FadeInSection from '../components/FadeInSection';
import { SkeletonCard, PlotlyTooltip } from '../components';

const STRATEGIES = {
  oneStopSoftHard: {
    name: '1-Stop: Soft → Hard',
    pitLap: 22,
    predictedDuration: '1h 22m 14.510s',
    degGraph: [
      { lap: 1, grip: 100, type: 'Soft' },
      { lap: 10, grip: 88, type: 'Soft' },
      { lap: 20, grip: 70, type: 'Soft' },
      { lap: 22, grip: 30, type: 'PitStop' },
      { lap: 23, grip: 98, type: 'Hard' },
      { lap: 35, grip: 92, type: 'Hard' },
      { lap: 50, grip: 84, type: 'Hard' },
      { lap: 70, grip: 72, type: 'Hard' }
    ]
  },
  oneStopMediumHard: {
    name: '1-Stop: Medium → Hard',
    pitLap: 28,
    predictedDuration: '1h 21m 58.215s',
    degGraph: [
      { lap: 1, grip: 98, type: 'Medium' },
      { lap: 15, grip: 88, type: 'Medium' },
      { lap: 27, grip: 72, type: 'Medium' },
      { lap: 28, grip: 30, type: 'PitStop' },
      { lap: 29, grip: 98, type: 'Hard' },
      { lap: 45, grip: 88, type: 'Hard' },
      { lap: 60, grip: 79, type: 'Hard' },
      { lap: 70, grip: 73, type: 'Hard' }
    ]
  },
  twoStopSoftMediumSoft: {
    name: '2-Stop: Soft → Medium → Soft',
    pitLap: 18,
    predictedDuration: '1h 22m 30.142s',
    degGraph: [
      { lap: 1, grip: 100, type: 'Soft' },
      { lap: 17, grip: 74, type: 'Soft' },
      { lap: 18, grip: 30, type: 'PitStop' },
      { lap: 19, grip: 98, type: 'Medium' },
      { lap: 35, grip: 84, type: 'Medium' },
      { lap: 48, grip: 70, type: 'Medium' },
      { lap: 49, grip: 30, type: 'PitStop' },
      { lap: 50, grip: 100, type: 'Soft' },
      { lap: 70, grip: 80, type: 'Soft' }
    ]
  }
};

const CLUSTER_COLORS = {
  0: '#e10600', // f1-red
  1: '#00d2be', // mercedes-teal-ish
  2: '#ff8700', // mclaren-orange-ish
  3: '#1f48ed'  // alpine/blue
};

// Tooltip for Driver Cluster Scatter
const DriverTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = CLUSTER_COLORS[data.cluster] || '#e10600';
    return (
      <div 
        className="plotly-tooltip bg-[#1f2c3f]/95 border border-white/10 rounded px-3 py-2 text-[11px] text-white shadow-2xl pointer-events-none font-mono z-50"
        style={{
          borderLeft: `4px solid ${color}`,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <div className="border-b border-white/15 pb-1 mb-1 font-bold text-gray-300">
          Driver={data.name}
        </div>
        <div className="space-y-1">
          <div><span className="text-gray-400 font-semibold">archetype</span>={data.clusterLabel}</div>
          <div><span className="text-gray-400 font-semibold">podium_rate</span>={(data.podium_rate * 100).toFixed(1)}%</div>
          <div><span className="text-gray-400 font-semibold">avg_position_gain</span>={data.avg_position_gain > 0 ? '+' : ''}{data.avg_position_gain.toFixed(2)}</div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Dot for Anomaly Line Chart
const AnomalyDot = (props) => {
  const { cx, cy, payload } = props;
  if (payload.isAnomaly) {
    return (
      <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="#e10600" viewBox="0 0 10 10">
        <polygon points="5,0 10,5 5,10 0,5" />
      </svg>
    );
  }
  return <circle cx={cx} cy={cy} r={2} fill="#ffffff" />;
};

// Tooltip for Anomaly Line Chart
const AnomalyTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = data.isAnomaly ? '#e10600' : '#4a4a5a';
    return (
      <div 
        className="plotly-tooltip bg-[#1f2c3f]/95 border border-white/10 rounded px-3 py-2 text-[11px] text-white shadow-2xl pointer-events-none font-mono z-50"
        style={{
          borderLeft: `4px solid ${color}`,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <div className="border-b border-white/15 pb-1 mb-1 font-bold text-gray-300">
          lap={data.lap}
        </div>
        <div className="space-y-1">
          <div><span className="text-gray-400 font-semibold">seconds</span>={(data.seconds).toFixed(3)}s</div>
          {data.isAnomaly && (
            <div className="mt-1 text-f1-red font-bold">
              ⚠️ {data.reason}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// D3 Force Directed Graph Component
const ConstructorNetworkGraph = ({ data, onTooltip }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    
    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 800;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height]);

    // Clone data
    const nodes = data.nodes.map(d => ({...d}));
    const links = data.links.map(d => ({...d}));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => Math.max(10, Math.sqrt(d.wins) * 4) + 10));

    const link = svg.append('g')
      .attr('stroke', '#4a4a5a')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value) * 3);

    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => Math.max(8, Math.sqrt(d.wins) * 4))
      .attr('fill', d => d.color)
      .attr('cursor', 'grab')
      .call(drag(simulation));

    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('dy', 4)
      .attr('dx', d => Math.max(8, Math.sqrt(d.wins) * 4) + 6)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#f0f0f0')
      .attr('pointer-events', 'none')
      .text(d => d.id);

    // Hover interactions
    node.on('mouseover', (event, d) => {
      // Highlight links
      link
        .attr('stroke', l => l.source.id === d.id || l.target.id === d.id ? '#ffffff' : '#2a2a35')
        .attr('stroke-opacity', l => l.source.id === d.id || l.target.id === d.id ? 1 : 0.1);
      
      // Highlight nodes
      node
        .attr('opacity', n => n.id === d.id || links.some(l => (l.source.id === d.id && l.target.id === n.id) || (l.target.id === d.id && l.source.id === n.id)) ? 1 : 0.2);
        
      label
        .attr('opacity', n => n.id === d.id || links.some(l => (l.source.id === d.id && l.target.id === n.id) || (l.target.id === d.id && l.source.id === n.id)) ? 1 : 0.2);

      // Find top shared connection
      const connectedEdges = links.filter(l => l.source.id === d.id || l.target.id === d.id);
      let topConnection = "None";
      if (connectedEdges.length > 0) {
        const topEdge = connectedEdges.reduce((prev, curr) => (prev.value > curr.value) ? prev : curr);
        topConnection = topEdge.source.id === d.id ? topEdge.target.id : topEdge.source.id;
      }

      onTooltip({
        visible: true,
        x: event.pageX,
        y: event.pageY,
        name: d.id,
        wins: d.wins,
        topConnection
      });
    })
    .on('mouseout', () => {
      link.attr('stroke', '#4a4a5a').attr('stroke-opacity', 0.6);
      node.attr('opacity', 1);
      label.attr('opacity', 1);
      onTooltip({ visible: false });
    });

    simulation.on('tick', () => {
      // Constrain nodes within bounds
      nodes.forEach(d => {
        const r = Math.max(8, Math.sqrt(d.wins) * 4);
        d.x = Math.max(r + 10, Math.min(width - r - 10, d.x));
        d.y = Math.max(r + 10, Math.min(height - r - 10, d.y));
      });

      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    return () => simulation.stop();

    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
        d3.select(this).attr('cursor', 'grabbing');
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
        d3.select(this).attr('cursor', 'grab');
      }
      
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

  }, [data, onTooltip]);

  return <svg ref={svgRef} className="w-full h-full" />;
};


const CIRCUITS = ["Monaco", "Silverstone", "Monza", "Spa", "Suzuka"];

function PitWallAI() {
  const [selectedStrategyKey, setSelectedStrategyKey] = useState('oneStopMediumHard');
  const activeStrategy = STRATEGIES[selectedStrategyKey];

  // Clustering State
  const [highlightedCluster, setHighlightedCluster] = useState(null);

  // Predictor State
  const [selectedCircuit, setSelectedCircuit] = useState("Monaco");

  // Anomaly State
  const [selectedAnomalyDriver, setSelectedAnomalyDriver] = useState(
    anomalySummary.length > 0 ? anomalySummary[0].driverId : null
  );
  const [anomalyLapData, setAnomalyLapData] = useState([]);

  // SNA State
  const [selectedEra, setSelectedEra] = useState("2010-2013");
  const [snaTooltip, setSnaTooltip] = useState({ visible: false });

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedAnomalyDriver) {
      import(`../data/lap_anomalies/driver_${selectedAnomalyDriver}_anomalies.json`)
        .then(module => {
          const processedData = module.default.map(d => ({
            ...d,
            seconds: d.milliseconds / 1000
          }));
          setAnomalyLapData(processedData);
        })
        .catch(err => {
          console.error("Failed to load anomaly data for driver", selectedAnomalyDriver, err);
          setAnomalyLapData([]);
        });
    }
  }, [selectedAnomalyDriver]);

  // Prepare Clustering Data
  const clusters = [0, 1, 2, 3];
  const clusterSummaries = clusters.map(c => {
    const drivers = driverClusters.filter(d => d.cluster === c);
    const label = drivers.length > 0 ? drivers[0].clusterLabel : `Cluster ${c}`;
    const sorted = [...drivers].sort((a, b) => b.podium_rate - a.podium_rate);
    const top3 = sorted.slice(0, 3);
    
    return {
      clusterId: c,
      label,
      color: CLUSTER_COLORS[c],
      count: drivers.length,
      top3
    };
  });

  // Prepare Predictor Data
  const currentPredictions = useMemo(() => {
    return podiumPredictions
      .filter(p => p.circuit === selectedCircuit)
      .sort((a, b) => b.podiumProbability - a.podiumProbability);
  }, [selectedCircuit]);

  const likelyWinner = currentPredictions.length > 0 ? currentPredictions[0] : null;

  // Prepare Anomaly Table Data
  const flaggedLaps = useMemo(() => {
    const laps = anomalyLapData.filter(d => d.isAnomaly);
    if (anomalyLapData.length > 0) {
      const sortedMs = [...anomalyLapData].map(d => d.milliseconds).sort((a, b) => a - b);
      const mid = Math.floor(sortedMs.length / 2);
      const medianMs = sortedMs.length % 2 !== 0 ? sortedMs[mid] : (sortedMs[mid - 1] + sortedMs[mid]) / 2;
      
      return laps.map(l => {
        const dev = ((l.milliseconds - medianMs) / medianMs) * 100;
        return { ...l, deviation: dev };
      });
    }
    return [];
  }, [anomalyLapData]);

  const currentAnomalyDriverData = anomalySummary.find(d => d.driverId === selectedAnomalyDriver);

  // Prepare SNA Data
  let currentNetworkData = networkData[selectedEra];
  if (isMobile && currentNetworkData) {
    const top10Nodes = [...currentNetworkData.nodes]
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10);
    const top10Ids = top10Nodes.map(n => n.id);
    const top10Links = currentNetworkData.links.filter(
      l => top10Ids.includes(l.source) && top10Ids.includes(l.target)
    );
    currentNetworkData = {
      ...currentNetworkData,
      nodes: top10Nodes,
      links: top10Links
    };
  }

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-20 relative">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-f1-light tracking-tight">🧠 Pit Wall AI</h1>
        <p className="text-f1-muted text-sm mt-2 max-w-2xl">Advanced telemetry, driver archetypes, optimal race strategy simulations, and AI-driven predictive modeling.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="space-y-20">
          {/* SECTION 1: Driver Clustering */}
          <FadeInSection>
        <h2 className="text-xl md:text-2xl font-bold text-f1-light mb-6 flex items-center gap-2 border-b-2 border-f1-border pb-2 uppercase tracking-wide">
          🏎️ Driver Archetypes
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-f1-light">Cluster Distribution</h3>
              <button 
                className="text-xs font-semibold text-f1-muted hover:text-f1-red transition-colors"
                onClick={() => setHighlightedCluster(null)}
              >
                Reset Filter
              </button>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" opacity={0.6} />
                  <XAxis 
                    type="number" 
                    dataKey="podium_rate" 
                    name="Podium Rate" 
                    stroke="#666666" 
                    fontSize={12} 
                    tickLine={false} 
                    domain={['auto', 'auto']}
                    label={{ value: "Podium Rate (Ratio)", position: "insideBottom", offset: -10, fill: "#666" }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="avg_position_gain" 
                    name="Position Gain" 
                    stroke="#666666" 
                    fontSize={12} 
                    tickLine={false} 
                    domain={['auto', 'auto']}
                    label={{ value: "Avg Position Gain", angle: -90, position: "insideLeft", fill: "#666" }}
                  />
                  <ZAxis type="category" dataKey="name" name="Driver" />
                  <Tooltip content={<DriverTooltip />} cursor={{strokeDasharray: '3 3'}} />
                  <Scatter 
                    name="Drivers" 
                    data={driverClusters} 
                  >
                    {
                      driverClusters.map((entry, index) => {
                        const isFaded = highlightedCluster !== null && highlightedCluster !== entry.cluster;
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CLUSTER_COLORS[entry.cluster]} 
                            fillOpacity={isFaded ? 0.1 : 0.8}
                            stroke={isFaded ? 'transparent' : '#fff'}
                            strokeWidth={isFaded ? 0 : 1}
                            className="transition-all duration-300"
                          />
                        );
                      })
                    }
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-f1-light mb-2">Cluster Profiles</h3>
            {clusterSummaries.map(summary => {
              const isSelected = highlightedCluster === summary.clusterId;
              const isFaded = highlightedCluster !== null && !isSelected;

              return (
                <motion.button
                  key={summary.clusterId}
                  onClick={() => setHighlightedCluster(isSelected ? null : summary.clusterId)}
                  whileHover={{ scale: isFaded ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border text-left transition-all duration-300 relative overflow-hidden ${
                    isSelected 
                      ? 'bg-f1-panel border-f1-light shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                      : 'bg-f1-panel/40 border-f1-border hover:bg-f1-panel'
                  } ${isFaded ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: summary.color }}></div>
                  <div className="pl-2 flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-f1-light">{summary.label}</h4>
                    </div>
                    <span className="text-[10px] font-bold bg-[#1a1a24] text-f1-muted px-2 py-0.5 rounded uppercase tracking-widest">
                      {summary.count} Drivers
                    </span>
                  </div>
                  
                  <div className="mt-3 pl-2">
                    <p className="text-[10px] text-f1-muted uppercase tracking-wider font-semibold mb-1">Top Drivers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.top3.length > 0 ? summary.top3.map(d => (
                        <span key={d.driverId} className="text-[10px] bg-black/30 border border-[#2a2a35] text-gray-300 px-1.5 py-0.5 rounded-sm">
                          {d.name}
                        </span>
                      )) : (
                        <span className="text-[11px] text-gray-500">None</span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </FadeInSection>

      {/* SECTION 2: Podium Predictor */}
      <FadeInSection>
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 border-b-2 border-f1-border pb-2 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-f1-light flex items-center gap-2 uppercase tracking-wide">
            🏆 AI Podium Predictor
          </h2>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-f1-muted uppercase tracking-wider">Circuit Select</label>
            <select 
              className="bg-f1-panel border border-f1-border text-f1-light text-sm rounded px-3 py-1.5 focus:outline-none focus:border-f1-red transition-colors"
              value={selectedCircuit}
              onChange={(e) => setSelectedCircuit(e.target.value)}
            >
              {CIRCUITS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl">
              <h3 className="text-sm font-bold text-f1-muted mb-6 uppercase tracking-wider">Simulated Podium Probabilities</h3>
              <div className="flex flex-col gap-4">
                {currentPredictions.map((pred, idx) => (
                  <div key={pred.driverId} className="flex items-center gap-4 group">
                    <div className="w-6 text-right font-black text-f1-muted text-sm group-hover:text-f1-light transition-colors">
                      {idx + 1}
                    </div>
                    <div className="w-1.5 h-6 rounded-sm" style={{ backgroundColor: pred.teamColor || '#666' }}></div>
                    <div className="w-32 md:w-48 font-bold text-sm text-f1-light truncate">
                      {pred.driverName}
                    </div>
                    <div className="flex-1 relative h-6 bg-[#0f0f18] rounded overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pred.podiumProbability * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-f1-red/80 to-f1-red"
                      />
                    </div>
                    <div className="w-12 text-right font-bold text-sm text-f1-light">
                      {(pred.podiumProbability * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl sticky top-24">
              <h3 className="text-xs font-bold text-f1-muted uppercase tracking-widest mb-4">Most Likely Winner</h3>
              {likelyWinner ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center mb-4 shadow-lg" style={{ borderColor: likelyWinner.teamColor || '#e10600', backgroundColor: '#1a1a24' }}>
                    <span className="text-xl font-black text-f1-light">1st</span>
                  </div>
                  <h4 className="text-2xl font-black text-f1-light mb-1">{likelyWinner.driverName}</h4>
                  <p className="text-sm text-f1-muted mb-4 font-semibold">{likelyWinner.circuit}</p>
                  
                  <div className="bg-[#0f0f18] px-4 py-2 rounded border border-[#2a2a35] inline-block">
                    <span className="text-f1-red font-black text-lg">{(likelyWinner.podiumProbability * 100).toFixed(1)}%</span>
                    <span className="text-xs text-f1-muted ml-2 font-bold uppercase">Podium Chance</span>
                  </div>
                </div>
              ) : (
                <p className="text-f1-muted text-sm">No predictions available.</p>
              )}
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* SECTION 3: Lap Time Anomaly Detector */}
      <FadeInSection>
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 border-b-2 border-f1-border pb-2 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-f1-light flex items-center gap-2 uppercase tracking-wide">
            🚨 Lap Time Anomaly Detector
          </h2>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-f1-muted uppercase tracking-wider">Select Driver</label>
            <select 
              className="bg-f1-panel border border-f1-border text-f1-light text-sm rounded px-3 py-1.5 focus:outline-none focus:border-f1-red transition-colors"
              value={selectedAnomalyDriver || ""}
              onChange={(e) => setSelectedAnomalyDriver(Number(e.target.value))}
            >
              {anomalySummary.map(s => (
                <option key={s.driverId} value={s.driverId}>{s.driverName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-f1-light">Lap Time Telemetry</h3>
            {currentAnomalyDriverData && (
              <span className="text-xs bg-f1-red/10 text-f1-red border border-f1-red/30 px-3 py-1 rounded font-bold uppercase tracking-wider">
                {currentAnomalyDriverData.anomalyCount} anomalies detected out of {currentAnomalyDriverData.totalLaps} laps
              </span>
            )}
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={anomalyLapData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" opacity={0.6} />
                <XAxis dataKey="lap" stroke="#666666" fontSize={12} tickLine={false} />
                <YAxis 
                  dataKey="seconds" 
                  stroke="#666666" 
                  fontSize={12} 
                  tickLine={false} 
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => val.toFixed(1)}
                />
                <Tooltip content={<AnomalyTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Legend verticalAlign="top" height={36}/>
                <Line 
                  type="monotone" 
                  name="Lap Time (s)" 
                  dataKey="seconds" 
                  stroke="#4a4a5a" 
                  strokeWidth={2} 
                  dot={<AnomalyDot />}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {flaggedLaps.length > 0 && (
          <div className="bg-f1-panel border border-f1-border rounded-lg shadow-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1a1a24] text-f1-muted">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Lap Number</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Time (s)</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Reason</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Deviation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-f1-border">
                {flaggedLaps.map(lap => (
                  <tr key={lap.lap} className="hover:bg-f1-border/30 transition-colors">
                    <td className="px-6 py-4 text-f1-light font-black">{lap.lap}</td>
                    <td className="px-6 py-4 text-f1-light font-mono">{lap.seconds.toFixed(3)}</td>
                    <td className="px-6 py-4">
                      <span className="bg-f1-red/10 text-f1-red border border-f1-red/20 px-2 py-1 rounded text-xs font-bold">
                        {lap.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-mono font-bold ${lap.deviation > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                        {lap.deviation > 0 ? '+' : ''}{lap.deviation.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FadeInSection>

      {/* SECTION 4: Constructor Network (SNA) */}
      <FadeInSection>
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 border-b-2 border-f1-border pb-2 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-f1-light flex items-center gap-2 uppercase tracking-wide">
            🕸️ Constructor Network (SNA)
          </h2>
          <div className="flex items-center gap-2">
            {["2010-2013", "2014-2016", "2017-2020"].map(era => (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
                  selectedEra === era 
                    ? 'bg-f1-red text-f1-light' 
                    : 'bg-f1-panel border border-f1-border text-f1-muted hover:text-f1-light'
                }`}
              >
                {era}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl mb-6 relative">
          <h3 className="text-lg font-bold text-f1-light mb-2">Driver Mobility Network</h3>
          <p className="text-xs text-f1-muted mb-6">Nodes represent constructors (sized by total wins). Edges represent drivers shared between teams over the selected era.</p>
          
          <div className="h-[400px] w-full bg-[#0a0a0f] border border-[#1a1a24] rounded-lg overflow-hidden relative">
            <ConstructorNetworkGraph data={currentNetworkData} onTooltip={setSnaTooltip} />
            
            {/* D3 Tooltip overlay */}
            {snaTooltip.visible && (
              <div 
                className="absolute bg-[#0f0f18] border border-[#1a1a24] p-3 rounded-md shadow-xl pointer-events-none"
                style={{
                  left: snaTooltip.x - 20, // Offset from mouse slightly, or we can use fixed positioning if needed
                  top: snaTooltip.y - 120, // using a hard offset, but since this is inside a relative container we might need to adjust.
                  // Wait, event.pageX is absolute. Since the container is relative, it's better to use fixed position for tooltip
                  position: 'fixed',
                  transform: 'translate(-50%, -120%)',
                  zIndex: 100
                }}
              >
                <p className="text-f1-light font-black mb-1 text-lg">{snaTooltip.name}</p>
                <div className="space-y-1 mt-2">
                  <p className="text-[11px] text-gray-400">Total Wins: <span className="text-f1-light font-bold">{snaTooltip.wins}</span></p>
                  <p className="text-[11px] text-gray-400">Top Connection: <span className="text-f1-light font-bold">{snaTooltip.topConnection}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Centrality Rankings Table */}
        <div className="bg-f1-panel border border-f1-border rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-f1-border">
            <h3 className="text-lg font-bold text-f1-light">Centrality Rankings</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1a1a24] text-f1-muted">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Constructor</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Degree Centrality</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Betweenness Centrality</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Most Connected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-f1-border">
              {currentNetworkData.centrality.map(row => (
                <tr key={row.constructor} className="hover:bg-f1-border/30 transition-colors">
                  <td className="px-6 py-4 text-f1-light font-black">{row.constructor}</td>
                  <td className="px-6 py-4 text-f1-muted font-mono">{(row.degree).toFixed(2)}</td>
                  <td className="px-6 py-4 text-f1-muted font-mono">{(row.betweenness).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="bg-[#1a1a24] border border-[#2a2a35] text-gray-300 px-2 py-1 rounded text-xs font-bold">
                      {row.mostConnected}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeInSection>

      {/* SECTION 5: Race Strategy Simulator (Previously Section 4) */}
      <FadeInSection>
        <h2 className="text-xl md:text-2xl font-bold text-f1-light mb-6 flex items-center gap-2 border-b-2 border-f1-border pb-2 uppercase tracking-wide">
          🏎️ Race Strategy Simulator
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-bold text-f1-light mb-4">Select Strategy</h3>
              <div className="flex flex-col gap-3">
                {Object.keys(STRATEGIES).map(key => {
                  const strat = STRATEGIES[key];
                  const isActive = key === selectedStrategyKey;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedStrategyKey(key)}
                      className={`p-4 rounded-md border text-left transition duration-300 ${
                        isActive 
                          ? 'bg-f1-red/10 border-f1-red text-f1-light' 
                          : 'bg-f1-panel/40 border-f1-border text-f1-muted hover:bg-f1-panel hover:text-f1-light'
                      }`}
                    >
                      <h4 className="font-bold text-sm">{strat.name}</h4>
                      <div className="mt-2 flex justify-between items-center text-[10px] text-f1-muted">
                        <span>Target Pit Stop: Lap {strat.pitLap}</span>
                        <span className="font-semibold text-f1-light">{strat.predictedDuration}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-f1-red/5 rounded-full blur-2xl pointer-events-none"></div>
              <h3 className="text-lg font-bold text-f1-light mb-2">⚡ Strategy Recommendation</h3>
              <p className="text-xs text-f1-muted leading-relaxed">
                Based on ambient temperature (22°C) and track abrasion index, the <span className="text-f1-red font-bold">{STRATEGIES.oneStopMediumHard.name}</span> is predicted to be the fastest overall strategy by 11.9s.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-f1-panel border border-f1-border p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-bold text-f1-light mb-6 flex items-center gap-2">
                📉 Projected Tyre Grip Deg (%) over 70 Laps
              </h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={activeStrategy.degGraph}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" opacity={0.6} />
                    <XAxis dataKey="lap" type="number" domain={[0, 70]} stroke="#666666" fontSize={12} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#666666" fontSize={12} tickLine={false} />
                    <Tooltip content={<PlotlyTooltip xKey="lap" yFormatter={(val, item) => `${val}% Grip (${item.payload.type} Compound)`} />} />
                    <Legend verticalAlign="top" height={36}/>
                    <Line 
                      type="monotone" 
                      name="Projected Tyre Grip" 
                      dataKey="grip" 
                      stroke="#e10600" 
                      strokeWidth={3} 
                      dot={{ strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

        </div>
      )}
    </div>
  );
}

export default PitWallAI;
