import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(1)}%`;
};

export const getLocationAsync = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser. Please enter your location manually.'));
      return;
    }

    // Check if we're on HTTPS or localhost (required for geolocation)
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isSecure) {
      reject(new Error('Geolocation requires HTTPS. Please enter your location manually or use HTTPS.'));
      return;
    }

    console.log('📍 Requesting HIGH ACCURACY GPS position (this may take 10-15 seconds)...');
    console.log('⏳ Please wait for accurate GPS signal...');
    
    let watchId = null;
    let hasResolved = false;
    let positionsReceived = [];
    let bestPosition = null;
    
    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    };

    // Set a longer timeout to allow GPS to get accurate fix
    const timeoutId = setTimeout(() => {
      if (!hasResolved) {
        cleanup();
        
        // If we got at least one position, use the best one
        if (bestPosition) {
          console.log('⚠️ Timeout reached, using best available position with accuracy:', bestPosition.coords.accuracy + 'm');
          hasResolved = true;
          const result = {
            latitude: bestPosition.coords.latitude,
            longitude: bestPosition.coords.longitude,
            accuracy: bestPosition.coords.accuracy,
            timestamp: bestPosition.timestamp
          };
          resolve(result);
        } else {
          reject(new Error('Location request timed out. Please try again or enter your location manually.'));
        }
      }
    }, 30000); // 30 second timeout - longer to get accurate GPS

    // Use watchPosition to monitor and get the MOST accurate position
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        positionsReceived.push({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: accuracy,
          time: new Date().toLocaleTimeString()
        });
        
        console.log(`📡 GPS Update #${positionsReceived.length}:`, {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: accuracy.toFixed(1) + 'm',
          time: new Date().toLocaleTimeString()
        });
        
        // Keep track of best (most accurate) position
        if (!bestPosition || accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
          console.log(`✨ New best accuracy: ${accuracy.toFixed(1)}m`);
        }
        
        // Accept position if accuracy is good enough (under 50 meters)
        // This prevents using inaccurate network-based location
        if (accuracy <= 50 && !hasResolved) {
          hasResolved = true;
          clearTimeout(timeoutId);
          cleanup();
          
          const result = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            updatesReceived: positionsReceived.length
          };
          
          console.log('✅ ACCURATE GPS position obtained:', {
            lat: result.latitude.toFixed(6),
            lng: result.longitude.toFixed(6),
            accuracy: result.accuracy.toFixed(1) + 'm',
            updates: result.updatesReceived
          });
          
          resolve(result);
        }
        
        // If we've been trying for a while (10 updates) and haven't resolved,
        // use the best position we have so far
        if (positionsReceived.length >= 10 && !hasResolved) {
          hasResolved = true;
          clearTimeout(timeoutId);
          cleanup();
          
          const result = {
            latitude: bestPosition.coords.latitude,
            longitude: bestPosition.coords.longitude,
            accuracy: bestPosition.coords.accuracy,
            timestamp: bestPosition.timestamp,
            updatesReceived: positionsReceived.length
          };
          
          console.log('⚠️ Using best position after 10 updates:', {
            lat: result.latitude.toFixed(6),
            lng: result.longitude.toFixed(6),
            accuracy: result.accuracy.toFixed(1) + 'm',
            updates: result.updatesReceived
          });
          
          resolve(result);
        }
      },
      (error) => {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(timeoutId);
          cleanup();
          
          let errorMessage = 'Unable to retrieve location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please allow location access in your browser settings and try again, or enter your location manually.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your GPS/location services and try again, or enter your location manually.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again or enter your location manually.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location. Please try again or enter your location manually.';
          }
          console.error('❌ GPS Error:', errorMessage);
          reject(new Error(errorMessage));
        }
      },
      {
        enableHighAccuracy: true,    // CRITICAL: Force GPS, not network location
        timeout: 27000,               // 27 seconds for each position attempt
        maximumAge: 0                 // NEVER use cached position
      }
    );
  });
};

export const validateSoilParameters = (params) => {
  const errors = {};
  
  // Nitrogen (N) validation
  if (!params.N || params.N < 0 || params.N > 200) {
    errors.N = 'Nitrogen should be between 0-200 kg/ha';
  }
  
  // Phosphorus (P) validation
  if (!params.P || params.P < 0 || params.P > 150) {
    errors.P = 'Phosphorus should be between 0-150 kg/ha';
  }
  
  // Potassium (K) validation
  if (!params.K || params.K < 0 || params.K > 200) {
    errors.K = 'Potassium should be between 0-200 kg/ha';
  }
  
  // Temperature validation
  if (!params.temperature || params.temperature < -10 || params.temperature > 50) {
    errors.temperature = 'Temperature should be between -10°C to 50°C';
  }
  
  // Humidity validation
  if (!params.humidity || params.humidity < 10 || params.humidity > 100) {
    errors.humidity = 'Humidity should be between 10-100%';
  }
  
  // pH validation
  if (!params.ph || params.ph < 3 || params.ph > 12) {
    errors.ph = 'pH should be between 3-12';
  }
  
  // Rainfall validation
  if (!params.rainfall || params.rainfall < 0 || params.rainfall > 3000) {
    errors.rainfall = 'Rainfall should be between 0-3000 mm';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const getCropColor = (crop) => {
  const colorMap = {
    rice: '#8B5CF6',
    maize: '#F59E0B',
    chickpea: '#10B981',
    wheat: '#F97316',
    cotton: '#EC4899',
    sugarcane: '#06B6D4',
    default: '#6B7280'
  };
  
  return colorMap[crop.toLowerCase()] || colorMap.default;
};

export const getWeatherIcon = (condition) => {
  const iconMap = {
    'clear': '☀️',
    'cloudy': '☁️',
    'rain': '🌧️',
    'heavy rain': '⛈️',
    'hot': '🌡️',
    'cold': '❄️',
    'default': '🌤️'
  };
  
  return iconMap[condition.toLowerCase()] || iconMap.default;
};

export const calculateProfitMargin = (profit, cost) => {
  if (cost === 0) return 0;
  return ((profit / cost) * 100).toFixed(1);
};

export const getSoilHealthScore = (treatments) => {
  if (!treatments || treatments.length === 0) return 100;
  
  const severityWeights = {
    'low': 10,
    'medium': 20,
    'high': 35
  };
  
  let totalDeduction = 0;
  treatments.forEach(treatment => {
    // Simple severity classification based on how far from optimal
    const deviation = Math.abs(treatment.current_value - 
      (treatment.optimal_range.min + treatment.optimal_range.max) / 2);
    const range = treatment.optimal_range.max - treatment.optimal_range.min;
    const deviationPercent = (deviation / range) * 100;
    
    if (deviationPercent > 50) {
      totalDeduction += severityWeights.high;
    } else if (deviationPercent > 25) {
      totalDeduction += severityWeights.medium;
    } else {
      totalDeduction += severityWeights.low;
    }
  });
  
  return Math.max(0, 100 - totalDeduction);
};
