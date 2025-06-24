import React, { useState, useEffect } from 'react';
import { Business } from '../types';
import { getAvailableBusinessTypes } from '../utils/yamlLoader';
import { Building2, Edit, CreditCard } from 'lucide-react';

interface BusinessSummaryProps {
  business: Business;
  onEdit: () => void;
}

export const BusinessSummary: React.FC<BusinessSummaryProps> = ({
  business,
  onEdit,
}) => {
  const [availableBusinessTypes, setAvailableBusinessTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBusinessTypes = async () => {
      try {
        const types = await getAvailableBusinessTypes(business.region);
        setAvailableBusinessTypes(types);
      } catch (error) {
        console.error('Failed to load business types:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessTypes();
  }, [business.region]);

  const businessType = availableBusinessTypes.find(t => t.code === business.type);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-medium text-gray-900">Business Information</h3>
          </div>
          <button
            onClick={onEdit}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
        <div className="text-center py-3">
          <div className="text-gray-500">Loading business information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Shopify Payments Badge */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2 mb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-800">Company for Shopify Payments Registration</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-600" />
          <h3 className="text-base font-medium text-gray-900">Business Information</h3>
        </div>
        <button
          onClick={onEdit}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-700">Business Name:</span>
          <p className="text-gray-900 font-medium">{business.name}</p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-700">Business Type:</span>
          <p className="text-gray-900">{businessType?.name || business.type}</p>
          {businessType?.description && (
            <p className="text-xs text-gray-500 mt-1">{businessType.description}</p>
          )}
        </div>

        <div>
          <span className="text-sm font-medium text-gray-700">Region:</span>
          <p className="text-gray-900 capitalize">{business.region}</p>
        </div>
      </div>

      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> This is the company you plan to register with Shopify Payments. 
          We'll help you identify which directors and beneficial owners need to be provided to meet 
          Shopify Payments compliance requirements.
        </p>
      </div>
    </div>
  );
}; 