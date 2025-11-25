import React from 'react';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../ui/Card';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/financeUtils';

const SeasonPlanning = ({ cropPlans }) => {
  return (
    <Card title="Season Planning">
      <div className="space-y-4">
        {cropPlans.map((plan) => {
          const profit = plan.estimatedRevenue - plan.estimatedCost;
          const isProfitable = profit > 0;
          
          return (
            <div key={plan.id} className="border rounded-lg p-3 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <h4 className="text-md font-medium text-gray-900">{plan.cropName}</h4>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                  plan.season === 'winter' 
                    ? 'bg-blue-100 text-blue-800' 
                    : plan.season === 'summer' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                }`}>
                  {plan.season} Season
                </span>
              </div>
              
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Area:</p>
                  <p className="font-medium">{plan.area} Hectares</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Est. Profit:</p>
                  <p className={`font-medium flex items-center ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                    {isProfitable ? 
                      <TrendingUp size={14} className="mr-1" /> : 
                      <TrendingDown size={14} className="mr-1" />
                    }
                    {formatCurrency(profit)}
                  </p>
                </div>
              </div>
              
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Est. Cost:</p>
                  <p className="font-medium">{formatCurrency(plan.estimatedCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Est. Revenue:</p>
                  <p className="font-medium">{formatCurrency(plan.estimatedRevenue)}</p>
                </div>
              </div>
              
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <Calendar size={14} className="mr-1" />
                <span>{formatDate(plan.startDate)} — {formatDate(plan.harvestDate)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default SeasonPlanning;