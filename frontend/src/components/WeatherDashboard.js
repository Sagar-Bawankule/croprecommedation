import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cloud, Sun, CloudRain, Thermometer, Droplets, Wind } from 'lucide-react';
import { formatDate, getWeatherIcon } from '../utils/helpers';

const WeatherDashboard = ({ weatherData }) => {
  if (!weatherData || !weatherData.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Weather Forecast</h2>
        <p className="text-gray-600">No weather data available</p>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = weatherData.map(day => ({
    date: formatDate(day.date),
    tempMax: day.temperature_max,
    tempMin: day.temperature_min,
    rainfall: day.rainfall,
    humidity: day.humidity
  }));

  const getTemperatureColor = (temp) => {
    if (temp > 35) return 'text-red-600';
    if (temp > 30) return 'text-orange-600';
    if (temp > 25) return 'text-yellow-600';
    if (temp > 20) return 'text-green-600';
    return 'text-blue-600';
  };

  const getWeatherConditionIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rain':
      case 'light rain':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'heavy rain':
        return <CloudRain className="h-8 w-8 text-blue-700" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Cloud className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">7-Day Weather Forecast</h2>
      </div>

      {/* Weather Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        {weatherData.slice(0, 7).map((day, index) => (
          <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">
              {index === 0 ? 'Today' : formatDate(day.date)}
            </div>
            
            <div className="flex justify-center mb-3">
              {getWeatherConditionIcon(day.weather_condition)}
            </div>
            
            <div className="space-y-1">
              <div className={`text-lg font-bold ${getTemperatureColor(day.temperature_max)}`}>
                {Math.round(day.temperature_max)}°
              </div>
              <div className="text-sm text-gray-600">
                {Math.round(day.temperature_min)}°
              </div>
              
              {day.rainfall > 0 && (
                <div className="flex items-center justify-center text-xs text-blue-600">
                  <Droplets className="h-3 w-3 mr-1" />
                  {Math.round(day.rainfall)}mm
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                {Math.round(day.humidity)}% humidity
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Temperature Trend Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Temperature & Rainfall Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="temp" orientation="left" label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="rain" orientation="right" label={{ value: 'Rainfall (mm)', angle: 90, position: 'insideRight' }} />
            <Tooltip 
              formatter={(value, name) => {
                if (name.includes('temp')) return [`${value}°C`, name];
                if (name === 'rainfall') return [`${value}mm`, 'Rainfall'];
                return [`${value}%`, 'Humidity'];
              }}
            />
            <Line 
              yAxisId="temp"
              type="monotone" 
              dataKey="tempMax" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Max Temperature"
              dot={{ fill: '#ef4444' }}
            />
            <Line 
              yAxisId="temp"
              type="monotone" 
              dataKey="tempMin" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Min Temperature"
              dot={{ fill: '#3b82f6' }}
            />
            <Line 
              yAxisId="rain"
              type="monotone" 
              dataKey="rainfall" 
              stroke="#06b6d4" 
              strokeWidth={2}
              name="Rainfall"
              dot={{ fill: '#06b6d4' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weather Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Thermometer className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="font-semibold text-red-800">Avg Temperature</h3>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {Math.round(weatherData.reduce((acc, day) => acc + (day.temperature_max + day.temperature_min) / 2, 0) / weatherData.length)}°C
          </div>
          <p className="text-sm text-red-700">
            Range: {Math.round(Math.min(...weatherData.map(d => d.temperature_min)))}° - {Math.round(Math.max(...weatherData.map(d => d.temperature_max)))}°
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Droplets className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-800">Total Rainfall</h3>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(weatherData.reduce((acc, day) => acc + day.rainfall, 0))}mm
          </div>
          <p className="text-sm text-blue-700">
            {weatherData.filter(d => d.rainfall > 0).length} rainy days
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Droplets className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-green-800">Avg Humidity</h3>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {Math.round(weatherData.reduce((acc, day) => acc + day.humidity, 0) / weatherData.length)}%
          </div>
          <p className="text-sm text-green-700">
            Range: {Math.round(Math.min(...weatherData.map(d => d.humidity)))}% - {Math.round(Math.max(...weatherData.map(d => d.humidity)))}%
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Wind className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="font-semibold text-purple-800">Avg Wind Speed</h3>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(weatherData.reduce((acc, day) => acc + day.wind_speed, 0) / weatherData.length)} km/h
          </div>
          <p className="text-sm text-purple-700">
            Max: {Math.round(Math.max(...weatherData.map(d => d.wind_speed)))} km/h
          </p>
        </div>
      </div>

      {/* Weather Alerts */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Weather Alerts</h3>
        <div className="space-y-2">
          {weatherData.some(day => day.temperature_max > 35) && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
              <div className="flex items-center">
                <Thermometer className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-medium text-red-800">High Temperature Alert</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Temperatures above 35°C expected. Consider heat-resistant crops and adequate irrigation.
              </p>
            </div>
          )}
          
          {weatherData.reduce((acc, day) => acc + day.rainfall, 0) > 100 && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
              <div className="flex items-center">
                <CloudRain className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Heavy Rainfall Alert</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Heavy rainfall expected this week. Ensure proper drainage and watch for waterlogging.
              </p>
            </div>
          )}
          
          {weatherData.reduce((acc, day) => acc + day.rainfall, 0) < 10 && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
              <div className="flex items-center">
                <Sun className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Dry Weather Alert</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Very low rainfall expected. Plan for increased irrigation and drought-resistant varieties.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
