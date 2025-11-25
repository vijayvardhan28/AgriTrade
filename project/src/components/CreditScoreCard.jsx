import React from 'react';

const CreditScoreCard = ({ creditData }) => {
    if (!creditData || !creditData.breakdown) return null;

    const { score, category, color, breakdown } = creditData;

    // Determine color class based on backend response
    let colorClass = "text-gray-600";
    if (color === "green") colorClass = "text-green-600";
    if (color === "yellow") colorClass = "text-yellow-600";
    if (color === "red") colorClass = "text-red-600";

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Agri-Credit Score Engine</h3>

            <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-4 md:mb-0">
                    <div className="text-5xl font-bold text-blue-600 mb-2">{score}</div>
                    <div className="text-sm text-gray-500">out of 1000</div>
                </div>

                <div className="text-center md:text-right">
                    <div className={`text-2xl font-bold ${colorClass} mb-1`}>{category}</div>
                    <p className="text-gray-600 text-sm max-w-xs">
                        Based on your profitability, cost efficiency, and crop market risk.
                    </p>
                </div>
            </div>

            <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Score Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded text-center">
                        <div className="text-lg font-bold text-gray-800">{breakdown.profitability_score}</div>
                        <div className="text-xs text-gray-500">Profitability (40%)</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-center">
                        <div className="text-lg font-bold text-gray-800">{breakdown.efficiency_score}</div>
                        <div className="text-xs text-gray-500">Efficiency (30%)</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-center">
                        <div className="text-lg font-bold text-gray-800">{breakdown.risk_score}</div>
                        <div className="text-xs text-gray-500">Market Risk (30%)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditScoreCard;
