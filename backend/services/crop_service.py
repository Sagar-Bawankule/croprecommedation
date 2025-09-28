import pandas as pd
import numpy as np
import pickle
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import json
import os
from models.schemas import OptimalRange

class CropRecommendationService:
    """Enhanced crop recommendation service with soil treatment and rotation planning"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.economic_df = None
        self.load_models()
        self.create_enhanced_economic_dataset()
        
    def load_models(self):
        """Load trained ML models"""
        try:
            import os
            # Get the path to the backend directory
            backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            print(f"Loading models from: {backend_dir}")
            
            with open(os.path.join(backend_dir, 'randomforest_model.pkl'), 'rb') as f:
                self.model = pickle.load(f)
            with open(os.path.join(backend_dir, 'scaler.pkl'), 'rb') as f:
                self.scaler = pickle.load(f)
            with open(os.path.join(backend_dir, 'label_encoder.pkl'), 'rb') as f:
                self.label_encoder = pickle.load(f)
            print("Models loaded successfully")
        except FileNotFoundError as e:
            print(f"Model files not found: {e}")
            # You might want to raise an exception or handle this differently
    
    def create_enhanced_economic_dataset(self):
        """Create enhanced economic dataset with additional crop information"""
        data = {
            'Crop': ['rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans',
                     'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango',
                     'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya',
                     'coconut', 'cotton', 'jute', 'coffee'],
            'Cost_of_Cultivation_per_Hectare': [
                32000, 22000, 18000, 20000, 21000, 17000, 18500, 19000, 17500, 60000,
                75000, 80000, 150000, 25000, 26000, 180000, 70000, 55000, 90000, 24500,
                23000, 120000
            ],
            'Avg_Yield_per_Hectare': [
                6.0, 5.5, 1.5, 1.8, 2.0, 1.2, 1.4, 1.3, 1.1, 15.0, 50.0, 12.0, 20.0,
                30.0, 28.0, 25.0, 22.0, 40.0, 10.0, 2.5, 2.2, 1.0
            ],
            'Avg_Market_Price_per_Quintal': [
                2500, 2000, 5000, 4800, 4500, 4000, 5200, 5100, 4900, 8000, 1500,
                3000, 4000, 1200, 1500, 6000, 2500, 1800, 3500, 6000, 3000, 15000
            ],
            'Crop_Type': [
                'cereal', 'cereal', 'legume', 'legume', 'legume', 'legume',
                'legume', 'legume', 'legume', 'fruit', 'fruit', 'fruit',
                'fruit', 'fruit', 'fruit', 'fruit', 'fruit', 'fruit',
                'fruit', 'fiber', 'fiber', 'beverage'
            ],
            'Growing_Season': [
                'Kharif', 'Kharif', 'Rabi', 'Kharif', 'Kharif', 'Kharif',
                'Kharif', 'Kharif', 'Rabi', 'Year-round', 'Year-round', 'Year-round',
                'Year-round', 'Summer', 'Summer', 'Year-round', 'Year-round', 'Year-round',
                'Year-round', 'Kharif', 'Kharif', 'Year-round'
            ],
            'Water_Requirement': [
                'High', 'Medium', 'Low', 'Medium', 'Low', 'Low',
                'Low', 'Low', 'Low', 'Medium', 'High', 'Medium',
                'Medium', 'Medium', 'Medium', 'Medium', 'Medium', 'Medium',
                'High', 'Medium', 'High', 'High'
            ]
        }
        self.economic_df = pd.DataFrame(data).set_index('Crop')
    
    def get_crop_recommendations(self, soil_params: Dict, budget: float) -> List[Dict]:
        """Get crop recommendations with profitability analysis"""
        if not self.model:
            print("Error: Model not loaded. Check if model files exist and are accessible.")
            return []
        
        try:
            print(f"Generating crop recommendations for parameters: {soil_params}, budget: {budget}")
            
            # Convert inputs to DataFrame and scale
            input_df = pd.DataFrame([soil_params])
            print(f"Input dataframe shape: {input_df.shape}, columns: {input_df.columns.tolist()}")
            
            # Ensure the input dataframe has the correct columns in the correct order
            expected_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
            input_df = pd.DataFrame([{col: soil_params.get(col, 0) for col in expected_columns}])
            
            input_scaled = self.scaler.transform(input_df)
            print(f"Scaled input shape: {input_scaled.shape}")
            
            # Get probabilities for all crops
            probabilities = self.model.predict_proba(input_scaled)
            print(f"Prediction probabilities shape: {probabilities.shape}")
            
            # Get top 5 crops instead of 3 for better variety
            top_indices = np.argsort(probabilities)[0][-5:][::-1]
            top_crops = self.label_encoder.inverse_transform(top_indices)
            top_probs = probabilities[0][top_indices]
            
            print(f"Top 5 crops: {top_crops}")
        except Exception as e:
            print(f"Error generating crop recommendations: {e}")
            return []
        
        recommendations = []
        
        for crop, prob in zip(top_crops, top_probs):
            if crop in self.economic_df.index:
                crop_data = self.economic_df.loc[crop]
                cost = crop_data['Cost_of_Cultivation_per_Hectare']
                yield_val = crop_data['Avg_Yield_per_Hectare']
                price = crop_data['Avg_Market_Price_per_Quintal']
                
                # Calculate profit
                revenue = yield_val * price * 10  # 1 tonne = 10 quintals
                profit = revenue - cost
                profit_margin = (profit / revenue * 100) if revenue > 0 else 0
                
                status = "Recommended" if cost <= budget else f"Over Budget (₹{cost-budget:,.0f})"
                
                recommendation = {
                    "crop": crop,
                    "agronomic_score": f"{prob:.2%}",
                    "estimated_cost": f"₹{cost:,.0f}",
                    "estimated_profit": f"₹{profit:,.0f}" if cost <= budget else "N/A",
                    "profit_margin": profit_margin if cost <= budget else 0,
                    "status": status,
                    "growing_season": crop_data['Growing_Season'],
                    "water_requirement": crop_data['Water_Requirement']
                }
                recommendations.append(recommendation)
        
        # Sort by profit margin for recommended crops
        recommended = [r for r in recommendations if r['status'] == 'Recommended']
        not_recommended = [r for r in recommendations if r['status'] != 'Recommended']
        
        recommended.sort(key=lambda x: x['profit_margin'], reverse=True)
        
        return recommended + not_recommended
    
    def analyze_soil_treatment(self, soil_params: Dict) -> List[Dict]:
        """Analyze soil parameters and suggest treatments"""
        treatments = []
        
        # Optimal ranges for different parameters
        optimal_ranges = {
            'N': {'min': 40, 'max': 80, 'unit': 'kg/ha'},
            'P': {'min': 30, 'max': 60, 'unit': 'kg/ha'},
            'K': {'min': 40, 'max': 80, 'unit': 'kg/ha'},
            'ph': {'min': 6.0, 'max': 7.5, 'unit': 'pH'},
            'humidity': {'min': 40, 'max': 70, 'unit': '%'},
            'temperature': {'min': 20, 'max': 30, 'unit': '°C'}
        }
        
        # Treatment suggestions
        treatment_suggestions = {
            'N': {
                'low': {'treatment': 'Apply nitrogen-rich fertilizer', 'fertilizer': 'Urea (46-0-0) at 100-150 kg/ha'},
                'high': {'treatment': 'Reduce nitrogen application', 'fertilizer': 'Skip nitrogen fertilizer this season'}
            },
            'P': {
                'low': {'treatment': 'Apply phosphorus fertilizer', 'fertilizer': 'DAP (18-46-0) at 100-125 kg/ha'},
                'high': {'treatment': 'Reduce phosphorus application', 'fertilizer': 'Use low-P fertilizers'}
            },
            'K': {
                'low': {'treatment': 'Apply potassium fertilizer', 'fertilizer': 'MOP (0-0-60) at 80-100 kg/ha'},
                'high': {'treatment': 'Reduce potassium application', 'fertilizer': 'Use balanced NPK fertilizers'}
            },
            'ph': {
                'low': {'treatment': 'Apply lime to increase pH', 'fertilizer': 'Agricultural lime at 500-1000 kg/ha'},
                'high': {'treatment': 'Apply sulfur to decrease pH', 'fertilizer': 'Elemental sulfur at 100-200 kg/ha'}
            }
        }
        
        for param, value in soil_params.items():
            if param in optimal_ranges:
                optimal = optimal_ranges[param]
                
                if value < optimal['min']:
                    suggestion = treatment_suggestions[param]['low']
                    treatments.append({
                        'parameter': param.upper(),
                        'current_value': value,
                        'optimal_range': OptimalRange(
                            min=optimal['min'],
                            max=optimal['max'],
                            unit=optimal['unit']
                        ),
                        'treatment_suggestion': suggestion['treatment'],
                        'fertilizer_recommendation': suggestion['fertilizer']
                    })
                elif value > optimal['max'] and param in ['N', 'P', 'K', 'ph']:
                    suggestion = treatment_suggestions[param]['high']
                    treatments.append({
                        'parameter': param.upper(),
                        'current_value': value,
                        'optimal_range': OptimalRange(
                            min=optimal['min'],
                            max=optimal['max'],
                            unit=optimal['unit']
                        ),
                        'treatment_suggestion': suggestion['treatment'],
                        'fertilizer_recommendation': suggestion['fertilizer']
                    })
        
        return treatments
    
    def generate_rotation_plan(self, primary_crop: str, location_climate: str = "temperate") -> List[Dict]:
        """Generate 3-year crop rotation plan"""
        if not primary_crop or primary_crop not in self.economic_df.index:
            return []
        
        crop_type = self.economic_df.loc[primary_crop, 'Crop_Type']
        rotation_plans = []
        
        # Define rotation sequences based on agronomy principles
        rotation_sequences = {
            'cereal': ['legume', 'vegetable', 'cereal'],
            'legume': ['cereal', 'fruit', 'legume'],
            'fruit': ['legume', 'cereal', 'fruit'],
            'fiber': ['legume', 'cereal', 'fiber'],
            'beverage': ['legume', 'vegetable', 'beverage']
        }
        
        # Crop suggestions by type
        crop_by_type = {
            'cereal': ['rice', 'maize'],
            'legume': ['chickpea', 'lentil', 'mungbean', 'blackgram'],
            'vegetable': ['watermelon', 'muskmelon', 'papaya'],
            'fruit': ['banana', 'mango', 'grapes', 'orange'],
            'fiber': ['cotton', 'jute'],
            'beverage': ['coffee']
        }
        
        sequence = rotation_sequences.get(crop_type, ['legume', 'cereal', 'fruit'])
        
        for year, next_type in enumerate(sequence, 1):
            # Select best crop from the type based on profitability
            available_crops = crop_by_type.get(next_type, ['rice'])
            
            # If first year, use the recommended crop
            if year == 1:
                selected_crop = primary_crop
                selected_type = crop_type
            else:
                # Select most profitable crop from the rotation type
                best_crop = available_crops[0]  # Default
                best_profit = 0
                
                for crop in available_crops:
                    if crop in self.economic_df.index:
                        crop_data = self.economic_df.loc[crop]
                        cost = crop_data['Cost_of_Cultivation_per_Hectare']
                        yield_val = crop_data['Avg_Yield_per_Hectare']
                        price = crop_data['Avg_Market_Price_per_Quintal']
                        profit = (yield_val * price * 10) - cost
                        
                        if profit > best_profit:
                            best_profit = profit
                            best_crop = crop
                
                selected_crop = best_crop
                selected_type = next_type
            
            # Define benefits of each crop type in rotation
            benefits_map = {
                'cereal': ['Provides staple grain', 'Good market demand', 'Moderate water requirement'],
                'legume': ['Nitrogen fixation', 'Soil fertility improvement', 'Low water requirement'],
                'fruit': ['High market value', 'Long-term investment', 'Orchard development'],
                'vegetable': ['Quick returns', 'High nutrition value', 'Market flexibility'],
                'fiber': ['Industrial demand', 'Good export potential', 'Drought tolerance'],
                'beverage': ['Premium pricing', 'Export opportunity', 'Sustainable farming']
            }
            
            if selected_crop in self.economic_df.index:
                crop_data = self.economic_df.loc[selected_crop]
                cost = crop_data['Cost_of_Cultivation_per_Hectare']
                yield_val = crop_data['Avg_Yield_per_Hectare']
                price = crop_data['Avg_Market_Price_per_Quintal']
                estimated_profit = (yield_val * price * 10) - cost
            else:
                estimated_profit = 0
            
            rotation_plan = {
                'year': year,
                'season': 'Kharif' if year % 2 == 1 else 'Rabi',
                'recommended_crop': selected_crop,
                'crop_type': selected_type,
                'benefits': benefits_map.get(selected_type, ['Crop diversification']),
                'estimated_profit': max(0, estimated_profit)
            }
            
            rotation_plans.append(rotation_plan)
        
        return rotation_plans
    
    def generate_crop_advisory(self, weather_forecast: List[Dict], soil_data: Dict) -> Dict:
        """Generate crop advisory based on weather and soil conditions"""
        
        # Analyze weather conditions
        avg_temp = np.mean([w['temperature_max'] for w in weather_forecast[:3]])
        total_rainfall = sum([w['rainfall'] for w in weather_forecast[:7]])
        avg_humidity = np.mean([w['humidity'] for w in weather_forecast[:3]])
        
        advisory = {}
        
        # Weather alerts
        if avg_temp > 35:
            advisory['weather_alert'] = "High temperature warning - Consider heat-resistant crops"
        elif avg_temp < 15:
            advisory['weather_alert'] = "Low temperature warning - Protect crops from cold"
        elif total_rainfall > 100:
            advisory['weather_alert'] = "Heavy rainfall expected - Ensure proper drainage"
        elif total_rainfall < 10:
            advisory['weather_alert'] = "Low rainfall forecast - Plan irrigation"
        
        # Planting recommendations
        if 20 <= avg_temp <= 30 and 20 <= total_rainfall <= 60:
            advisory['planting_recommendation'] = "Excellent conditions for planting"
        elif avg_temp > 30:
            advisory['planting_recommendation'] = "Consider drought-resistant varieties"
        else:
            advisory['planting_recommendation'] = "Monitor weather before planting"
        
        # Irrigation advice
        if total_rainfall < 20:
            advisory['irrigation_advice'] = "Increase irrigation frequency - weekly watering recommended"
        elif total_rainfall > 80:
            advisory['irrigation_advice'] = "Reduce irrigation - risk of waterlogging"
        else:
            advisory['irrigation_advice'] = "Normal irrigation schedule - bi-weekly watering"
        
        # Pest warnings (based on humidity and temperature)
        if avg_humidity > 70 and avg_temp > 25:
            advisory['pest_warning'] = "High risk of fungal diseases - apply preventive fungicides"
        elif avg_humidity < 40:
            advisory['pest_warning'] = "Watch for spider mites - monitor regularly"
        
        # Harvest timing
        advisory['harvest_timing'] = "Monitor crop maturity - harvest during dry weather for better quality"
        
        return advisory
