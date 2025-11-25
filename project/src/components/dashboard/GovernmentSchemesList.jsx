import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { getDaysRemaining } from '../../utils/dateUtils';

const GovernmentSchemesList = ({ schemes, limit }) => {
  const displaySchemes = limit ? schemes.slice(0, limit) : schemes;

  return (
    <Card title="Government Schemes & Subsidies">
      <div className="space-y-4">
        {displaySchemes.map((scheme) => {
          const daysRemaining = getDaysRemaining(scheme.deadline);
          
          return (
            <div key={scheme.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <h4 className="text-md font-medium text-gray-900">{scheme.title}</h4>
                {daysRemaining !== null && (
                  <Badge 
                    text={`${daysRemaining} days left`}
                    color={daysRemaining < 10 ? 'red' : daysRemaining < 30 ? 'yellow' : 'blue'}
                    className="flex items-center"
                  >
                    <Clock size={12} className="mr-1" />
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600">{scheme.description}</p>
              
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-700">Eligibility:</p>
                <p className="text-xs text-gray-600">{scheme.eligibility}</p>
              </div>
              
              <div className="mt-3 flex items-center space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Check Eligibility
                </Button>
                <a
                  href={scheme.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none"
                >
                  Apply <ExternalLink size={12} className="ml-1" />
                </a>
              </div>
            </div>
          );
        })}
        
        {limit && schemes.length > limit && (
          <div className="text-center mt-4">
            <a href="#schemes" className="text-sm font-medium text-green-600 hover:text-green-700">
              View all government schemes
            </a>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GovernmentSchemesList;