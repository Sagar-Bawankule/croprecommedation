import React, { useState, useEffect } from 'react';
import { MapPin, Map, Navigation } from 'lucide-react';

const SoilMap = ({ location, soilData, locationInfo, locationError }) => {
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualLocation, setManualLocation] = useState(null);
  
  // Function to handle manual location submission
  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid latitude (-90 to 90) and longitude (-180 to 180) values');
      return;
    }
    
    setManualLocation({
      latitude: lat,
      longitude: lng
    });
  };
  
  if (!location && !manualLocation) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <MapPin className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Farm Location & Soil Map</h2>
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Note:</strong> Please provide a location to view the map and soil data.
          </p>
          <button 
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="text-sm text-blue-600 font-medium hover:text-blue-800"
          >
            {showManualEntry ? 'Hide manual entry' : 'Enter location manually'}
          </button>
        </div>
        
        {showManualEntry && (
          <form onSubmit={handleManualLocationSubmit} className="space-y-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  id="latitude"
                  step="any"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. 20.5937"
                  required
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  id="longitude"
                  step="any"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. 78.9629"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Set Location
            </button>
          </form>
        )}
        
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-gray-600">Map will appear here once location is provided</p>
        </div>
      </div>
    );
  }
  
  // Use manual location if provided, otherwise use the passed in location
  const displayLocation = manualLocation || location;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <MapPin className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Farm Location & Soil Map</h2>
      </div>
      
      <div className="mb-4">
        <p><strong>Location:</strong> {displayLocation.latitude.toFixed(6)}, {displayLocation.longitude.toFixed(6)}</p>
        {locationInfo && <p><strong>Area:</strong> {locationInfo.city}{locationInfo.state && `, ${locationInfo.state}`}</p>}
        
        {/* Show manual entry option */}
        <button 
          onClick={() => setShowManualEntry(!showManualEntry)}
          className="text-sm text-blue-600 font-medium hover:text-blue-800 mt-2"
        >
          {showManualEntry ? 'Hide manual entry' : 'Enter location manually'}
        </button>
        
        {showManualEntry && (
          <form onSubmit={handleManualLocationSubmit} className="space-y-4 my-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  id="latitude"
                  step="any"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={displayLocation.latitude.toString()}
                  required
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  id="longitude"
                  step="any"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={displayLocation.longitude.toString()}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Location
            </button>
          </form>
        )}
        
        {locationError && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> {locationError}
            </p>
          </div>
        )}
        {manualLocation && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>✓</strong> Using manually entered location
            </p>
          </div>
        )}
        {!manualLocation && location && !locationError && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>✓</strong> Using your current GPS location
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
        <iframe
          src={`https://maps.google.com/maps?q=${displayLocation.latitude},${displayLocation.longitude}&hl=en&z=15&output=embed`}
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Farm Location Map"
        />
      </div>

      {soilData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50 rounded-lg p-4">
            <h4 className="font-semibold">Clay: {(soilData.clay_content || 30).toFixed(1)}%</h4>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-semibold">Sand: {(soilData.sand_content || 40).toFixed(1)}%</h4>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold">Silt: {(soilData.silt_content || 30).toFixed(1)}%</h4>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilMap;
