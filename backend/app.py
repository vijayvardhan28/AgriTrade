# # # main.py
# # from fastapi import FastAPI, HTTPException
# # from pydantic import BaseModel
# # from model import calculate_financials
# # from fastapi.middleware.cors import CORSMiddleware

# # app = FastAPI()

# # # Allow CORS for frontend


# # class FinancialRequest(BaseModel):
# #     district: str
# #     crop: str
# #     season: str
# #     acres: int
# #     start_date: str  # frontend sends date string

# # @app.post("/financial-summary")
# # def financial_summary(request: FinancialRequest):
# #     try:
# #         result = calculate_financials(
# #             district=request.district,
# #             crop=request.crop,
# #             season=request.season,
# #             acres=request.acres,
# #             start_date=request.start_date
# #         )
# #         return result
# #     except Exception as e:
# #         raise HTTPException(status_code=400, detail=str(e))
# import numpy as np
# from fastapi import FastAPI
# from pydantic import BaseModel

# app = FastAPI()

# class InputData(BaseModel):
#     district: str
#     crop: str
#     season: str
#     date: str

# @app.post("/financial-summary")
# def financial_summary(data: InputData):
#     # Suppose your model or code returns a numpy.int64
#     revenue = np.int64(5000)  # Just example
#     cost = np.int64(2000)
#     profit = revenue - cost

#     # Convert numpy values to regular Python int
#     return {
#         "revenue": int(revenue),
#         "cost": int(cost),
#         "profit": int(profit)
#     }

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# import pandas as pd

# app = FastAPI()

# # Allow CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Load the CSVs
# districts_df = pd.read_csv("./datasets/DISTRTICTS_DATASET final.csv")
# crops_df = pd.read_csv("./datasets/Cropcost.csv")

# @app.get("/options")
# def get_options():
#     districts = sorted(districts_df['District'].unique())
#     crops = sorted(crops_df['Crop'].unique())
#     seasons = sorted(crops_df['Season'].unique())
#     return {
#         "districts": districts,
#         "crops": crops,
#         "seasons": seasons
#     }
# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from model import calculate_financials, df_districts, df_crop
from ml_pipeline import run_full_pipeline
from arbitrage import find_best_arbitrage
from credit_score import calculate_credit_score

app = Flask(__name__)
CORS(app)

# -----------------------
# BASIC OPTION ROUTES
# -----------------------
@app.route('/districts', methods=['GET'])
def get_districts():
    districts = df_districts['District'].unique().tolist()
    return jsonify(sorted(districts))

@app.route('/crops', methods=['GET'])
def get_crops():
    crops = df_districts['Crop'].unique().tolist()
    return jsonify(sorted(crops))

@app.route('/seasons', methods=['GET'])
def get_seasons():
    seasons = df_crop['Season'].unique().tolist()
    return jsonify(sorted(seasons))


# -----------------------
# DYNAMIC ML PREDICTION
# -----------------------
@app.route("/predict-latest", methods=["GET"])
def predict_latest():
    try:
        crop = request.args.get("crop", "Paddy")
        district = request.args.get("district", "Warangal")

        print(f"ML REQUEST FOR: Crop={crop}, District={district}")

        forecast = run_full_pipeline(crop_name=crop, district_name=district)
        return forecast.to_json(orient="records")

    except Exception as e:
        return {"error": str(e)}, 400


# -----------------------
# LATEST PRICE SCRAPER
# -----------------------
@app.route('/update-latest-prices', methods=['GET'])
def update_latest_prices():
    try:
        import pandas as pd
        from datetime import datetime, timedelta

        url = "https://datamandi.com/Telangana/paddy-price"
        tables = pd.read_html(url)

        if len(tables) == 0:
            return {"error": "No tables found on DataMandi"}, 500

        df = tables[0]
        df.columns = [col.replace(" ", "_") for col in df.columns]

        df["Date"] = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

        # Fix modal price naming
        if "Modal_Price" not in df.columns:
            for col in df.columns:
                if "Modal" in col or "modal" in col:
                    df.rename(columns={col: "Modal_Price"}, inplace=True)

        df["Commodity"] = "Paddy"
        df["District"] = df["Market"]

        import os
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        df.to_csv(os.path.join(BASE_DIR, "datasets", "latest_prices.csv"), index=False)

        print("Latest Data Saved!")

        return {"status": "success", "rows": len(df)}

    except Exception as e:
        return {"error": f"Scraper failed: {str(e)}"}, 500


# -----------------------
# FINANCIAL CALCULATOR
# -----------------------
@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        result = calculate_financials(
            district=data['district'],
            crop=data['crop'],
            season=data['season'],
            acres=data['acres'],
            start_date="2023-01-01",
            mode=data.get('mode', 'recommended'),
            custom_cost_per_acre=data.get('custom_cost_per_acre', 0)
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# -----------------------
# SMART MARKET ARBITRAGE
# -----------------------
@app.route('/arbitrage', methods=['POST'])
def arbitrage():
    try:
        data = request.get_json()
        crop = data.get('crop')
        district = data.get('district')
        
        if not crop or not district:
            return jsonify({"error": "Missing crop or district"}), 400
            
        result = find_best_arbitrage(crop, district)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# -----------------------
# AGRI-CREDIT SCORE
# -----------------------
@app.route('/credit-score', methods=['POST'])
def credit_score():
    try:
        data = request.get_json()
        income = data.get('income')
        expense = data.get('expense')
        crop = data.get('crop')
        
        if income is None or expense is None or not crop:
            return jsonify({"error": "Missing income, expense, or crop"}), 400
            
        result = calculate_credit_score(float(income), float(expense), crop)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# -----------------------
# WEATHER & RISK API
# -----------------------
@app.route('/weather', methods=['GET'])
def get_weather():
    try:
        district = request.args.get('district', 'Warangal')
        # Placeholder API Key - In production, use os.getenv('OPENWEATHER_API_KEY')
        api_key = "YOUR_API_KEY" 
        
        # Mock response if no key or for testing
        import random
        # Simulating API call failure or default key behavior by returning mock data
        # In a real scenario, we would call:
        # url = f"https://api.openweathermap.org/data/2.5/weather?q={district}&units=metric&appid={api_key}"
        # response = requests.get(url)
        # data = response.json()
        
        # MOCK DATA for demonstration
        mock_weather = {
            "temp": random.randint(25, 40),
            "humidity": random.randint(40, 90),
            "rainfall": random.choice([0, 5, 15, 50]), # mm
            "wind_speed": random.randint(5, 20)
        }
        
        # Risk Calculation
        risk = "Low Risk"
        advisory = "Good weather conditions. Low risk."
        
        if mock_weather['rainfall'] > 10:
            risk = "High Risk"
            advisory = "Heavy rainfall detected. Consider delaying harvest or transportation."
        elif mock_weather['humidity'] > 80: # Assuming Cotton logic applies generally or we check crop
            risk = "High Risk"
            advisory = "High humidity detected. Monitor crop health closely."
        elif mock_weather['temp'] > 36:
            risk = "Moderate Risk"
            advisory = "High temperatures. Ensure adequate irrigation."
            
        return jsonify({
            "district": district,
            "weather": mock_weather,
            "risk": risk,
            "advisory": advisory
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------
# 30-DAY PROFIT FORECAST
# -----------------------
@app.route('/predict-30-days', methods=['POST'])
def predict_30_days():
    try:
        data = request.get_json()
        crop = data.get('crop')
        district = data.get('district')
        acres = float(data.get('acres', 1))
        # We need the TOTAL expense to calculate profit. 
        # This should be passed from the frontend after /calculate
        total_expense = float(data.get('total_expense', 0))
        
        if not crop or not district:
            return jsonify({"error": "Missing crop or district"}), 400

        # Run ML Pipeline
        forecast_df = run_full_pipeline(crop_name=crop, district_name=district)
        
        # Yield Dictionary (Simple lookup)
        YIELD_PER_ACRE = {
            "Paddy": 20,
            "Maize": 18,
            "Wheat": 12,
            "Cotton": 15,
            "Groundnut": 8,
            "Chilli": 10
        }
        crop_yield = YIELD_PER_ACRE.get(crop.title(), 15) # Default 15 if not found
        
        results = []
        # forecast_df has 'Predicted_Price' (per quintal usually)
        # We need to handle the date. The pipeline sets index as Date but returns records.
        # Let's check run_full_pipeline output format. It returns a DataFrame.
        # We will iterate through it.
        
        # Reset index to get Date as column if it's in index
        if 'Date' not in forecast_df.columns:
            forecast_df = forecast_df.reset_index()
            
        for i, row in forecast_df.iterrows():
            price = row['Predicted_Price']
            
            # Income = Price * Yield * Acres
            predicted_income = price * crop_yield * acres
            
            # Profit = Income - Expense
            predicted_profit = predicted_income - total_expense
            
            # Handle Date
            date_str = f"Day {i+1}"
            if 'Date' in row and row['Date'] is not None:
                try:
                    date_str = row['Date'].strftime('%Y-%m-%d')
                except:
                    date_str = str(row['Date'])
            elif 'index' in row and row['index'] is not None:
                try:
                    date_str = row['index'].strftime('%Y-%m-%d')
                except:
                    date_str = str(row['index'])

            results.append({
                "day": i + 1,
                "date": date_str,
                "price": round(price, 2),
                "income": round(predicted_income, 2),
                "profit": round(predicted_profit, 2)
            })
            
        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# -----------------------
# CHATBOT ENDPOINT
# -----------------------
@app.route('/chatbot', methods=['POST'])
def chatbot_endpoint():
    try:
        from chatbot import get_agriculture_response
        data = request.get_json()
        message = data.get('message')
        history = data.get('history', [])
        language = data.get('language', 'English')
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
            
        response = get_agriculture_response(message, history, language)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
