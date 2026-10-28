import { useEffect, useState } from 'react';
import { getSeasonConstructors } from '../services/jolpicaApi';
import { Link, useSearchParams } from 'react-router-dom';
import teams from '../data/constructors.json';
import { localMedia } from '../utils/getWikipediaImage';
import { titleYears, seasonRange } from '../utils/teamProfiles';
import TeamLogo from '../components/TeamLogo';

function SeasonGrid() {
 const current = new Date().getFullYear();
 const [year,setYear] = useState(current), [feed,setFeed] = useState(null), [error,setError] = useState(false), [attempt,setAttempt] = useState(0);
 useEffect(() => {
  let active=true;
  getSeasonConstructors(year,attempt>0).then(data=>{if(active){setFeed(data);setError(false);}}).catch(()=>{if(active)setError(true);});
  const interval=Number(year)>=current?setInterval(()=>setAttempt(value=>value+1),300000):null;
  return()=>{active=false;if(interval)clearInterval(interval);};
 },[year,attempt,current]);
 const choose = value => {setFeed(null);setError(false);setYear(Number(value));};
 return <section className="current-teams"><div className="team-section-heading"><div><p className="experience-kicker">EVERY ERA. EVERY GRID.</p><h2 className="experience-section-title">The season grid</h2></div><label className="season-picker">Season<select value={year} onChange={event=>choose(event.target.value)}>{seasonRange().map(value=><option key={value}>{value}</option>)}</select></label></div>
 <p className="experience-result-count">1950 onward · current season refreshes every five minutes · future grids appear when published</p>
 {error?<div role="status"><p>Season data is temporarily unavailable.</p><button className="experience-primary" onClick={()=>{setError(false);setAttempt(value=>value+1);}}>Try again</button></div>:!feed?<p role="status">Loading the {year} grid…</p>:!feed.constructors.length?<p role="status">The {year} grid has not been published yet. Choose another season to explore.</p>:<><p className="experience-result-count">{year} · {feed.constructors.length} constructors {feed.standings?`· after round ${feed.standings.round}`:(year<1958?'· championship standings began in 1958':'· standings temporarily unavailable')}</p><div className="current-team-grid">{feed.constructors.map(team=>{const row=feed.standings?.ConstructorStandings?.find(item=>item.Constructor.constructorId===team.constructorId);return <article key={team.constructorId}><TeamLogo id={team.constructorId} name={team.name} historical={year<current}/><div><span>{row?`P${row.position}`:'ENTERED'}</span><h3>{team.name}</h3><p>{team.nationality}</p></div>{row&&<strong>{row.points}<small>POINTS</small></strong>}</article>;})}</div></>}
 <small className="team-media-note">Grids from 1950–1960 also include Indianapolis 500 constructors. Official current logos identify continuing teams; historical badges are shown only when archived. Other constructors use a name mark.</small></section>;
}
function Profile({team,onClose}) {
 const years=titleYears(team.id), media=localMedia(team.wikiSearchTerm);
 return <section id={`profile-${team.id}`} className="team-inline-profile" aria-label={`${team.name} constructor profile`}><button className="team-profile-close" onClick={onClose} aria-label={`Close ${team.name} profile`}>×</button><div className="team-profile-heading"><TeamLogo id={team.id} name={team.name}/><div><p className="experience-kicker">CONSTRUCTOR PROFILE</p><h3>{team.fullName||team.name}</h3><p>{team.nationality} · {team.yearsActive}</p></div></div><p className="team-summary">{media?.summary || `${team.name} is a ${team.nationality.toLowerCase()} constructor represented in the Formula 1 archive from ${team.yearsActive}. Its recorded championship seasons and associated drivers are listed below.`}</p><div className="team-profile-facts"><div><strong>{years.length}</strong><span>CONSTRUCTORS’ TITLES</span></div><div><h4>Championship years</h4><p>{years.length?years.join(' · '):'No constructors’ titles in the completed-season archive.'}</p></div></div><h4>Notable drivers</h4><p>{team.drivers?.join(' · ') || 'Not recorded in this directory.'}</p><div className="team-profile-actions"><Link to="/all-time">Trophy room ↗</Link><Link to="/cars">Car collection ↗</Link></div><small>Titles through the completed-season archive. Driver names are historical associations.</small></section>;
}
export default function Teams() {
 const [params,setParams]=useSearchParams();
 const selected=params.get('team');
 const close=()=>setParams({},{preventScrollReset:true});
 return <div className="experience-page"><header className="experience-heading"><p className="experience-kicker">THE PEOPLE BEHIND THE MACHINES</p><h1>Two drivers. One team.</h1><p>Discover the constructors, their championship stories, and every published Formula 1 season grid.</p></header><SeasonGrid/><section><p className="experience-kicker">THE NAMES THAT BUILT F1</p><h2 className="experience-section-title">Meet the constructors</h2><p className="experience-result-count">Choose a constructor to reveal its story, titles and drivers right here.</p><div className="team-directory-grid">{teams.map(team=><div className={`team-directory-item ${selected===team.id?'is-expanded':''}`} key={team.id}><button className="team-directory-button" aria-expanded={selected===team.id} aria-controls={`profile-${team.id}`} onClick={()=>selected===team.id?close():setParams({team:team.id},{preventScrollReset:true})}><TeamLogo id={team.id} name={team.name}/><div><span className="experience-kicker">{team.nationality}</span><h2>{team.name}</h2><p>{team.yearsActive}</p></div><span className="team-expand-symbol" aria-hidden="true">{selected===team.id?'−':'+'}</span></button>{selected===team.id&&<Profile team={team} onClose={close}/>}</div>)}</div></section></div>;
}
