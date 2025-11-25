export const calculateFinancialSummary = (transactions) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
    
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const getCategoryTotals = (transactions, type) => {
  const filtered = transactions.filter(t => t.type === type);
  
  const categoryTotals = filtered.reduce((acc, transaction) => {
    const { category, amount } = transaction;
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += amount;
    return acc;
  }, {});
  
  return Object.entries(categoryTotals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
};

export const calculateLoanEligibility = (totalIncome, totalExpense, requestedAmount) => {
  const isEligible = totalIncome >= totalExpense * 2;
  const maxEligibleAmount = Math.floor((totalIncome - totalExpense) * 5);
  
  return {
    eligible: isEligible && requestedAmount <= maxEligibleAmount,
    maxAmount: maxEligibleAmount
  };
};