import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import MarketArbitrageCard from '../components/MarketArbitrageCard';
import CreditScoreCard from '../components/CreditScoreCard';

const FinanceTracker = () => {
  const location = useLocation();

  const [formData, setFormData] = useState({
    district: '',
    crop: '',
    season: '',
    acres: '1'
  });

  const [result, setResult] = useState(null);
  const [arbitrageData, setArbitrageData] = useState(null);
  const [creditData, setCreditData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  const [expenseMode, setExpenseMode] = useState('recommended'); // 'recommended' or 'custom'
  const [customExpense, setCustomExpense] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [options, setOptions] = useState({
    districts: [],
    crops: [],
    seasons: []
  });

  // --------------------------
  // LOAD ALL OPTIONS
  // --------------------------
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [districtsRes, cropsRes, seasonsRes] = await Promise.all([
          axios.get('http://localhost:5000/districts'),
          axios.get('http://localhost:5000/crops'),
          axios.get('http://localhost:5000/seasons')
        ]);

        setOptions({
          districts: districtsRes.data,
          crops: cropsRes.data,
          seasons: seasonsRes.data
        });
      } catch (err) {
        setError('Failed to load options. Please refresh the page.');
      }
    };

    fetchOptions();
  }, []);

  // --------------------------
  // AUTOFILL FROM VOICE BOT
  // --------------------------
  useEffect(() => {
    if (location.state) {
      const { crop, district, autoTrigger } = location.state;
      if (crop || district) {
        setFormData(prev => ({
          ...prev,
          crop: crop || prev.crop,
          district: district || prev.district
        }));

        // If both are present and autoTrigger is true, we could trigger calculation
        // But we need to be careful about infinite loops or race conditions with state updates
        // For now, we just prefill.
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --------------------------
  // FINANCIAL CALCULATION
  // --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setArbitrageData(null);
    setCreditData(null);
    setWeatherData(null);
    setForecastData(null);

    try {
      // 1. Calculate Financials
      const financialRes = await axios.post('http://localhost:5000/calculate', {
        ...formData,
        acres: parseFloat(formData.acres),
        mode: expenseMode,
        custom_cost_per_acre: expenseMode === 'custom' ? parseFloat(customExpense) : 0
      });
      setResult(financialRes.data);

      // 2. Fetch Arbitrage Opportunities
      const arbitrageRes = await axios.post('http://localhost:5000/arbitrage', {
        crop: formData.crop,
        district: formData.district
      });
      setArbitrageData(arbitrageRes.data);

      // 3. Calculate Credit Score
      if (financialRes.data) {
        const creditRes = await axios.post('http://localhost:5000/credit-score', {
          income: financialRes.data.totalIncome,
          expense: financialRes.data.totalExpense,
          crop: formData.crop
        });
        setCreditData(creditRes.data);

        // 4. Fetch Weather & Risk
        const weatherRes = await axios.get(`http://localhost:5000/weather?district=${formData.district}`);
        setWeatherData(weatherRes.data);

        // 5. Fetch 30-Day Forecast
        const forecastRes = await axios.post('http://localhost:5000/predict-30-days', {
          crop: formData.crop,
          district: formData.district,
          acres: parseFloat(formData.acres),
          total_expense: financialRes.data.totalExpense
        });
        setForecastData(forecastRes.data);
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Calculation failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
        💰 Agri-Finance Tracker
      </h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">District</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select District</option>
              {options.districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Crop</label>
            <select
              name="crop"
              value={formData.crop}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Crop</option>
              {options.crops.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Season</label>
            <select
              name="season"
              value={formData.season}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Season</option>
              {options.seasons.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Acres</label>
            <input
              type="number"
              name="acres"
              value={formData.acres}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 5"
              required
            />
          </div>

          {/* DUAL EXPENSE MODE */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded border">
            <label className="block text-gray-700 font-medium mb-2">Expense Calculation Mode</label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="expenseMode"
                  value="recommended"
                  checked={expenseMode === 'recommended'}
                  onChange={() => setExpenseMode('recommended')}
                  className="mr-2"
                />
                Use Recommended Expense
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="expenseMode"
                  value="custom"
                  checked={expenseMode === 'custom'}
                  onChange={() => setExpenseMode('custom')}
                  className="mr-2"
                />
                Enter My Own Expense
              </label>
            </div>

            {expenseMode === 'custom' && (
              <div>
                <label className="block text-gray-700 text-sm mb-1">Enter Your Expense Per Acre (₹)</label>
                <input
                  type="number"
                  value={customExpense}
                  onChange={(e) => setCustomExpense(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. 15000"
                  required={expenseMode === 'custom'}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-bold text-lg"
            disabled={loading}
          >
            {loading ? "Calculating..." : "Calculate Financials"}
          </button>
        </form>
      </div>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {result && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Financial Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600 text-sm uppercase font-bold">Estimated Revenue</p>
              <p className="text-2xl font-bold text-green-700">₹{result.totalIncome?.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-gray-600 text-sm uppercase font-bold">Estimated Cost</p>
              <p className="text-2xl font-bold text-red-600">₹{result.totalExpense?.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-600 text-sm uppercase font-bold">Net Profit</p>
              <p className={`text-2xl font-bold ${result.balance >= 0 ? "text-blue-700" : "text-red-700"}`}>
                ₹{result.balance?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NEW FEATURES */}
      {arbitrageData && <MarketArbitrageCard arbitrageData={arbitrageData} />}
      {creditData && <CreditScoreCard creditData={creditData} />}

      {/* WEATHER & FORECAST SECTION */}
      <div className="mt-8">
        {weatherData && (
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🌤️ Weather Advisory
            </h3>

            {/* Weather Risk & Advisory */}
            <div className={`p-4 rounded-lg ${weatherData.risk === 'High Risk' ? 'bg-red-100 border-l-4 border-red-500' :
                weatherData.risk === 'Moderate Risk' ? 'bg-yellow-100 border-l-4 border-yellow-500' :
                  'bg-green-100 border-l-4 border-green-500'
              }`}>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h4 className="font-bold text-lg mb-1">Current Weather in {weatherData.district}</h4>
                  <p className="text-sm text-gray-700">
                    Temp: <strong>{weatherData.weather.temp}°C</strong> |
                    Humidity: <strong>{weatherData.weather.humidity}%</strong> |
                    Rain: <strong>{weatherData.weather.rainfall}mm</strong>
                  </p>
                </div>
                <div className="text-center md:text-right mt-4 md:mt-0">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-1 ${weatherData.risk === 'High Risk' ? 'bg-red-200 text-red-800' :
                      weatherData.risk === 'Moderate Risk' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                    }`}>
                    {weatherData.risk}
                  </span>
                  <p className="font-medium text-gray-800">{weatherData.advisory}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {forecastData && (
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              📈 30-Day Price & Profit Projection
            </h3>

            {/* 30-Day Forecast Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Day</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Date</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Pred. Price (₹/q)</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Est. Income (₹)</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Est. Profit (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.map((day) => (
                    <tr key={day.day} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b text-sm text-gray-700">{day.day}</td>
                      <td className="py-2 px-4 border-b text-sm text-gray-700">{day.date}</td>
                      <td className="py-2 px-4 border-b text-sm text-gray-700">₹{day.price}</td>
                      <td className="py-2 px-4 border-b text-sm text-green-600 font-medium">₹{day.income.toLocaleString()}</td>
                      <td className={`py-2 px-4 border-b text-sm font-bold ${day.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        ₹{day.profit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default FinanceTracker;
