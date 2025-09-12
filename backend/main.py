from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import asyncio
from typing import Dict, List

from models.schemas import (
    CropRecommendationRequest, 
    ComprehensiveResponse,
    SoilTreatment,
    CropRecommendation,
    CropRotationPlan,
    WeatherForecast,
    MarketAnalysis,
    SoilData,
    CropAdvisory
)

from services.crop_service import CropRecommendationService
from services.external_apis import WeatherService, SoilGridsService, GeolocationService
from services.market_service import MarketAnalysisService

app = FastAPI(
    title="Intelligent Crop Recommendation System",
    description="AI-powered crop recommendation with soil analysis, weather integration, and market insights",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
crop_service = CropRecommendationService()
weather_service = WeatherService()
soil_service = SoilGridsService()
geo_service = GeolocationService()
market_service = MarketAnalysisService()

@app.get("/")
async def root():
    return {"message": "Intelligent Crop Recommendation System API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

@app.post("/api/recommend", response_model=ComprehensiveResponse)
async def get_comprehensive_recommendation(request: CropRecommendationRequest):
    """
    Get comprehensive crop recommendations with all integrated features
    """
    try:
        # Extract data from request
        soil_params = request.soil_parameters.dict()
        location = request.location
        budget = request.budget_per_hectare
        
        # Run all services concurrently for better performance
        weather_task = weather_service.get_weather_forecast(
            location.latitude, 
            location.longitude
        )
        
        soil_task = soil_service.get_soil_data(
            location.latitude, 
            location.longitude
        )
        
        location_task = geo_service.get_location_info(
            location.latitude, 
            location.longitude
        )
        
        # Wait for all async tasks
        weather_data, soil_data, location_info = await asyncio.gather(
            weather_task, soil_task, location_task
        )
        
        # Get crop recommendations
        crop_recommendations = crop_service.get_crop_recommendations(soil_params, budget)
        
        # Get soil treatment suggestions
        soil_treatments = crop_service.analyze_soil_treatment(soil_params)
        
        # Generate rotation plan (use best recommended crop)
        primary_crop = crop_recommendations[0]['crop'] if crop_recommendations else 'rice'
        rotation_plan = crop_service.generate_rotation_plan(primary_crop)
        
        # Get market analysis for recommended crops
        crop_names = [rec['crop'] for rec in crop_recommendations[:5]]
        market_analysis = market_service.get_market_analysis(crop_names)
        
        # Generate crop advisory
        crop_advisory = crop_service.generate_crop_advisory(weather_data, soil_data)
        
        # Format response
        response = ComprehensiveResponse(
            crop_recommendations=[
                CropRecommendation(**rec) for rec in crop_recommendations
            ],
            soil_treatments=[
                SoilTreatment(**treatment) for treatment in soil_treatments
            ],
            rotation_plan=[
                CropRotationPlan(**plan) for plan in rotation_plan
            ],
            weather_forecast=[
                WeatherForecast(**forecast) for forecast in weather_data
            ],
            market_analysis=[
                MarketAnalysis(**analysis) for analysis in market_analysis
            ],
            soil_data=SoilData(**soil_data),
            crop_advisory=CropAdvisory(**crop_advisory),
            location_info=location_info
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@app.get("/api/weather/{latitude}/{longitude}")
async def get_weather(latitude: float, longitude: float, days: int = 7):
    """Get weather forecast for specific location"""
    try:
        weather_data = await weather_service.get_weather_forecast(latitude, longitude, days)
        return {"weather_forecast": weather_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather: {str(e)}")

@app.get("/api/soil/{latitude}/{longitude}")
async def get_soil_data(latitude: float, longitude: float):
    """Get soil data for specific location"""
    try:
        soil_data = await soil_service.get_soil_data(latitude, longitude)
        return {"soil_data": soil_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching soil data: {str(e)}")

@app.get("/api/location/{latitude}/{longitude}")
async def get_location_info(latitude: float, longitude: float):
    """Get location information from coordinates"""
    try:
        location_info = await geo_service.get_location_info(latitude, longitude)
        return {"location_info": location_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching location: {str(e)}")

@app.get("/api/market-trends")
async def get_market_trends():
    """Get market price trends for major crops"""
    try:
        trends = market_service.simulate_market_trends(30)
        return {"market_trends": trends}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market trends: {str(e)}")

@app.post("/api/soil-treatment")
async def analyze_soil_treatment(soil_params: Dict):
    """Analyze soil parameters and provide treatment suggestions"""
    try:
        treatments = crop_service.analyze_soil_treatment(soil_params)
        return {"soil_treatments": treatments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing soil: {str(e)}")

@app.get("/api/rotation-plan/{crop}")
async def get_rotation_plan(crop: str):
    """Get 3-year crop rotation plan"""
    try:
        rotation_plan = crop_service.generate_rotation_plan(crop)
        return {"rotation_plan": rotation_plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating rotation plan: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
