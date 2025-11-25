import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatCurrency, calculateLoanEligibility } from '../../utils/financeUtils';

const LoanCalculator = ({ 
  financialSummary = { totalIncome: 0, totalExpense: 0, balance: 0 }, 
  loanOptions = [] 
}) => {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [selectedLoanId, setSelectedLoanId] = useState('');

  const { totalIncome = 0, totalExpense = 0 } = financialSummary;
  
  const { eligible, maxAmount } = calculateLoanEligibility(
    totalIncome,
    totalExpense,
    loanAmount
  );

  const selectedLoan = loanOptions.find(loan => loan.id === selectedLoanId) || null;

  const handleAmountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setLoanAmount(Math.min(value, maxAmount));
    }
  };

  const calculateMonthlyPayment = () => {
    if (!selectedLoan) return 0;
    
    const monthlyInterest = selectedLoan.interestRate / 100 / 12;
    const payments = parseInt(selectedLoan.tenure.split('-')[1]) * 12;
    
    const monthlyPayment = (loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, payments)) 
                         / (Math.pow(1 + monthlyInterest, payments) - 1);
    
    return isNaN(monthlyPayment) ? 0 : monthlyPayment;
  };

  return (
    <Card title="Agricultural Loan Calculator">
      <div className="space-y-4">
        <div>
          <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">
            Loan Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              id="loanAmount"
              value={loanAmount}
              onChange={handleAmountChange}
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0"
              min="10000"
              max={maxAmount}
              step="10000"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">INR</span>
            </div>
          </div>
          <div className="mt-2">
            <input
              type="range"
              min="10000"
              max={Math.min(1000000, maxAmount)}
              step="10000"
              value={loanAmount}
              onChange={handleAmountChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-500 px-1">
              <span>₹10,000</span>
              <span>₹{Math.min(1000000, maxAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Loan Provider
          </label>
          <div className="space-y-2">
            {loanOptions.map((loan) => (
              <div 
                key={loan.id}
                className={`border rounded-md p-3 cursor-pointer transition-colors ${
                  selectedLoanId === loan.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedLoanId(loan.id)}
              >
                <div className="flex justify-between">
                  <h5 className="text-sm font-medium">{loan.provider}</h5>
                  <span className="text-sm font-medium text-green-600">{loan.interestRate}% p.a.</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{loan.description}</p>
                <p className="text-xs text-gray-500 mt-1">Max: {formatCurrency(loan.maxAmount)} | Tenure: {loan.tenure}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedLoan && (
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Loan Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Loan Amount:</span>
                <span className="font-medium">{formatCurrency(loanAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Interest Rate:</span>
                <span className="font-medium">{selectedLoan.interestRate}% p.a.</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tenure:</span>
                <span className="font-medium">{selectedLoan.tenure}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Monthly Payment:</span>
                <span className="font-medium">{formatCurrency(calculateMonthlyPayment())}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Eligibility:</span>
                <span className={eligible ? 'text-green-600' : 'text-red-600'}>
                  {eligible ? 'Approved' : 'Not Approved'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <Button 
            className="w-full" 
            disabled={!eligible || !selectedLoanId}
            variant={eligible ? 'primary' : 'disabled'}
          >
            Apply for Loan
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LoanCalculator;