import axios from 'axios';
import { summariseDriverResults } from '../utils/driverStats';
import championsData from '../data/champions.json';
import { cachedFetch } from './cache';

const api = axios.create({
  baseURL: 'https://api.jolpi.ca/ergast/f1',
  timeout: 15000,
});

export const getCurrentDriverStandings = async (force = false) => {
  return cachedFetch('current_driver_standings', async () => {
    try {
      const response = await api.get('/current/driverStandings.json');
      return response.data?.MRData?.StandingsTable?.StandingsLists?.[0] || {};
    } catch (error) {
      console.error('Error fetching getCurrentDriverStandings:', error);
      throw error;
    }
  }, 5, { force });
};

export const getCurrentConstructorStandings = async (force = false) => {
  return cachedFetch('current_constructor_standings', async () => {
    try {
      const response = await api.get('/current/constructorStandings.json');
      return response.data?.MRData?.StandingsTable?.StandingsLists?.[0] || {};
    } catch (error) {
      console.error('Error fetching getCurrentConstructorStandings:', error);
      throw error;
    }
  }, 5, { force });
};

export const getSeasonRaces = async (year, force = false) => {
  return cachedFetch(`season_races_${year}`, async () => {
    try {
      const response = await api.get(`/${year}/races.json`);
      return response.data?.MRData?.RaceTable?.Races || [];
    } catch (error) {
      console.error(`Error fetching getSeasonRaces for year ${year}:`, error);
      throw error;
    }
  }, 360, { force });
};

export const getLastRaceResults = async (force = false) => {
  return cachedFetch('last_race_results', async () => {
    try {
      const response = await api.get('/current/last/results.json');
      return response.data?.MRData?.RaceTable?.Races?.[0] || null;
    } catch (error) {
      console.error('Error fetching getLastRaceResults:', error);
      throw error;
    }
  }, 5, { force });
};

export const getAllDrivers = async (limit = 50, offset = 0) => {
  return cachedFetch(`all_drivers_v2_${limit}_${offset}`, async () => {
    try {
      if (limit > 100) {
        let allDrivers = [];
        let fetchMore = true;
        let currentOffset = offset;
        while (fetchMore) {
          const response = await api.get(`/drivers.json?limit=100&offset=${currentOffset}`);
          const drivers = response.data?.MRData?.DriverTable?.Drivers || [];
          allDrivers = allDrivers.concat(drivers);
          if (drivers.length < 100 || allDrivers.length >= limit) {
            fetchMore = false;
          } else {
            currentOffset += 100;
          }
        }
        return allDrivers.slice(0, limit);
      } else {
        const response = await api.get(`/drivers.json?limit=${limit}&offset=${offset}`);
        return response.data?.MRData?.DriverTable?.Drivers || [];
      }
    } catch (error) {
      console.error('Error fetching getAllDrivers:', error);
      throw error;
    }
  }, 720);
};

export const getDriverSeasonResults = async (driverId, year) => {
  return cachedFetch(`driver_season_results_${driverId}_${year}`, async () => {
    try {
      const response = await api.get(`/${year}/drivers/${driverId}/results.json`);
      return response.data?.MRData?.RaceTable?.Races || [];
    } catch (error) {
      console.error(`Error fetching getDriverSeasonResults for driver ${driverId} and year ${year}:`, error);
      throw error;
    }
  }, 360);
};

export const getDriverInfo = async (driverId) => {
  return cachedFetch(`driver_info_${driverId}`, async () => {
    try {
      const response = await api.get(`/drivers/${driverId}.json`);
      return response.data?.MRData?.DriverTable?.Drivers?.[0] || null;
    } catch (error) {
      console.error(`Error fetching getDriverInfo for ${driverId}:`, error);
      throw error;
    }
  }, 720);
};

export const getDriverStandings = async (driverId) => {
  return cachedFetch(`driver_standings_full_${driverId}`, async () => {
    try {
      // Jolpica API requires season_year for driver standings.
      // We first fetch all seasons the driver participated in.
      const seasonsResponse = await api.get(`/drivers/${driverId}/seasons.json?limit=100`);
      const seasons = seasonsResponse.data?.MRData?.SeasonTable?.Seasons || [];
      
      if (seasons.length === 0) return [];

      // Bound historical requests to avoid bursting an entire career at once.
      const responses = [];
      for (let offset = 0; offset < seasons.length; offset += 3) {
        const batch = await Promise.all(seasons.slice(offset, offset + 3).map(season =>
          api.get(`/${season.season}/drivers/${encodeURIComponent(driverId)}/driverStandings.json`).catch(() => null)
        ));
        responses.push(...batch);
      }
      if (responses.some(response => !response)) throw new Error('Some career seasons are unavailable');
      
      const allStandings = [];
      responses.forEach(res => {
         const lists = res?.data?.MRData?.StandingsTable?.StandingsLists;
         if (lists && lists.length > 0) {
            allStandings.push(lists[0]);
         }
      });
      return allStandings;
    } catch (error) {
      console.error(`Error fetching getDriverStandings for ${driverId}:`, error);
      throw error;
    }
  }, 360);
};

export const getRaceResults = async (year, round, force = false) => {
  return cachedFetch(`race_results_${year}_${round}`, async () => {
    try {
      const response = await api.get(`/${year}/${round}/results.json`);
      return response.data?.MRData?.RaceTable?.Races?.[0]?.Results || [];
    } catch (error) {
      console.error(`Error fetching getRaceResults for ${year} round ${round}:`, error);
      throw error;
    }
  }, 5, { force });
};

export const getAllTimeChampions = async () => {
  return cachedFetch('all_time_champions_v6', async () => {
    try {
      let lists = championsData.filter(list => Number(list.season) < new Date().getFullYear());
      const currentYear = new Date().getFullYear();
      
      // Determine the last year present in the json data
      const lastRecordedYear = lists.length > 0 
        ? Math.max(...lists.map(list => parseInt(list.season))) 
        : 1949; // Before F1 started
        
      // Reactive and updatable: dynamically fetch new champions for missing years
      const missingYears = [];
      for (let year = lastRecordedYear + 1; year < currentYear; year++) {
        missingYears.push(year);
      }

      if (missingYears.length > 0) {
        const fetchChampionForYear = async (year) => {
          try {
            const response = await api.get(`/${year}/driverStandings/1.json`);
            const fetchedLists = response.data?.MRData?.StandingsTable?.StandingsLists || [];
            return fetchedLists.length > 0 ? fetchedLists[0] : null;
          } catch (e) {
            console.warn(`Could not fetch champion for ${year}`, e);
            return null;
          }
        };

        const newChampions = await Promise.all(missingYears.map(fetchChampionForYear));
        const validNewChampions = newChampions.filter(champ => champ !== null);
        lists = lists.concat(validNewChampions);
      }
      
      return lists;
    } catch (error) {
      console.error('Error fetching getAllTimeChampions:', error);
      throw error;
    }
  }, 720); // cache for 12 hours
};

// Circuit identity is stable even when the calendar round changes between seasons.
export const getCircuitResults = (year, circuitId) => cachedFetch(`circuit_results_${year}_${circuitId}`, async () => {
  const response = await api.get(`/${year}/circuits/${encodeURIComponent(circuitId)}/results.json?limit=100`);
  return response.data?.MRData?.RaceTable?.Races || [];
}, 720);

export const getRoundStandings = (year, round, force = false) => cachedFetch(`round_standings_${year}_${round}`, async () => {
  const response = await api.get(`/${year}/${round}/driverStandings.json?limit=100`);
  return response.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || null;
}, 5, { force });

export const getDriverCareerStats = driverId => cachedFetch(`driver_career_stats_${driverId}`, async () => {
  const races = [];
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const response = await api.get(`/drivers/${encodeURIComponent(driverId)}/results.json?limit=100&offset=${offset}`);
    const page = response.data?.MRData;
    if (!page?.RaceTable || !Number.isFinite(Number(page.total))) throw new Error('Invalid career data');
    total = Number(page.total);
    const batch = page.RaceTable.Races || [];
    races.push(...batch);
    if (!batch.length && offset < total) throw new Error('Incomplete career results');
    offset += 100;
  }
  const standings = await getDriverStandings(driverId);
  return summariseDriverResults(races, standings);
}, 360);

export const getSeasonWinners = (year, force = false) => cachedFetch(`season_winners_${year}`, async () => {
  const response = await api.get(`/${year}/results/1.json?limit=100`);
  return response.data?.MRData?.RaceTable?.Races || [];
}, 5, { force });
