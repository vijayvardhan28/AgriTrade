import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/financeUtils';
import { formatDate } from '../../utils/dateUtils';

const TransactionList = ({ transactions, limit }) => {
  const displayTransactions = limit 
    ? transactions.slice(0, limit) 
    : transactions;

  return (
    <Card title="Recent Transactions">
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {displayTransactions.map((transaction) => (
            <li key={transaction.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className={`mr-3 rounded-full p-2 ${
                  transaction.type === 'income' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {transaction.type === 'income' 
                    ? <ArrowUpRight size={16} /> 
                    : <ArrowDownRight size={16} />
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{formatDate(transaction.date)}</span>
                    <Badge 
                      text={transaction.category} 
                      color={transaction.type === 'income' ? 'green' : 'red'} 
                    />
                  </div>
                </div>
              </div>
              <span className={`font-medium ${
                transaction.type === 'income' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'} 
                {formatCurrency(transaction.amount)}
              </span>
            </li>
          ))}
        </ul>
        {limit && transactions.length > limit && (
          <div className="mt-4 text-center">
            <a href="#transactions" className="text-sm font-medium text-green-600 hover:text-green-700">
              View all transactions
            </a>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TransactionList;