import pandas as pd
import random
from datetime import datetime, timedelta
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/fetch-latest-prices', methods=['GET'])
def fetch_latest_prices():
    try:
        # Generate simulated latest mandi prices
        crops = ["Paddy", "Maize", "Wheat", "Cotton", "Groundnut"]
        districts = ["Warangal", "Karimnagar", "Nalgonda", "Adilabad", "Khammam"]

        rows = []
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

        for crop in crops:
            for district in districts:
                price = random.randint(1300, 2000)  # realistic mandi modal price

                rows.append({
                    "Commodity": crop,
                    "District": district,
                    "Modal_Price": price,
                    "Date": yesterday
                })

        df = pd.DataFrame(rows)

        df.to_csv("datasets/latest_prices.csv", index=False)

        return jsonify({"status": "success", "rows": len(df)})

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)
