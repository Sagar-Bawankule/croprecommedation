from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

class SoilParameters(BaseModel):
    N: float  # Nitrogen
    P: float  # Phosphorus
    K: float  # Potassium
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class LocationData(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None

class CropRecommendationRequest(BaseModel):
    soil_parameters: SoilParameters
    location: LocationData
    budget_per_hectare: float
    farm_size_hectares: Optional[float] = 1.0

class OptimalRange(BaseModel):
    min: float
    max: float
    unit: str

class SoilTreatment(BaseModel):
    parameter: str
    current_value: float
    optimal_range: OptimalRange
    treatment_suggestion: str
    fertilizer_recommendation: str

class CropRecommendation(BaseModel):
    crop: str
    agronomic_score: str
    estimated_cost: str
    estimated_profit: str
    profit_margin: float
    status: str
    growing_season: str
    water_requirement: str

class CropRotationPlan(BaseModel):
    year: int
    season: str
    recommended_crop: str
    crop_type: str  # cereal, legume, fruit, vegetable
    benefits: List[str]
    estimated_profit: float

class WeatherForecast(BaseModel):
    date: datetime
    temperature_max: float
    temperature_min: float
    rainfall: float
    humidity: float
    wind_speed: float
    weather_condition: str

class MarketAnalysis(BaseModel):
    crop: str
    current_price: float
    price_trend: str  # rising, falling, stable
    demand_level: str  # high, medium, low
    profit_potential: float

class SoilData(BaseModel):
    clay_content: float
    sand_content: float
    silt_content: float
    organic_carbon: float
    ph_level: float
    soil_type: str

class CropAdvisory(BaseModel):
    weather_alert: Optional[str] = None
    planting_recommendation: str
    irrigation_advice: str
    pest_warning: Optional[str] = None
    harvest_timing: str

class ComprehensiveResponse(BaseModel):
    crop_recommendations: List[CropRecommendation]
    soil_treatments: List[SoilTreatment]
    rotation_plan: List[CropRotationPlan]
    weather_forecast: List[WeatherForecast]
    market_analysis: List[MarketAnalysis]
    soil_data: SoilData
    crop_advisory: CropAdvisory
    location_info: Dict[str, str]
