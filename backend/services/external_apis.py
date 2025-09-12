import requests
import asyncio
import httpx
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
import json

class WeatherService:
    """Service to fetch weather data from Open-Meteo API"""
    
    BASE_URL = "https://api.open-meteo.com/v1/forecast"
    
    @staticmethod
    async def get_weather_forecast(latitude: float, longitude: float, days: int = 7) -> List[Dict]:
        """
        Fetch weather forecast for the given coordinates
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m,wind_speed_10m_max",
            "forecast_days": days,
            "timezone": "auto"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(WeatherService.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
                
                forecasts = []
                daily_data = data.get("daily", {})
                
                for i in range(len(daily_data.get("time", []))):
                    forecast = {
                        "date": datetime.fromisoformat(daily_data["time"][i]),
                        "temperature_max": daily_data["temperature_2m_max"][i],
                        "temperature_min": daily_data["temperature_2m_min"][i],
                        "rainfall": daily_data["precipitation_sum"][i],
                        "humidity": daily_data.get("relative_humidity_2m", [70])[0] if daily_data.get("relative_humidity_2m") else 70,
                        "wind_speed": daily_data["wind_speed_10m_max"][i],
                        "weather_condition": WeatherService._determine_weather_condition(
                            daily_data["precipitation_sum"][i],
                            daily_data["temperature_2m_max"][i]
                        )
                    }
                    forecasts.append(forecast)
                
                return forecasts
                
            except Exception as e:
                print(f"Error fetching weather data: {e}")
                return WeatherService._get_fallback_weather(days)
    
    @staticmethod
    def _determine_weather_condition(precipitation: float, temperature: float) -> str:
        """Determine weather condition based on precipitation and temperature"""
        if precipitation > 10:
            return "Heavy Rain"
        elif precipitation > 2:
            return "Light Rain"
        elif temperature > 35:
            return "Hot"
        elif temperature < 10:
            return "Cold"
        else:
            return "Clear"
    
    @staticmethod
    def _get_fallback_weather(days: int) -> List[Dict]:
        """Fallback weather data if API fails"""
        forecasts = []
        base_date = datetime.now()
        
        for i in range(days):
            forecast = {
                "date": base_date + timedelta(days=i),
                "temperature_max": 28.0 + (i % 3),
                "temperature_min": 18.0 + (i % 3),
                "rainfall": 2.0 if i % 3 == 0 else 0.0,
                "humidity": 65.0,
                "wind_speed": 10.0,
                "weather_condition": "Clear"
            }
            forecasts.append(forecast)
        
        return forecasts


class SoilGridsService:
    """Service to fetch soil data from ISRIC SoilGrids API"""
    
    BASE_URL = "https://rest.isric.org/soilgrids/v2.0/properties"
    
    @staticmethod
    async def get_soil_data(latitude: float, longitude: float) -> Dict:
        """
        Fetch soil composition data for the given coordinates
        """
        properties = ["clay", "sand", "silt", "ocd", "phh2o"]  # organic carbon density, pH
        
        params = {
            "lon": longitude,
            "lat": latitude,
            "property": properties,
            "depth": "0-5cm",  # Surface layer
            "value": "mean"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(SoilGridsService.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
                
                # Extract soil data
                properties_data = data.get("properties", {})
                
                soil_data = {
                    "clay_content": SoilGridsService._extract_value(properties_data, "clay"),
                    "sand_content": SoilGridsService._extract_value(properties_data, "sand"),
                    "silt_content": SoilGridsService._extract_value(properties_data, "silt"),
                    "organic_carbon": SoilGridsService._extract_value(properties_data, "ocd"),
                    "ph_level": SoilGridsService._extract_value(properties_data, "phh2o") / 10,  # Convert to pH scale
                    "soil_type": SoilGridsService._determine_soil_type(
                        SoilGridsService._extract_value(properties_data, "clay"),
                        SoilGridsService._extract_value(properties_data, "sand"),
                        SoilGridsService._extract_value(properties_data, "silt")
                    )
                }
                
                return soil_data
                
            except Exception as e:
                print(f"Error fetching soil data: {e}")
                return SoilGridsService._get_fallback_soil_data()
    
    @staticmethod
    def _extract_value(properties_data: Dict, property_name: str) -> float:
        """Extract value from SoilGrids response"""
        try:
            prop_data = properties_data.get(property_name, {})
            depths = prop_data.get("depths", [])
            if depths:
                values = depths[0].get("values", {})
                return values.get("mean", 0.0)
            return 0.0
        except:
            return 0.0
    
    @staticmethod
    def _determine_soil_type(clay: float, sand: float, silt: float) -> str:
        """Determine soil type based on composition"""
        if clay > 40:
            return "Clay"
        elif sand > 70:
            return "Sandy"
        elif silt > 40:
            return "Silty"
        elif clay > 20 and sand > 40:
            return "Clay Loam"
        elif sand > 50 and clay < 20:
            return "Sandy Loam"
        else:
            return "Loam"
    
    @staticmethod
    def _get_fallback_soil_data() -> Dict:
        """Fallback soil data if API fails"""
        return {
            "clay_content": 25.0,
            "sand_content": 45.0,
            "silt_content": 30.0,
            "organic_carbon": 2.5,
            "ph_level": 6.5,
            "soil_type": "Loam"
        }


class GeolocationService:
    """Service for reverse geocoding using Nominatim API"""
    
    BASE_URL = "https://nominatim.openstreetmap.org/reverse"
    
    @staticmethod
    async def get_location_info(latitude: float, longitude: float) -> Dict[str, str]:
        """
        Get location information from coordinates
        """
        params = {
            "lat": latitude,
            "lon": longitude,
            "format": "json",
            "addressdetails": 1
        }
        
        headers = {
            "User-Agent": "CropRecommendationSystem/1.0"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    GeolocationService.BASE_URL, 
                    params=params, 
                    headers=headers
                )
                response.raise_for_status()
                data = response.json()
                
                address = data.get("address", {})
                
                location_info = {
                    "display_name": data.get("display_name", "Unknown Location"),
                    "city": address.get("city") or address.get("town") or address.get("village", "Unknown City"),
                    "state": address.get("state", "Unknown State"),
                    "country": address.get("country", "Unknown Country"),
                    "postcode": address.get("postcode", "Unknown"),
                    "district": address.get("state_district", "Unknown District")
                }
                
                return location_info
                
            except Exception as e:
                print(f"Error fetching location data: {e}")
                return {
                    "display_name": f"Location {latitude:.2f}, {longitude:.2f}",
                    "city": "Unknown City",
                    "state": "Unknown State",
                    "country": "Unknown Country",
                    "postcode": "Unknown",
                    "district": "Unknown District"
                }
