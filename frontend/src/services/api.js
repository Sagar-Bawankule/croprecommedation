import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for ML operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const cropAPI = {
  // Get comprehensive crop recommendations
  getRecommendations: async (data) => {
    const response = await api.post('/api/recommend', data);
    return response.data;
  },

  // Get weather forecast
  getWeather: async (latitude, longitude, days = 7) => {
    const response = await api.get(`/api/weather/${latitude}/${longitude}?days=${days}`);
    return response.data;
  },

  // Get soil data
  getSoilData: async (latitude, longitude) => {
    const response = await api.get(`/api/soil/${latitude}/${longitude}`);
    return response.data;
  },

  // Get location info
  getLocationInfo: async (latitude, longitude) => {
    const response = await api.get(`/api/location/${latitude}/${longitude}`);
    return response.data;
  },
  
  // Get combined soil and weather data for location
  getSoilWeatherData: async (latitude, longitude) => {
    const response = await api.get(`/api/soil-weather-data/${latitude}/${longitude}`);
    return response.data;
  },

  // Get market trends
  getMarketTrends: async () => {
    const response = await api.get('/api/market-trends');
    return response.data;
  },

  // Analyze soil treatment
  analyzeSoilTreatment: async (soilParams) => {
    const response = await api.post('/api/soil-treatment', soilParams);
    return response.data;
  },

  // Get rotation plan
  getRotationPlan: async (crop) => {
    const response = await api.get(`/api/rotation-plan/${crop}`);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
