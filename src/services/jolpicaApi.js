import axios from 'axios';
import { cachedFetch } from './cache';

const api = axios.create({
  baseURL: 'https://api.jolpi.ca/ergast/f1',
});

export const getCurrentDriverStandings = async () => {
  return cachedFetch('current_driver_standings', async () => {
    try {
      const response = await api.get('/current/driverStandings.json');
      return response.data?.MRData?.StandingsTable?.StandingsLists?.[0] || {};
    } catch (error) {
      console.error('Error fetching getCurrentDriverStandings:', error);
      throw error;
    }
  }, 60);
};

export const getCurrentConstructorStandings = async () => {
  return cachedFetch('current_constructor_standings', async () => {
    try {
      const response = await api.get('/current/constructorStandings.json');
      return response.data?.MRData?.StandingsTable?.StandingsLists?.[0] || {};
    } catch (error) {
      console.error('Error fetching getCurrentConstructorStandings:', error);
      throw error;
    }
  }, 60);
};

export const getSeasonRaces = async (year) => {
  return cachedFetch(`season_races_${year}`, async () => {
    try {
      const response = await api.get(`/${year}/races.json`);
      return response.data?.MRData?.RaceTable?.Races || [];
    } catch (error) {
      console.error(`Error fetching getSeasonRaces for year ${year}:`, error);
      throw error;
    }
  }, 360);
};

export const getLastRaceResults = async () => {
  return cachedFetch('last_race_results', async () => {
    try {
      const response = await api.get('/current/last/results.json');
      return response.data?.MRData?.RaceTable?.Races?.[0] || null;
    } catch (error) {
      console.error('Error fetching getLastRaceResults:', error);
      throw error;
    }
  }, 60);
};

export const getAllDrivers = async (limit = 50, offset = 0) => {
  return cachedFetch(`all_drivers_${limit}_${offset}`, async () => {
    try {
      const response = await api.get(`/drivers.json?limit=${limit}&offset=${offset}`);
      return response.data?.MRData?.DriverTable?.Drivers || [];
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
  return cachedFetch(`driver_standings_${driverId}`, async () => {
    try {
      const response = await api.get(`/drivers/${driverId}/driverStandings.json`);
      return response.data?.MRData?.StandingsTable?.StandingsLists || [];
    } catch (error) {
      console.error(`Error fetching getDriverStandings for ${driverId}:`, error);
      throw error;
    }
  }, 360);
};

export const getRaceResults = async (year, round) => {
  return cachedFetch(`race_results_${year}_${round}`, async () => {
    try {
      const response = await api.get(`/${year}/${round}/results.json`);
      return response.data?.MRData?.RaceTable?.Races?.[0]?.Results || [];
    } catch (error) {
      console.error(`Error fetching getRaceResults for ${year} round ${round}:`, error);
      throw error;
    }
  }, 360);
};
