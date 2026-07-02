import axios from 'axios';
import { cachedFetch } from './cache';

const api = axios.create({
  baseURL: 'https://api.openf1.org/v1',
});

export const getLatestSession = async () => {
  return cachedFetch('latest_session', async () => {
    try {
      const response = await api.get('/sessions?session_key=latest');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching getLatestSession:', error);
      throw error;
    }
  }, 30);
};

export const getLapTimes = async (sessionKey, driverNumber) => {
  return cachedFetch(`lap_times_${sessionKey}_${driverNumber}`, async () => {
    try {
      const response = await api.get(`/laps?session_key=${sessionKey}&driver_number=${driverNumber}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching getLapTimes for session ${sessionKey} and driver ${driverNumber}:`, error);
      throw error;
    }
  }, 30);
};

export const getPitStops = async (sessionKey) => {
  return cachedFetch(`pit_stops_${sessionKey}`, async () => {
    try {
      const response = await api.get(`/pit?session_key=${sessionKey}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching getPitStops for session ${sessionKey}:`, error);
      throw error;
    }
  }, 30);
};

export const getDriverTelemetry = async (sessionKey, driverNumber) => {
  return cachedFetch(`telemetry_${sessionKey}_${driverNumber}`, async () => {
    try {
      const response = await api.get(`/car_data?session_key=${sessionKey}&driver_number=${driverNumber}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching getDriverTelemetry for session ${sessionKey} and driver ${driverNumber}:`, error);
      throw error;
    }
  }, 30);
};

export const getRaceWeather = async (sessionKey) => {
  return cachedFetch(`race_weather_${sessionKey}`, async () => {
    try {
      const response = await api.get(`/weather?session_key=${sessionKey}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching getRaceWeather for session ${sessionKey}:`, error);
      throw error;
    }
  }, 30);
};

export const getDriverPositions = async (sessionKey) => {
  return cachedFetch(`driver_positions_${sessionKey}`, async () => {
    try {
      const response = await api.get(`/position?session_key=${sessionKey}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching getDriverPositions for session ${sessionKey}:`, error);
      throw error;
    }
  }, 30);
};
