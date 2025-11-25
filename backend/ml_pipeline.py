import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from datetime import datetime
import warnings
warnings.filterwarnings("ignore")

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_latest_data():
    try:
        df = pd.read_csv(os.path.join(BASE_DIR, "datasets", "latest_prices.csv"))
        print("Loaded latest_prices.csv")
    except:
        df = pd.read_csv(os.path.join(BASE_DIR, "datasets", "latest_prices_backup.csv"))
        print("Loaded latest_prices_backup.csv")

    df.columns = [c.strip().replace(" ", "_") for c in df.columns]

    return df


def preprocess_latest(df, crop_name, district_name):

    """
    Preprocess latest_prices.csv for ML model.
    Expected columns: Commodity, District, Modal_Price, Date
    """

    # Filter by crop
    if "Commodity" in df.columns:
        df = df[df["Commodity"].str.contains(crop_name, case=False, na=False)]

    # Filter by district
    if "District" in df.columns:
        df = df[df["District"].str.contains(district_name, case=False, na=False)]

    # Make sure Modal_Price exists
    if "Modal_Price" not in df.columns:
        raise ValueError("Modal_Price column missing from latest_prices.csv")

    # Rename price column
    df["Price"] = df["Modal_Price"]

    # Convert Date to datetime
    if "Date" not in df.columns:
        raise ValueError("Date column missing from latest_prices.csv")

    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

    # Drop missing dates
    df = df.dropna(subset=["Date"])

    # Sort by date
    df = df.sort_values("Date")

    # Set index for SARIMAX
    df.set_index("Date", inplace=True)

    # Keep only price column
    return df[["Price"]]


def train_model(df):
    model = SARIMAX(
        df["Price"],
        order=(1,1,1),
        seasonal_order=(1,1,1,7),
        enforce_stationarity=False,
        enforce_invertibility=False
    )
    return model.fit(disp=False)


def generate_forecast(model, steps=30):
    fc = model.get_forecast(steps)
    mean = fc.predicted_mean
    ci = fc.conf_int()

    df_fc = pd.DataFrame({
        "Predicted_Price": mean,
        "Lower_Bound": ci.iloc[:, 0],
        "Upper_Bound": ci.iloc[:, 1]
    })
    return df_fc


def run_full_pipeline(crop_name, district_name):
    df_latest = load_latest_data()
    df_clean = preprocess_latest(df_latest, crop_name, district_name)
    model = train_model(df_clean)
    forecast = generate_forecast(model)
    forecast.to_csv(os.path.join(BASE_DIR, "datasets", "forecast_output.csv"), index=False)
    return forecast
