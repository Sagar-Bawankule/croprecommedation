import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Layers, Info } from 'lucide-react';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SoilMap = ({ location, soilData, locationInfo }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!location || !mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [location.latitude, location.longitude], 
        13
      );

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Add soil grid overlay (this is a simplified visualization)
      // In a real application, you would use actual soil grid tile services
      const soilOverlay = L.tileLayer(
        'https://tiles.soilgrids.org/soil_type/{z}/{x}/{y}.png',
        {
          attribution: 'SoilGrids',
          opacity: 0.6,
          maxZoom: 18
        }
      );

      // Add farm location marker
      const farmMarker = L.marker([location.latitude, location.longitude])
        .addTo(mapInstanceRef.current);

      // Create popup content
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-lg mb-2">🌾 Farm Location</h3>
          <p class="text-sm mb-1"><strong>Coordinates:</strong> ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
          ${locationInfo ? `
            <p class="text-sm mb-1"><strong>Location:</strong> ${locationInfo.city}, ${locationInfo.state}</p>
            <p class="text-sm mb-1"><strong>District:</strong> ${locationInfo.district}</p>
          ` : ''}
          ${soilData ? `
            <hr class="my-2">
            <h4 class="font-semibold mb-1">🌱 Soil Information</h4>
            <p class="text-sm mb-1"><strong>Soil Type:</strong> ${soilData.soil_type}</p>
            <p class="text-sm mb-1"><strong>pH Level:</strong> ${soilData.ph_level.toFixed(1)}</p>
            <p class="text-sm mb-1"><strong>Clay:</strong> ${soilData.clay_content.toFixed(1)}%</p>
            <p class="text-sm mb-1"><strong>Sand:</strong> ${soilData.sand_content.toFixed(1)}%</p>
            <p class="text-sm"><strong>Organic Carbon:</strong> ${soilData.organic_carbon.toFixed(1)}%</p>
          ` : ''}
        </div>
      `;

      farmMarker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      // Add layer control
      const baseLayers = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
        "Satellite": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: © OpenStreetMap contributors, © OpenTopoMap'
        })
      };

      const overlayLayers = {
        "Soil Grid": soilOverlay
      };

      L.control.layers(baseLayers, overlayLayers).addTo(mapInstanceRef.current);

      // Add scale control
      L.control.scale().addTo(mapInstanceRef.current);
    } else {
      // Update existing map
      mapInstanceRef.current.setView([location.latitude, location.longitude], 13);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location, soilData, locationInfo]);

  const getSoilHealthColor = (soilData) => {
    if (!soilData) return 'gray';
    
    const phOptimal = soilData.ph_level >= 6.0 && soilData.ph_level <= 7.5;
    const carbonGood = soilData.organic_carbon >= 2.0;
    
    if (phOptimal && carbonGood) return 'green';
    if (phOptimal || carbonGood) return 'yellow';
    return 'red';
  };

  if (!location) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <MapPin className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Farm Location & Soil Map</h2>
        </div>
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">Please enable location access to view the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <MapPin className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Farm Location & Soil Map</h2>
      </div>

      {/* Location Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-800">Location</h3>
          </div>
          <p className="text-sm text-blue-700">
            {locationInfo ? `${locationInfo.city}, ${locationInfo.state}` : 'Loading...'}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        </div>

        {soilData && (
          <>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Layers className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">Soil Type</h3>
              </div>
              <p className="text-lg font-bold text-green-600">{soilData.soil_type}</p>
              <p className="text-sm text-green-700">pH: {soilData.ph_level.toFixed(1)}</p>
            </div>

            <div className={`rounded-lg p-4 ${
              getSoilHealthColor(soilData) === 'green' ? 'bg-green-50' :
              getSoilHealthColor(soilData) === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center mb-2">
                <Info className={`h-5 w-5 mr-2 ${
                  getSoilHealthColor(soilData) === 'green' ? 'text-green-600' :
                  getSoilHealthColor(soilData) === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                }`} />
                <h3 className={`font-semibold ${
                  getSoilHealthColor(soilData) === 'green' ? 'text-green-800' :
                  getSoilHealthColor(soilData) === 'yellow' ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  Soil Health
                </h3>
              </div>
              <p className={`text-lg font-bold ${
                getSoilHealthColor(soilData) === 'green' ? 'text-green-600' :
                getSoilHealthColor(soilData) === 'yellow' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {getSoilHealthColor(soilData) === 'green' ? 'Good' :
                 getSoilHealthColor(soilData) === 'yellow' ? 'Fair' : 'Poor'}
              </p>
              <p className={`text-sm ${
                getSoilHealthColor(soilData) === 'green' ? 'text-green-700' :
                getSoilHealthColor(soilData) === 'yellow' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                Organic C: {soilData.organic_carbon.toFixed(1)}%
              </p>
            </div>
          </>
        )}
      </div>

      {/* Map Container */}
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <div 
          ref={mapRef} 
          className="h-96 w-full"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Soil Composition Chart */}
      {soilData && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Soil Composition</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">Clay Content</h4>
              <div className="w-full bg-amber-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-amber-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(soilData.clay_content, 100)}%` }}
                />
              </div>
              <p className="text-sm text-amber-700">{soilData.clay_content.toFixed(1)}%</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Sand Content</h4>
              <div className="w-full bg-yellow-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-yellow-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(soilData.sand_content, 100)}%` }}
                />
              </div>
              <p className="text-sm text-yellow-700">{soilData.sand_content.toFixed(1)}%</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Silt Content</h4>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gray-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(soilData.silt_content, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-700">{soilData.silt_content.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Map Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span>📍 Your Farm Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 opacity-60 rounded mr-2"></div>
            <span>🌱 Soil Grid Overlay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilMap;
