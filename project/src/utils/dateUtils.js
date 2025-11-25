export const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const getCurrentSeason = () => {
  const month = new Date().getMonth();
  
  if (month >= 10 || month <= 1) return 'winter';
  if (month >= 2 && month <= 5) return 'summer';
  return 'rainy';
};

export const getDaysRemaining = (deadlineString) => {
  if (!deadlineString) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadline = new Date(deadlineString);
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};