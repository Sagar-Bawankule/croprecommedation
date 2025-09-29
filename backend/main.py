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

@app.get("/api/crops")
async def get_crops():
    """Get list of available crops for treatment analysis"""
    try:
        # Get list of crops from the economic dataset
        crop_list = crop_service.economic_df.index.tolist()
        return {"crops": crop_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching crops: {str(e)}")

# New Crop Analysis Endpoints
class CropAnalysisRequest(BaseModel):
    selected_crop: str
    soil_parameters: Dict
    farm_size_hectares: float = 1.0

@app.post("/api/analyze-crop")
async def analyze_crop(request: CropAnalysisRequest):
    """Analyze crop suitability and provide basic treatment recommendations"""
    try:
        crop_name = request.selected_crop
        soil_params = request.soil_parameters
        
        # Basic crop analysis - check if the crop would be recommended
        recommendations = crop_service.get_crop_recommendations(soil_params, 100000)  # High budget to get all crops
        
        # Find the selected crop in recommendations
        selected_crop_data = None
        for rec in recommendations:
            if rec['crop'].lower() == crop_name.lower():
                selected_crop_data = rec
                break
        
        # Calculate realistic suitability score based on soil parameters
        base_score = 50.0  # Base score
        
        # Score adjustments based on soil parameters
        if selected_crop_data:
            # Extract suitability score from agronomic_score (e.g., "75.23%" -> 75.23)
            suitability_str = selected_crop_data['agronomic_score'].replace('%', '')
            suitability_score = float(suitability_str)
        else:
            # If crop not found in recommendations, calculate based on soil parameters
            suitability_score = base_score
            
            # Adjust score based on parameter ranges
            param_scores = []
            
            # N parameter (optimal: 40-80)
            n_val = soil_params.get('N', 60)
            if 40 <= n_val <= 80:
                param_scores.append(90)
            elif 30 <= n_val <= 90:
                param_scores.append(75)
            else:
                param_scores.append(50)
            
            # P parameter (optimal: 30-60) 
            p_val = soil_params.get('P', 45)
            if 30 <= p_val <= 60:
                param_scores.append(90)
            elif 20 <= p_val <= 70:
                param_scores.append(75)
            else:
                param_scores.append(50)
                
            # K parameter (optimal: 40-80)
            k_val = soil_params.get('K', 60)
            if 40 <= k_val <= 80:
                param_scores.append(90)
            elif 30 <= k_val <= 90:
                param_scores.append(75)
            else:
                param_scores.append(50)
                
            # pH parameter (optimal: 6.0-7.5)
            ph_val = soil_params.get('ph', 6.5)
            if 6.0 <= ph_val <= 7.5:
                param_scores.append(95)
            elif 5.5 <= ph_val <= 8.0:
                param_scores.append(80)
            else:
                param_scores.append(60)
                
            # Temperature parameter (crop-specific but generally 20-35°C)
            temp_val = soil_params.get('temperature', 25)
            if 20 <= temp_val <= 30:
                param_scores.append(90)
            elif 15 <= temp_val <= 35:
                param_scores.append(75)
            else:
                param_scores.append(60)
                
            # Calculate average score
            if param_scores:
                suitability_score = sum(param_scores) / len(param_scores)
            else:
                suitability_score = base_score
        
        # Determine if suitable (threshold: 60%)
        is_suitable = suitability_score >= 60.0
        
        # Generate basic parameter analysis
        parameter_analysis = {}
        for param, value in soil_params.items():
            if param in ['N', 'P', 'K']:
                # Nutrient analysis
                if value < 40:
                    status = "low"
                elif value > 80:
                    status = "high" 
                else:
                    status = "optimal"
                    
                parameter_analysis[param] = {
                    "current": f"{value} kg/ha",
                    "optimal": "40-80 kg/ha",
                    "range": "40-80 kg/ha",
                    "status": status
                }
            elif param == 'ph':
                if value < 6.0:
                    status = "acidic"
                elif value > 7.5:
                    status = "alkaline"
                else:
                    status = "optimal"
                    
                parameter_analysis[param] = {
                    "current": f"{value} pH",
                    "optimal": "6.0-7.5 pH",
                    "range": "6.0-7.5 pH", 
                    "status": status
                }
            elif param == 'temperature':
                if value < 20:
                    status = "low"
                elif value > 35:
                    status = "high"
                else:
                    status = "optimal"
                    
                parameter_analysis[param] = {
                    "current": f"{value}°C",
                    "optimal": "20-35°C",
                    "range": "20-35°C",
                    "status": status
                }
        
        return {
            "analysis": {
                "suitability_score": suitability_score,
                "overall_suitability": suitability_score,  # Keep for backward compatibility
                "is_suitable": is_suitable,
                "parameter_analysis": parameter_analysis
            },
            "needs_treatment": not is_suitable
        }
        
    except Exception as e:
        print(f"Error in analyze_crop: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing crop: {str(e)}")

@app.post("/api/analyze-crop-detailed")
async def analyze_crop_detailed(request: CropAnalysisRequest):
    """Get comprehensive crop analysis with improvement plan and cost analysis"""
    try:
        # First get basic analysis
        basic_analysis = await analyze_crop(request)
        
        # Add detailed analysis components
        detailed_result = basic_analysis.copy()
        
        # Update the suitability score key for frontend compatibility
        if "overall_suitability" in detailed_result["analysis"]:
            detailed_result["analysis"]["suitability_score"] = detailed_result["analysis"]["overall_suitability"]
        
        # Generate detailed parameter analysis with recommendations
        soil_params = request.soil_parameters
        parameter_analysis = {}
        
        for param, value in soil_params.items():
            if param == 'N':
                optimal_min, optimal_max = 40, 80
                if optimal_min <= value <= optimal_max:
                    status = "optimal"
                    recommendation = None
                elif value < optimal_min:
                    status = "low"
                    recommendation = f"Apply nitrogen fertilizer to increase N levels by {optimal_min - value} kg/ha"
                else:
                    status = "high"
                    recommendation = f"Reduce nitrogen input by {value - optimal_max} kg/ha to avoid leaching"
                    
                parameter_analysis[param] = {
                    "current": value,
                    "optimal_range": f"{optimal_min}-{optimal_max} kg/ha",
                    "status": status,
                    "recommendation": recommendation
                }
                
            elif param == 'P':
                optimal_min, optimal_max = 30, 60
                if optimal_min <= value <= optimal_max:
                    status = "optimal"
                    recommendation = None
                elif value < optimal_min:
                    status = "low"
                    recommendation = f"Apply phosphatic fertilizer to increase P levels by {optimal_min - value} kg/ha"
                else:
                    status = "high"
                    recommendation = f"Reduce phosphorus input by {value - optimal_max} kg/ha"
                    
                parameter_analysis[param] = {
                    "current": value,
                    "optimal_range": f"{optimal_min}-{optimal_max} kg/ha",
                    "status": status,
                    "recommendation": recommendation
                }
                
            elif param == 'K':
                optimal_min, optimal_max = 40, 80
                if optimal_min <= value <= optimal_max:
                    status = "optimal"
                    recommendation = None
                elif value < optimal_min:
                    status = "low"
                    recommendation = f"Apply potash fertilizer to increase K levels by {optimal_min - value} kg/ha"
                else:
                    status = "high"
                    recommendation = f"Reduce potassium input by {value - optimal_max} kg/ha"
                    
                parameter_analysis[param] = {
                    "current": value,
                    "optimal_range": f"{optimal_min}-{optimal_max} kg/ha",
                    "status": status,
                    "recommendation": recommendation
                }
                
            elif param == 'ph':
                optimal_min, optimal_max = 6.0, 7.5
                if optimal_min <= value <= optimal_max:
                    status = "optimal"
                    recommendation = None
                elif value < optimal_min:
                    status = "acidic"
                    recommendation = f"Apply lime to increase pH by {optimal_min - value:.1f} units"
                else:
                    status = "alkaline"
                    recommendation = f"Apply sulfur to decrease pH by {value - optimal_max:.1f} units"
                    
                parameter_analysis[param] = {
                    "current": value,
                    "optimal_range": f"{optimal_min}-{optimal_max}",
                    "status": status,
                    "recommendation": recommendation
                }
                
            elif param == 'temperature':
                optimal_min, optimal_max = 20, 30
                if optimal_min <= value <= optimal_max:
                    status = "optimal"
                    recommendation = None
                elif value < optimal_min:
                    status = "low"
                    recommendation = "Consider greenhouse cultivation or seasonal timing adjustment"
                else:
                    status = "high"
                    recommendation = "Provide shade or cooling systems during hot periods"
                    
                parameter_analysis[param] = {
                    "current": value,
                    "optimal_range": f"{optimal_min}-{optimal_max}°C",
                    "status": status,
                    "recommendation": recommendation
                }
                
            elif param == 'humidity':
                optimal_min, optimal_max = 50, 80
                if optimal_min <= value <= optimal_max:
                    status = "optimal"
                    recommendation = None
                elif value < optimal_min:
                    status = "low"
                    recommendation = "Increase irrigation frequency to maintain soil moisture"
                else:
                    status = "high" 
                    recommendation = "Improve drainage and air circulation to reduce humidity"
                    
                parameter_analysis[param] = {
                    "current": value,
                    "optimal_range": f"{optimal_min}-{optimal_max}%",
                    "status": status,
                    "recommendation": recommendation
                }
                
            elif param == 'rainfall':
                optimal_min, optimal_max = 50, 200
                if optimal_min <= value <= optimal_max:
                    status = "optimal"
                    recommendation = None
                elif value < optimal_min:
                    status = "low"
                    recommendation = "Install irrigation system to supplement rainfall"
                else:
                    status = "high"
                    recommendation = "Ensure proper drainage to prevent waterlogging"
                    
                parameter_analysis[param] = {
                    "current": value,
                    "optimal_range": f"{optimal_min}-{optimal_max}mm",
                    "status": status,
                    "recommendation": recommendation
                }
        
        # Update parameter analysis in result
        detailed_result["analysis"]["parameter_analysis"] = parameter_analysis
        
        # Generate structured improvement plan
        improvements = []
        needs_improvement = False
        
        for param, analysis in parameter_analysis.items():
            if analysis["status"] != "optimal" and analysis["recommendation"]:
                needs_improvement = True
                priority = "High" if analysis["status"] in ["low", "high"] else "Medium"
                
                improvement = {
                    "parameter": param.upper(),
                    "issue": f"Current level: {analysis['current']} (status: {analysis['status']})",
                    "solution": analysis["recommendation"],
                    "priority": priority
                }
                improvements.append(improvement)
        
        if needs_improvement:
            detailed_result["improvement_plan"] = {
                "improvements": improvements,
                "summary": f"Found {len(improvements)} parameters that need adjustment for optimal {request.selected_crop} cultivation."
            }
        else:
            detailed_result["improvement_plan"] = {
                "message": f"Excellent! Your soil conditions are already optimal for {request.selected_crop} cultivation."
            }
        
        # Generate structured cost analysis
        farm_size = request.farm_size_hectares
        cost_breakdown = []
        total_cost = 0
        
        if needs_improvement:
            # Calculate costs based on needed improvements
            for improvement in improvements:
                param = improvement["parameter"].lower()
                if param in ['n', 'p', 'k']:
                    cost = 8000 * farm_size  # Fertilizer cost per hectare
                    cost_breakdown.append({
                        "item": f"{param.upper()} Fertilizer",
                        "cost": cost
                    })
                    total_cost += cost
                elif param == 'ph':
                    cost = 4000 * farm_size  # pH correction cost per hectare
                    cost_breakdown.append({
                        "item": "pH Correction (Lime/Sulfur)",
                        "cost": cost
                    })
                    total_cost += cost
            
            # Add base costs
            base_costs = [
                {"item": "Seeds", "cost": 3000 * farm_size},
                {"item": "Labor", "cost": 5000 * farm_size},
                {"item": "Equipment/Tools", "cost": 2000 * farm_size}
            ]
            
            for cost_item in base_costs:
                cost_breakdown.append(cost_item)
                total_cost += cost_item["cost"]
                
            detailed_result["cost_analysis"] = {
                "breakdown": cost_breakdown,
                "total_cost": total_cost,
                "farm_size_hectares": farm_size,
                "cost_per_hectare": total_cost / farm_size if farm_size > 0 else 0
            }
        else:
            # Minimal maintenance costs for optimal conditions
            maintenance_costs = [
                {"item": "Seeds", "cost": 3000 * farm_size},
                {"item": "Maintenance Fertilizer", "cost": 4000 * farm_size},
                {"item": "Labor", "cost": 4000 * farm_size},
                {"item": "Equipment/Tools", "cost": 1500 * farm_size}
            ]
            
            for cost_item in maintenance_costs:
                cost_breakdown.append(cost_item)
                total_cost += cost_item["cost"]
                
            detailed_result["cost_analysis"] = {
                "breakdown": cost_breakdown,
                "total_cost": total_cost,
                "farm_size_hectares": farm_size,
                "cost_per_hectare": total_cost / farm_size if farm_size > 0 else 0,
                "message": f"Minimal investment required - your soil is already optimal for {request.selected_crop}!"
            }
        
        return detailed_result
        
    except Exception as e:
        print(f"Error in analyze_crop_detailed: {e}")
        raise HTTPException(status_code=500, detail=f"Error in detailed analysis: {str(e)}")

@app.get("/api/soil-weather-data/{latitude}/{longitude}")
async def get_soil_weather_data(latitude: float, longitude: float):
    """Get combined soil and weather data for location-based form auto-fill"""
    try:
        # Fetch soil and weather data concurrently
        soil_task = soil_service.get_soil_data(latitude, longitude)
        weather_task = weather_service.get_weather_forecast(latitude, longitude, 1)
        location_task = geo_service.get_location_info(latitude, longitude)
        
        soil_data, weather_data, location_info = await asyncio.gather(
            soil_task, weather_task, location_task
        )
        
        # Check if weather data is fallback data (indicating API failure)
        # If we got fallback data, use location-based fallback instead
        if weather_data and len(weather_data) > 0:
            first_weather = weather_data[0]
            # Check if this looks like generic fallback data
            if (first_weather.get("rainfall") == 2.0 and 
                first_weather.get("temperature_max") == 28.0 and 
                first_weather.get("temperature_min") == 18.0):
                # Replace with location-based fallback
                weather_data = weather_service._get_location_based_fallback_weather(latitude, longitude, 1)
        
        # Extract current weather values
        current_weather = weather_data[0] if weather_data else {}
        
        # Calculate average temperature from max and min
        avg_temp = 25.0
        if current_weather.get("temperature_max") is not None and current_weather.get("temperature_min") is not None:
            avg_temp = (current_weather.get("temperature_max") + current_weather.get("temperature_min")) / 2
        
        # Get total rainfall - for a single day this is the same as the daily rainfall
        rainfall = current_weather.get("rainfall", 100.0)
        
        # Ensure we have the correct pH value (both ph and ph_level should be the same)
        ph_value = soil_data.get("ph_level", soil_data.get("ph", 6.5))
        
        # Debug: Print weather and soil data
        print(f"Weather data received: rainfall={current_weather.get('rainfall')}, temp_max={current_weather.get('temperature_max')}, temp_min={current_weather.get('temperature_min')}")
        print(f"Soil data received: pH={soil_data.get('ph')}, pH_level={soil_data.get('ph_level')}")
        print(f"Final values: pH={ph_value}, rainfall={rainfall}")
        
        # Combine data for form auto-fill
        form_data = {
            "nitrogen": soil_data.get("nitrogen", 80.0),
            "phosphorus": soil_data.get("phosphorus", 45.0),
            "potassium": soil_data.get("potassium", 180.0),
            "ph": ph_value,
            "ph_level": ph_value,  # Include both for consistency
            "rainfall": rainfall,
            "temperature": round(avg_temp, 1),
            "humidity": current_weather.get("humidity", 70.0),
            "location_info": location_info,
            "soil_details": {
                "clay_content": soil_data.get("clay_content", 25.0),
                "sand_content": soil_data.get("sand_content", 45.0),
                "silt_content": soil_data.get("silt_content", 30.0),
                "organic_carbon": soil_data.get("organic_carbon", 2.5),
                "soil_type": soil_data.get("soil_type", "Loam")
            }
        }
        
        return {"success": True, "data": form_data}
        
    except Exception as e:
        print(f"Error in soil-weather-data endpoint: {e}")
        # Return location-specific fallback data
        fallback_soil = SoilGridsService._get_location_based_fallback(latitude, longitude)
        fallback_weather = WeatherService._get_fallback_weather_data()
        
        # Get location-based fallback weather instead of generic fallback
        fallback_weather = WeatherService._get_location_based_fallback_weather(latitude, longitude, 1)
        current_weather = fallback_weather[0] if fallback_weather else {}
        
        # Calculate average temperature from max and min
        avg_temp = 25.0
        if current_weather.get("temperature_max") is not None and current_weather.get("temperature_min") is not None:
            avg_temp = (current_weather.get("temperature_max") + current_weather.get("temperature_min")) / 2
            
        # Get pH value
        ph_value = fallback_soil.get("ph_level", fallback_soil.get("ph", 6.5))
        
        # Debug: Print fallback soil data to check pH value
        print(f"Fallback soil data: pH={fallback_soil.get('ph')}, pH_level={fallback_soil.get('ph_level')}")
        print(f"Final fallback pH value: {ph_value}")
            
        form_data = {
            "nitrogen": fallback_soil.get("nitrogen", 80.0),
            "phosphorus": fallback_soil.get("phosphorus", 45.0),
            "potassium": fallback_soil.get("potassium", 180.0),
            "ph": ph_value,
            "ph_level": ph_value,  # Include both for consistency
            "rainfall": current_weather.get("rainfall", 100.0),
            "temperature": round(avg_temp, 1),
            "humidity": current_weather.get("humidity", 70.0),
            "location_info": {
                "display_name": f"Location {latitude:.2f}, {longitude:.2f}",
                "city": "Unknown City",
                "state": "Unknown State",
                "country": "Unknown Country"
            },
            "soil_details": {
                "clay_content": fallback_soil.get("clay_content", 25.0),
                "sand_content": fallback_soil.get("sand_content", 45.0),
                "silt_content": fallback_soil.get("silt_content", 30.0),
                "organic_carbon": fallback_soil.get("organic_carbon", 2.5),
                "soil_type": fallback_soil.get("soil_type", "Loam")
            }
        }
        
        return {"success": False, "data": form_data, "message": "Using estimated data"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
