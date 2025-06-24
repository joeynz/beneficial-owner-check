import React, { useState } from 'react';
import { Business } from '../types';
import { getAvailableBusinessTypes } from '../utils/yamlLoader';
import { Building2, Save } from 'lucide-react';

interface BusinessFormProps {
  region: string;
  onSaveBusiness: (business: Omit<Business, 'region'>) => void;
  onSkip: () => void;
}

export const BusinessForm: React.FC<BusinessFormProps> = ({
  region,
  onSaveBusiness,
  onSkip,
}) => {
  const availableBusinessTypes = getAvailableBusinessTypes(region);
  const [formData, setFormData] = useState({
    name: '',
    type: availableBusinessTypes[0]?.code || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.type) {
      onSaveBusiness({
        name: formData.name.trim(),
        type: formData.type,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-6 h-6 text-primary-600" />
        <h3 className="text-lg font-medium text-gray-900">Business Details</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
            Business Name *
          </label>
          <input
            type="text"
            id="businessName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter your business name"
            required
          />
        </div>

        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
            Business Type *
          </label>
          <select
            id="businessType"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">Select a business type...</option>
            {availableBusinessTypes.map((businessType) => (
              <option key={businessType.code} value={businessType.code}>
                {businessType.name}
              </option>
            ))}
          </select>
          {formData.type && (
            <p className="text-xs text-gray-500 mt-1">
              {availableBusinessTypes.find(t => t.code === formData.type)?.description}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!formData.name.trim() || !formData.type}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Business Details
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Skip for Now
          </button>
        </div>
      </form>
    </div>
  );
}; 