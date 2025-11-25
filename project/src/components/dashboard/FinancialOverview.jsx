import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/financeUtils';

const FinancialOverview = ({ summary = { totalIncome: 0, totalExpense: 0, balance: 0 } }) => {
  const { totalIncome = 0, totalExpense = 0, balance = 0 } = summary;
  
  const profitMargin = totalIncome > 0 
    ? Math.round((balance / totalIncome) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
        <div className="flex items-center p-4">
          <div className="bg-green-500 rounded-full p-3 mr-4">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-700">Total Income</p>
            <h4 className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome)}</h4>
          </div>
        </div>
      </Card>
      
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500">
        <div className="flex items-center p-4">
          <div className="bg-red-500 rounded-full p-3 mr-4">
            <TrendingDown size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-700">Total Expenses</p>
            <h4 className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpense)}</h4>
          </div>
        </div>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
        <div className="flex items-center p-4">
          <div className="bg-blue-500 rounded-full p-3 mr-4">
            <DollarSign size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Net Balance</p>
            <h4 className="text-2xl font-bold text-gray-900">
              {formatCurrency(balance)}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Profit Margin: {profitMargin}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FinancialOverview;