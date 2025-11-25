import React from 'react';

const MarketArbitrageCard = ({ arbitrageData }) => {
    if (!arbitrageData || !arbitrageData.opportunities) return null;

    const { user_district, user_price, opportunities } = arbitrageData;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Smart Market Arbitrage Finder</h3>
            <p className="text-gray-600 mb-4">
                Current Price in <span className="font-semibold">{user_district}</span>: ₹{user_price}
            </p>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700">
                            <th className="py-2 px-4 border-b">Target District</th>
                            <th className="py-2 px-4 border-b">Price</th>
                            <th className="py-2 px-4 border-b">Difference</th>
                            <th className="py-2 px-4 border-b">Transport Cost</th>
                            <th className="py-2 px-4 border-b">Net Gain</th>
                        </tr>
                    </thead>
                    <tbody>
                        {opportunities.map((opp, index) => (
                            <tr key={index} className="text-center hover:bg-gray-50">
                                <td className="py-2 px-4 border-b font-medium">{opp.district}</td>
                                <td className="py-2 px-4 border-b">₹{opp.price}</td>
                                <td className="py-2 px-4 border-b text-green-600">+₹{opp.price_diff.toFixed(2)}</td>
                                <td className="py-2 px-4 border-b text-red-500">-₹{opp.transport_cost.toFixed(2)}</td>
                                <td className={`py-2 px-4 border-b font-bold ${opp.net_gain > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {opp.net_gain > 0 ? '+' : ''}₹{opp.net_gain.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {opportunities.length === 0 && (
                <p className="text-center text-gray-500 mt-4">No arbitrage opportunities found.</p>
            )}
        </div>
    );
};

export default MarketArbitrageCard;
