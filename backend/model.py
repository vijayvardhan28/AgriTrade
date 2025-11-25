import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

YIELD_PER_ACRE = {
    "Paddy": 20,
    "Maize": 18,
    "Wheat": 12,
    "Cotton": 15,
    "Groundnut": 8
}

def load_and_preprocess_data():
    """Load and preprocess both datasets with enhanced type handling"""
    # Load datasets
    df_districts = pd.read_csv(os.path.join(BASE_DIR, "datasets", "DISTRTICTS_DATASET final.csv"))
    df_crop = pd.read_csv(os.path.join(BASE_DIR, "datasets", "Cropcost.csv"))

    # Process districts data
    df_districts = df_districts.rename(columns={
        'District Name': 'District',
        'Commodity': 'Crop',
        'Modal Price (Rs./Quintal)': 'Price',
        'Price Date': 'Date',
        'qn_per_acre': 'qn_per_acre'
    })

    # Convert date and handle errors
    df_districts['Date'] = pd.to_datetime(
        df_districts['Date'], 
        format='%d-%m-%Y', 
        errors='coerce'
    )
    
    # Clean numeric columns
    df_districts['Price'] = pd.to_numeric(
        df_districts['Price'].astype(str).str.replace(',', ''),
        errors='coerce'
    )
    
    df_districts['qn_per_acre'] = pd.to_numeric(
        df_districts['qn_per_acre'].astype(str).str.replace(',', ''),
        errors='coerce'
    )

    # Clean and standardize crop names
    df_districts['Crop'] = (
        df_districts['Crop']
        .str.lower()
        .str.replace(r'\(.*\)', '', regex=True)
        .str.replace('common', '', regex=False)
        .str.strip()
    )

    # Drop invalid rows
    df_districts = df_districts.dropna(subset=['Date', 'Price', 'qn_per_acre'])

    # Process crop cost data
    df_crop['Crop_Type'] = (
        df_crop['Crop_Type']
        .str.lower()
        .str.strip()
    )
    df_crop['Season'] = (
        df_crop['Season']
        .str.strip()
        .str.title()
    )
    
    # Clean expenditure data
    df_crop['Total_Expenditure'] = pd.to_numeric(
        df_crop['Total_Expenditure'].astype(str).str.replace(',', ''),
        errors='coerce'
    )
    
    return df_districts, df_crop

# Load preprocessed data
df_districts, df_crop = load_and_preprocess_data()

import pandas as pd

def calculate_financials(district, crop, season, acres, start_date, mode="recommended", custom_cost_per_acre=0):
    # ------- 1. Load scraped prices -------
    latest_df = pd.read_csv(os.path.join(BASE_DIR, "datasets", "latest_prices.csv"))

    scraped_row = latest_df[
        (latest_df["Commodity"].str.lower() == crop.lower()) &
        (latest_df["District"].str.lower() == district.lower())
    ]

    # ------- 2. Use scraped price or fallback -------
    if scraped_row.empty:
        print(f"[WARNING] No scraped price for {crop} in {district}. Using static dataset price.")

        static_row = df_districts[
            (df_districts["Crop"].str.lower() == crop.lower()) &
            (df_districts["District"].str.lower() == district.lower())
        ]

        if static_row.empty:
            raise ValueError(f"No price found for {crop} in {district} in both datasets.")

        price = float(static_row.iloc[0]["Price"])
        price_source = "STATIC DATA"

    else:
        price = float(scraped_row.iloc[0]["Modal_Price"])
        price_source = "SCRAPED LATEST DATA"

    print("FINAL PRICE USED =", price, "| SOURCE =", price_source)

    # ------- 3. Load cost using your actual columns -------
    cost_row = df_crop[
        (df_crop["Crop_Type"].str.lower() == crop.lower()) &
        (df_crop["Season"].str.lower() == season.lower())
    ]

    if cost_row.empty:
        raise ValueError(f"No cost entry for {crop} - {season}")

    # Cost per acre
    if mode == "custom":
        cost_per_acre = float(custom_cost_per_acre)
        print(f"Using CUSTOM cost per acre: {cost_per_acre}")
    else:
        cost_per_acre = float(cost_row.iloc[0]["Total_Expenditure"])
        print(f"Using RECOMMENDED cost per acre: {cost_per_acre}")

    # ------- 4. Financial Calculations -------
    yield_per_acre = YIELD_PER_ACRE.get(crop.title(), 10)
    total_income = price * yield_per_acre * acres
    total_expense = cost_per_acre * acres
    balance = total_income - total_expense

    return {
        "modalPrice": price,
        "priceSource": price_source,
        "costPerAcre": cost_per_acre,
        "totalIncome": total_income,
        "totalExpense": total_expense,
        "balance": balance
    }
