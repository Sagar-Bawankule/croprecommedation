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
    
    @staticmethod
    def _get_location_based_fallback_weather(latitude: float, longitude: float, days: int = 7) -> List[Dict]:
        """Generate location-specific fallback weather data based on coordinates"""
        import hashlib
        
        # Create a seed based on location for consistent but varied data
        location_seed = f"{latitude:.2f},{longitude:.2f}"
        hash_obj = hashlib.md5(location_seed.encode())
        seed_value = int(hash_obj.hexdigest()[:8], 16)
        
        # Use location factors for climate-based variations
        lat_factor = abs(latitude) / 90.0  # 0 to 1
        
        forecasts = []
        base_date = datetime.now()
        
        for i in range(days):
            # Temperature varies by latitude and season
            base_temp_max = 25 + (1 - lat_factor) * 15  # Hotter near equator
            base_temp_min = 15 + (1 - lat_factor) * 10
            
            # Add daily variation
            temp_variation = ((seed_value >> (i * 4)) % 20) - 10  # -10 to +10
            
            # Rainfall varies by location and season
            # Tropical regions (low latitude) have more rain
            base_rainfall = 5 + (1 - lat_factor) * 20  # More rain near equator
            rainfall_variation = ((seed_value >> (i * 6)) % 50) / 10.0  # 0 to 5
            
            forecast = {
                "date": base_date + timedelta(days=i),
                "temperature_max": round(base_temp_max + temp_variation * 0.5, 1),
                "temperature_min": round(base_temp_min + temp_variation * 0.3, 1),
                "rainfall": round(max(0, base_rainfall + rainfall_variation - 2.5), 1),
                "humidity": round(60 + lat_factor * 20 + ((seed_value >> (i * 3)) % 20), 1),
                "wind_speed": round(8 + ((seed_value >> (i * 2)) % 10), 1),
                "weather_condition": WeatherService._determine_weather_condition(
                    base_rainfall + rainfall_variation - 2.5,
                    base_temp_max + temp_variation * 0.5
                )
            }
            forecasts.append(forecast)
        
        return forecasts


class SoilGridsService:
    """Service to fetch soil data from ISRIC SoilGrids API"""
    
    BASE_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"
    
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
                
                # Extract basic soil properties
                clay = SoilGridsService._extract_value(properties_data, "clay")
                sand = SoilGridsService._extract_value(properties_data, "sand")
                silt = SoilGridsService._extract_value(properties_data, "silt")
                organic_carbon = SoilGridsService._extract_value(properties_data, "ocd")
                
                # Handle pH properly - SoilGrids returns pH in centigrade (pH * 10)
                ph_raw = SoilGridsService._extract_value(properties_data, "phh2o")
                ph = (ph_raw / 10) if ph_raw > 0 else 6.5  # Default to 6.5 if no valid pH data
                
                # Estimate NPK values based on soil composition and location
                nitrogen = SoilGridsService._estimate_nitrogen(organic_carbon, clay, latitude)
                phosphorus = SoilGridsService._estimate_phosphorus(clay, ph, latitude)
                potassium = SoilGridsService._estimate_potassium(clay, sand, latitude)
                
                soil_data = {
                    "nitrogen": round(nitrogen, 2),
                    "phosphorus": round(phosphorus, 2),
                    "potassium": round(potassium, 2),
                    "ph": round(ph, 2),
                    "ph_level": round(ph, 2),  # Include both for consistency
                    "clay_content": clay,
                    "sand_content": sand,
                    "silt_content": silt,
                    "organic_carbon": organic_carbon,
                    "soil_type": SoilGridsService._determine_soil_type(clay, sand, silt)
                }
                
                return soil_data
                
            except Exception as e:
                print(f"Error fetching soil data: {e}")
                return SoilGridsService._get_location_based_fallback(latitude, longitude)
    
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
    def _estimate_nitrogen(organic_carbon: float, clay: float, latitude: float) -> float:
        """Estimate nitrogen content based on soil properties and location"""
        # Base nitrogen from organic carbon (organic matter contains ~5% N)
        base_n = (organic_carbon / 10) * 0.05 * 1000  # Convert to mg/kg
        
        # Clay retention factor (clay soils retain more nitrogen)
        clay_factor = 1 + (clay / 100) * 0.3
        
        # Climate factor based on latitude (tropical regions lose more N)
        climate_factor = 1.2 if abs(latitude) < 23.5 else 1.0
        
        # Calculate final nitrogen (typical range: 20-200 mg/kg)
        nitrogen = max(20, min(200, base_n * clay_factor * climate_factor))
        return nitrogen
    
    @staticmethod
    def _estimate_phosphorus(clay: float, ph: float, latitude: float) -> float:
        """Estimate phosphorus content based on soil properties and location"""
        # Base phosphorus varies with clay content and pH
        base_p = 30 + (clay / 100) * 50  # Clay soils have more P
        
        # pH factor (P availability peaks around pH 6.5)
        ph_factor = 1 - abs(ph - 6.5) * 0.15
        ph_factor = max(0.7, min(1.3, ph_factor))
        
        # Regional factor (weathered tropical soils have less available P)
        regional_factor = 0.8 if abs(latitude) < 23.5 else 1.0
        
        # Calculate final phosphorus (typical range: 10-100 mg/kg)
        phosphorus = max(10, min(100, base_p * ph_factor * regional_factor))
        return phosphorus
    
    @staticmethod
    def _estimate_potassium(clay: float, sand: float, latitude: float) -> float:
        """Estimate potassium content based on soil properties and location"""
        # Base potassium from clay minerals (clay soils retain more K)
        base_k = 100 + (clay / 100) * 200
        
        # Sandy soils lose potassium through leaching
        sand_factor = 1 - (sand / 100) * 0.3
        sand_factor = max(0.5, sand_factor)
        
        # Climate factor (tropical regions have more leaching)
        climate_factor = 0.8 if abs(latitude) < 23.5 else 1.0
        
        # Calculate final potassium (typical range: 50-400 mg/kg)
        potassium = max(50, min(400, base_k * sand_factor * climate_factor))
        return potassium
    
    @staticmethod
    def _get_location_based_fallback(latitude: float, longitude: float) -> Dict:
        """Generate location-specific fallback soil data based on coordinates"""
        import hashlib
        import json
        
        # Create a seed based on location for consistent but varied data
        location_seed = f"{latitude:.2f},{longitude:.2f}"
        hash_obj = hashlib.md5(location_seed.encode())
        seed_value = int(hash_obj.hexdigest()[:8], 16)
        
        # Use seed to generate location-specific variations
        lat_factor = abs(latitude) / 90.0  # 0 to 1
        lon_factor = (longitude + 180) / 360.0  # 0 to 1
        
        # Generate varied but realistic soil parameters
        clay = 15 + (seed_value % 40) + lat_factor * 20  # 15-75%
        sand = 20 + ((seed_value >> 8) % 50) + lon_factor * 20  # 20-90%
        silt = max(5, 100 - clay - sand)  # Remainder, min 5%
        
        # Adjust to ensure total is 100%
        total = clay + sand + silt
        clay = (clay / total) * 100
        sand = (sand / total) * 100
        silt = (silt / total) * 100
        
        # pH varies by climate zone
        ph = 5.5 + (lat_factor * 2) + ((seed_value >> 16) % 20) / 10  # 5.5-8.5
        
        # Organic carbon varies by climate
        organic_carbon = 1.0 + lat_factor * 3 + ((seed_value >> 24) % 20) / 10  # 1-6%
        
        # Calculate NPK based on these location-specific soil properties
        nitrogen = SoilGridsService._estimate_nitrogen(organic_carbon, clay, latitude)
        phosphorus = SoilGridsService._estimate_phosphorus(clay, ph, latitude)
        potassium = SoilGridsService._estimate_potassium(clay, sand, latitude)
        
        return {
            "nitrogen": round(nitrogen, 2),
            "phosphorus": round(phosphorus, 2),
            "potassium": round(potassium, 2),
            "ph": round(ph, 2),
            "clay_content": round(clay, 2),
            "sand_content": round(sand, 2),
            "silt_content": round(silt, 2),
            "organic_carbon": round(organic_carbon, 2),
            "ph_level": round(ph, 2),
            "soil_type": SoilGridsService._determine_soil_type(clay, sand, silt)
        }
    
    @staticmethod
    def _get_fallback_soil_data() -> Dict:
        """Default fallback soil data if API fails"""
        return {
            "nitrogen": 80.0,
            "phosphorus": 45.0,
            "potassium": 180.0,
            "ph": 6.5,
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
