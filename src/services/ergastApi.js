import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.jolpi.ca/ergast/f1',
});

export const getCurrentStandings = async () => {
  try {
    const response = await api.get('/current/driverStandings.json');
    return response.data.MRData.StandingsTable.StandingsLists[0] || {};
  } catch (error) {
    console.error('Error in getCurrentStandings:', error);
    throw error;
  }
};

export const getConstructorStandings = async () => {
  try {
    const response = await api.get('/current/constructorStandings.json');
    return response.data.MRData.StandingsTable.StandingsLists[0] || {};
  } catch (error) {
    console.error('Error in getConstructorStandings:', error);
    throw error;
  }
};

export const getSeasonRaces = async (year) => {
  try {
    const response = await api.get(`/${year}/races.json`);
    return response.data.MRData.RaceTable.Races || [];
  } catch (error) {
    console.error(`Error in getSeasonRaces for year ${year}:`, error);
    throw error;
  }
};

export const getDriverInfo = async (driverId, limit = 50, offset = 0) => {
  try {
    if (driverId) {
      const response = await api.get(`/drivers/${driverId}.json`);
      return response.data.MRData.DriverTable.Drivers[0] || null;
    } else {
      const response = await api.get(`/drivers.json?limit=${limit}&offset=${offset}`);
      return response.data.MRData.DriverTable.Drivers || [];
    }
  } catch (error) {
    console.error(`Error in getDriverInfo for driver ${driverId}:`, error);
    throw error;
  }
};

export const getDriverStandings = async (driverId) => {
  try {
    const response = await api.get(`/drivers/${driverId}/driverStandings.json`);
    return response.data.MRData.StandingsTable.StandingsLists || [];
  } catch (error) {
    console.error(`Error in getDriverStandings for ${driverId}:`, error);
    throw error;
  }
};

export const getLastRaceResults = async () => {
  try {
    const response = await api.get('/current/last/results.json');
    return response.data.MRData.RaceTable.Races[0] || {};
  } catch (error) {
    console.error('Error in getLastRaceResults:', error);
    throw error;
  }
};

export const getRaceResults = async (year, round) => {
  try {
    const response = await api.get(`/${year}/${round}/results.json`);
    return response.data.MRData.RaceTable.Races[0]?.Results || [];
  } catch (error) {
    console.error(`Error in getRaceResults for ${year} round ${round}:`, error);
    throw error;
  }
};
