import React, { useState, useEffect } from 'react';
import { MapPin, Thermometer, Droplets, Beaker, Leaf, DollarSign } from 'lucide-react';
import { getLocationAsync, validateSoilParameters, formatCurrency } from '../utils/helpers';
import { cropAPI } from '../services/api';

const SoilParameterForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
    budget_per_hectare: '',
    farm_size_hectares: '1'
  });
  
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [autoFillEnabled, setAutoFillEnabled] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Note: Removed auto-location on mount to avoid permission prompts
    // Users should explicitly click "Get My Location" button
  }, []);

  const handleGetLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError('');
      const coords = await getLocationAsync();
      setLocation(coords);
      
      // Auto-fill soil and weather data if enabled
      if (autoFillEnabled) {
        await autoFillData(coords);
      }
    } catch (error) {
      setLocationError(error.message);
      console.error('Location error:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  const autoFillData = async (coords) => {
    try {
      // Get soil data and weather data
      const [soilData, weatherData] = await Promise.all([
        cropAPI.getSoilData(coords.latitude, coords.longitude),
        cropAPI.getWeather(coords.latitude, coords.longitude, 7)
      ]);

      // Auto-fill form with fetched data
      if (soilData.soil_data) {
        const avgTemp = weatherData.weather_forecast
          ? weatherData.weather_forecast.slice(0, 3).reduce((acc, day) => 
              acc + (day.temperature_max + day.temperature_min) / 2, 0) / 3
          : 25;
        
        const avgHumidity = weatherData.weather_forecast
          ? weatherData.weather_forecast.slice(0, 3).reduce((acc, day) => 
              acc + day.humidity, 0) / 3
          : 60;
        
        const totalRainfall = weatherData.weather_forecast
          ? weatherData.weather_forecast.reduce((acc, day) => acc + day.rainfall, 0)
          : 50;

        setFormData(prev => ({
          ...prev,
          ph: soilData.soil_data.ph_level || '',
          temperature: Math.round(avgTemp) || '',
          humidity: Math.round(avgHumidity) || '',
          rainfall: Math.round(totalRainfall) || ''
        }));
      }
    } catch (error) {
      console.error('Auto-fill error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate soil parameters
    const soilParams = {
      N: parseFloat(formData.N),
      P: parseFloat(formData.P),
      K: parseFloat(formData.K),
      temperature: parseFloat(formData.temperature),
      humidity: parseFloat(formData.humidity),
      ph: parseFloat(formData.ph),
      rainfall: parseFloat(formData.rainfall)
    };
    
    const validation = validateSoilParameters(soilParams);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    if (!location) {
      setLocationError('Please allow location access or enter coordinates manually');
      return;
    }
    
    if (!formData.budget_per_hectare || parseFloat(formData.budget_per_hectare) <= 0) {
      setErrors(prev => ({
        ...prev,
        budget_per_hectare: 'Please enter a valid budget'
      }));
      return;
    }

    // Prepare submission data
    const submissionData = {
      soil_parameters: soilParams,
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      budget_per_hectare: parseFloat(formData.budget_per_hectare),
      farm_size_hectares: parseFloat(formData.farm_size_hectares) || 1
    };

    onSubmit(submissionData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center mb-6">
        <Leaf className="h-6 w-6 text-green-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Farm Parameters</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Location</h3>
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locationLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {locationLoading ? 'Getting Location...' : 'Get My Location'}
            </button>
          </div>
          
          {location && (
            <div className="text-sm text-gray-600">
              <p>📍 Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}</p>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="autoFill"
                  checked={autoFillEnabled}
                  onChange={(e) => setAutoFillEnabled(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="autoFill" className="text-sm">
                  Auto-fill soil and weather data from location
                </label>
              </div>
            </div>
          )}
          
          {locationError && (
            <div className="mt-2">
              <p className="text-red-600 text-sm">{locationError}</p>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 mb-2">You can enter your location manually:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      placeholder="e.g., 28.6139"
                      step="any"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.value && document.querySelector('input[placeholder="e.g., 77.2090"]').value) {
                          setLocation({
                            latitude: parseFloat(e.target.value),
                            longitude: parseFloat(document.querySelector('input[placeholder="e.g., 77.2090"]').value)
                          });
                          setLocationError('');
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      placeholder="e.g., 77.2090"
                      step="any"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.value && document.querySelector('input[placeholder="e.g., 28.6139"]').value) {
                          setLocation({
                            latitude: parseFloat(document.querySelector('input[placeholder="e.g., 28.6139"]').value),
                            longitude: parseFloat(e.target.value)
                          });
                          setLocationError('');
                        }
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Tip: You can find your coordinates on Google Maps by right-clicking your location
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Soil Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Leaf className="inline h-4 w-4 mr-1" />
              Nitrogen (N) - kg/ha
            </label>
            <input
              type="number"
              name="N"
              value={formData.N}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.N ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="40-80"
              min="0"
              max="200"
              step="0.1"
              required
            />
            {errors.N && <p className="text-red-500 text-xs mt-1">{errors.N}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Leaf className="inline h-4 w-4 mr-1" />
              Phosphorus (P) - kg/ha
            </label>
            <input
              type="number"
              name="P"
              value={formData.P}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.P ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="30-60"
              min="0"
              max="150"
              step="0.1"
              required
            />
            {errors.P && <p className="text-red-500 text-xs mt-1">{errors.P}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Leaf className="inline h-4 w-4 mr-1" />
              Potassium (K) - kg/ha
            </label>
            <input
              type="number"
              name="K"
              value={formData.K}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.K ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="40-80"
              min="0"
              max="200"
              step="0.1"
              required
            />
            {errors.K && <p className="text-red-500 text-xs mt-1">{errors.K}</p>}
          </div>
        </div>

        {/* Environmental Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Thermometer className="inline h-4 w-4 mr-1" />
              Temperature - °C
            </label>
            <input
              type="number"
              name="temperature"
              value={formData.temperature}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.temperature ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="20-30"
              min="-10"
              max="50"
              step="0.1"
              required
            />
            {errors.temperature && <p className="text-red-500 text-xs mt-1">{errors.temperature}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Droplets className="inline h-4 w-4 mr-1" />
              Humidity - %
            </label>
            <input
              type="number"
              name="humidity"
              value={formData.humidity}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.humidity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="40-70"
              min="10"
              max="100"
              step="0.1"
              required
            />
            {errors.humidity && <p className="text-red-500 text-xs mt-1">{errors.humidity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Beaker className="inline h-4 w-4 mr-1" />
              pH Level
            </label>
            <input
              type="number"
              name="ph"
              value={formData.ph}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.ph ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="6.0-7.5"
              min="3"
              max="12"
              step="0.1"
              required
            />
            {errors.ph && <p className="text-red-500 text-xs mt-1">{errors.ph}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Droplets className="inline h-4 w-4 mr-1" />
              Rainfall - mm
            </label>
            <input
              type="number"
              name="rainfall"
              value={formData.rainfall}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.rainfall ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="50-300"
              min="0"
              max="3000"
              step="0.1"
              required
            />
            {errors.rainfall && <p className="text-red-500 text-xs mt-1">{errors.rainfall}</p>}
          </div>
        </div>

        {/* Budget Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Budget per Hectare - ₹
            </label>
            <input
              type="number"
              name="budget_per_hectare"
              value={formData.budget_per_hectare}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.budget_per_hectare ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="50000"
              min="1000"
              step="1000"
              required
            />
            {errors.budget_per_hectare && <p className="text-red-500 text-xs mt-1">{errors.budget_per_hectare}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Size - Hectares
            </label>
            <input
              type="number"
              name="farm_size_hectares"
              value={formData.farm_size_hectares}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="1"
              min="0.1"
              step="0.1"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing...
            </div>
          ) : (
            'Get Crop Recommendations'
          )}
        </button>
      </form>
    </div>
  );
};

export default SoilParameterForm;
