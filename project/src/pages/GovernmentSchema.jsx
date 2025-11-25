import React from 'react';
import GovernmentSchemesList from '../components/dashboard/GovernmentSchemesList';
import { governmentSchemes } from '../data/mockData';

const GovernmentSchema = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Government Schemes</h1>
      <GovernmentSchemesList schemes={governmentSchemes} />
    </div>
  );
};

export default GovernmentSchema;