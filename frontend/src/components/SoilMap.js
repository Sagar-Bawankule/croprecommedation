import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

const SoilMap = ({ location, soilData, locationInfo, locationError }) => {
  if (!location) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold">Farm Location & Soil Map</h2>
        <p>Location data not available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <MapPin className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Farm Location & Soil Map</h2>
      </div>
      
      <div className="mb-4">
        <p><strong>Location:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
        {locationInfo && <p><strong>Area:</strong> {locationInfo.city}{locationInfo.state && `, ${locationInfo.state}`}</p>}
        {locationError && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> {locationError}
            </p>
          </div>
        )}
        {!locationError && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
            <p className="text-sm text-green-800">
              <strong>✓</strong> Using your current location
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
        <iframe
          src={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}&hl=en&z=15&output=embed`}
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
