import pandas as pd
import numpy as np
from model import df_districts

def calculate_risk_score(crop):
    """
    Calculates risk score based on price volatility (Standard Deviation).
    Low volatility -> Higher Risk Score (Stable income is better? Or is it High Volatility -> High Risk?)
    Requirement says: "Low volatility -> higher risk score." 
    Wait, usually Low Volatility means Low Risk.
    Let's re-read: "Low volatility -> higher risk score."
    This implies Stability = Good Credit Score. 
    So if StdDev is LOW, Score should be HIGH.
    """
    if df_districts.empty:
        return 500 # Default neutral score
        
    crop_data = df_districts[df_districts["Crop"].str.lower() == crop.lower()]
    
    if len(crop_data) < 2:
        return 500 # Not enough data
        
    std_dev = crop_data["Price"].std()
    mean_price = crop_data["Price"].mean()
    
    if mean_price == 0:
        return 500
        
    cv = std_dev / mean_price # Coefficient of Variation
    
    # Map CV to 0-1000 score. 
    # Lower CV (more stable) -> Higher Score.
    # Example: CV 0.0 (Perfectly stable) -> 1000
    # CV 0.5 (Very volatile) -> 0
    
    # Let's use a simple linear mapping or inverse
    # score = 1000 * (1 - CV)
    # Clamped between 0 and 1000
    
    score = 1000 * (1 - cv)
    return max(0, min(1000, score))

def calculate_credit_score(income, expense, crop):
    """
    Calculates credit score (0-1000).
    """
    if expense == 0:
        raise ValueError("Expense cannot be zero")
        
    # 1. Profitability Score (40%)
    profit_margin = (income - expense) / expense
    # If profit_margin > 0.5 -> High Score (1000)
    # Let's scale it: 0.0 -> 0, 0.5 -> 1000
    profitability_score = (profit_margin / 0.5) * 1000
    profitability_score = max(0, min(1000, profitability_score))
    
    # 2. Cost Efficiency Score (30%)
    # efficiency = income / expense
    # If income = expense (eff=1) -> Neutral?
    # Usually Efficiency > 1.5 is good.
    # Let's say Efficiency 2.0 -> 1000
    efficiency = income / expense
    efficiency_score = (efficiency / 2.0) * 1000
    efficiency_score = max(0, min(1000, efficiency_score))
    
    # 3. Risk Score (30%)
    risk_score = calculate_risk_score(crop)
    
    # Final Formula
    final_score = (profitability_score * 0.4) + (efficiency_score * 0.3) + (risk_score * 0.3)
    final_score = int(final_score)
    
    # Category
    if final_score >= 750:
        category = "Gold Tier (Low Interest Loan Eligible)"
        color = "green"
    elif final_score >= 500:
        category = "Silver Tier (Moderate Risk)"
        color = "yellow" # or gold/orange
    else:
        category = "High Risk Farmer"
        color = "red"
        
    return {
        "score": final_score,
        "category": category,
        "color": color,
        "breakdown": {
            "profitability_score": int(profitability_score),
            "efficiency_score": int(efficiency_score),
            "risk_score": int(risk_score)
        }
    }
