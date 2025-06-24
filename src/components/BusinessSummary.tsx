import React from 'react';
import { Business } from '../types';
import { getAvailableBusinessTypes } from '../utils/yamlLoader';
import { Building2, Edit } from 'lucide-react';

interface BusinessSummaryProps {
  business: Business;
  onEdit: () => void;
}

export const BusinessSummary: React.FC<BusinessSummaryProps> = ({
  business,
  onEdit,
}) => {
  const availableBusinessTypes = getAvailableBusinessTypes(business.region);
  const businessType = availableBusinessTypes.find(t => t.code === business.type);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
        </div>
        <button
          onClick={onEdit}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-700">Business Name:</span>
          <p className="text-gray-900">{business.name}</p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-700">Business Type:</span>
          <p className="text-gray-900">{businessType?.name || business.type}</p>
          {businessType?.description && (
            <p className="text-sm text-gray-500 mt-1">{businessType.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}; 