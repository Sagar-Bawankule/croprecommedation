import React, { useState, useEffect } from 'react';
import { Sprout, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import SoilParameterForm from './components/SoilParameterForm';
import CropRecommendationResults from './components/CropRecommendationResults';
import WeatherDashboard from './components/WeatherDashboard';
import SoilMap from './components/SoilMap';
import { cropAPI } from './services/api';
import './index.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [recommendationData, setRecommendationData] = useState(null);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await cropAPI.healthCheck();
      setApiStatus('connected');
    } catch (error) {
      setApiStatus('disconnected');
      console.error('API health check failed:', error);
    }
  };

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Submitting form data:', formData);
      const result = await cropAPI.getRecommendations(formData);
      console.log('Received recommendation data:', result);
      setRecommendationData(result);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError(
        error.response?.data?.detail || 
        error.message || 
        'Failed to get crop recommendations. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setRecommendationData(null);
    checkApiHealth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Intelligent Crop Recommendation System
                </h1>
                <p className="text-sm text-gray-600">
                  AI-powered farming with real-time data integration
                </p>
              </div>
            </div>
            
            {/* API Status Indicator */}
            <div className="flex items-center space-x-2">
              {apiStatus === 'connected' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Connected</span>
                </>
              ) : apiStatus === 'disconnected' ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-red-600 font-medium">Disconnected</span>
                </>
              ) : (
                <>
                  <Loader className="h-5 w-5 text-yellow-600 animate-spin" />
                  <span className="text-sm text-yellow-600 font-medium">Checking...</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* API Disconnected Warning */}
        {apiStatus === 'disconnected' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Backend Service Unavailable</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Unable to connect to the backend API. Please ensure the FastAPI server is running on port 8000.
                </p>
              </div>
              <button
                onClick={checkApiHealth}
                className="ml-4 px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
              >
                Check Again
              </button>
            </div>
          </div>
        )}

        {/* Form Section */}
        {!recommendationData && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Smart Crop Planning for Better Yields
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Get personalized crop recommendations based on your soil conditions, local weather, 
                market trends, and budget constraints. Our AI analyzes multiple factors to suggest 
                the most profitable crops for your farm.
              </p>
            </div>
            
            <SoilParameterForm onSubmit={handleFormSubmit} loading={loading} />
            
            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sprout className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
                <p className="text-sm text-gray-600">
                  AI-powered crop suggestions based on soil and climate analysis
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌦️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Weather Integration</h3>
                <p className="text-sm text-gray-600">
                  Real-time weather data and 7-day forecasts for optimal planning
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Market Analysis</h3>
                <p className="text-sm text-gray-600">
                  Price trends and profitability analysis for informed decisions
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Rotation Planning</h3>
                <p className="text-sm text-gray-600">
                  3-year crop rotation plans for sustainable soil health
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {recommendationData && (
          <div className="space-y-8">
            {/* Header with Reset Option */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Crop Recommendations</h2>
                <p className="text-gray-600 mt-1">
                  Based on your farm parameters and current conditions
                </p>
              </div>
              <button
                onClick={() => setRecommendationData(null)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                New Analysis
              </button>
            </div>

            {/* Location & Soil Map */}
            {recommendationData.location_info && (
              <SoilMap 
                location={{
                  latitude: recommendationData.location_info.latitude || 0,
                  longitude: recommendationData.location_info.longitude || 0
                }}
                soilData={recommendationData.soil_data}
                locationInfo={recommendationData.location_info}
              />
            )}

            {/* Weather Dashboard */}
            {recommendationData.weather_forecast && (
              <WeatherDashboard weatherData={recommendationData.weather_forecast} />
            )}

            {/* Main Recommendations */}
            <CropRecommendationResults data={recommendationData} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              Intelligent Crop Recommendation System - Powered by AI and Real-time Data
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Built with React, FastAPI, and machine learning for sustainable agriculture
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
