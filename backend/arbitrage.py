import pandas as pd
from model import df_districts

# Hardcoded distance map (km)
# Key: tuple(sorted(district1, district2)) -> Value: distance in km

# Hardcoded distance map (km)
# Key: tuple(sorted(district1, district2)) -> Value: distance in km
DISTANCE_MAP = {
    tuple(sorted(("Warangal", "Karimnagar"))): 70,
    tuple(sorted(("Warangal", "Nalgonda"))): 110,
    tuple(sorted(("Warangal", "Adilabad"))): 200,
    tuple(sorted(("Adilabad", "Karimnagar"))): 170,
}

DEFAULT_DISTANCE = 150  # Fallback distance if not found
TRANSPORT_RATE_PER_KM = 8

def get_distance(d1, d2):
    if d1 == d2:
        return 0
    key = tuple(sorted((d1, d2)))
    return DISTANCE_MAP.get(key, DEFAULT_DISTANCE)

def find_best_arbitrage(crop, user_district):
    """
    Finds the best districts to sell the crop based on price difference and transport cost.
    """
    if df_districts.empty:
        raise ValueError("Dataset not loaded")

    # Filter for the specific crop
    crop_data = df_districts[df_districts["Crop"].str.lower() == crop.lower()]
    
    if crop_data.empty:
        raise ValueError(f"No data found for crop: {crop}")

    # Get user district price
    user_price_row = crop_data[crop_data["District"].str.lower() == user_district.lower()]
    
    if user_price_row.empty:
        # If user district not found for this crop, we can't compare.
        raise ValueError(f"No price data for {crop} in {user_district}")
    
    user_price = float(user_price_row.iloc[0]["Price"])
    
    results = []
    
    for _, row in crop_data.iterrows():
        target_district = row["District"]
        target_price = float(row["Price"])
        
        if target_district.lower() == user_district.lower():
            continue
            
        distance = get_distance(user_district, target_district)
        transport_cost = distance * TRANSPORT_RATE_PER_KM
        
        price_diff = target_price - user_price
        net_gain = price_diff - transport_cost
        
        results.append({
            "district": target_district,
            "price": target_price,
            "price_diff": price_diff,
            "distance": distance,
            "transport_cost": transport_cost,
            "net_gain": net_gain
        })
        
    # Sort by Net Gain (descending)
    results.sort(key=lambda x: x["net_gain"], reverse=True)
    
    # Return top 3
    return {
        "user_district": user_district,
        "user_price": user_price,
        "opportunities": results[:3]
    }
