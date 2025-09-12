from typing import Dict, List
import random
from datetime import datetime, timedelta

class MarketAnalysisService:
    """Service for market analysis and price trends"""
    
    def __init__(self):
        # Simulated market data - In production, this would come from real market APIs
        self.base_prices = {
            'rice': 2500, 'maize': 2000, 'chickpea': 5000, 'kidneybeans': 4800,
            'pigeonpeas': 4500, 'mothbeans': 4000, 'mungbean': 5200, 'blackgram': 5100,
            'lentil': 4900, 'pomegranate': 8000, 'banana': 1500, 'mango': 3000,
            'grapes': 4000, 'watermelon': 1200, 'muskmelon': 1500, 'apple': 6000,
            'orange': 2500, 'papaya': 1800, 'coconut': 3500, 'cotton': 6000,
            'jute': 3000, 'coffee': 15000
        }
        
        self.seasonal_factors = {
            'rice': {'kharif': 1.1, 'rabi': 0.9, 'summer': 1.0},
            'maize': {'kharif': 1.0, 'rabi': 1.1, 'summer': 0.9},
            'chickpea': {'kharif': 0.8, 'rabi': 1.2, 'summer': 1.0},
            'watermelon': {'kharif': 0.9, 'rabi': 0.8, 'summer': 1.3}
        }
    
    def get_market_analysis(self, crops: List[str]) -> List[Dict]:
        """Generate market analysis for given crops"""
        analyses = []
        
        for crop in crops:
            if crop in self.base_prices:
                base_price = self.base_prices[crop]
                
                # Simulate price variation (±15%)
                price_variation = random.uniform(-0.15, 0.15)
                current_price = base_price * (1 + price_variation)
                
                # Determine trend
                if price_variation > 0.05:
                    trend = "rising"
                elif price_variation < -0.05:
                    trend = "falling"
                else:
                    trend = "stable"
                
                # Simulate demand level
                demand_levels = ["high", "medium", "low"]
                demand_weights = [0.3, 0.5, 0.2] if trend == "rising" else [0.2, 0.5, 0.3]
                demand_level = random.choices(demand_levels, weights=demand_weights)[0]
                
                # Calculate profit potential (simplified)
                if trend == "rising" and demand_level == "high":
                    profit_potential = 1.2
                elif trend == "falling" and demand_level == "low":
                    profit_potential = 0.8
                else:
                    profit_potential = 1.0
                
                analysis = {
                    "crop": crop,
                    "current_price": round(current_price, 2),
                    "price_trend": trend,
                    "demand_level": demand_level,
                    "profit_potential": profit_potential
                }
                
                analyses.append(analysis)
        
        return analyses
    
    def get_seasonal_price_forecast(self, crop: str, season: str) -> float:
        """Get seasonal price adjustment factor"""
        if crop in self.seasonal_factors:
            return self.seasonal_factors[crop].get(season.lower(), 1.0)
        return 1.0
    
    def simulate_market_trends(self, days: int = 30) -> Dict[str, List[float]]:
        """Simulate market price trends for visualization"""
        trends = {}
        
        major_crops = ['rice', 'maize', 'chickpea', 'cotton', 'mango']
        
        for crop in major_crops:
            base_price = self.base_prices.get(crop, 1000)
            prices = [base_price]
            
            for day in range(days - 1):
                # Simulate daily price change
                daily_change = random.uniform(-0.02, 0.02)  # ±2% daily change
                new_price = prices[-1] * (1 + daily_change)
                prices.append(new_price)
            
            trends[crop] = prices
        
        return trends
