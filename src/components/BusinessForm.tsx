import React, { useState, useEffect } from 'react';
import { Business } from '../types';
import { getAvailableBusinessTypes } from '../utils/yamlLoader';
import { Building2, Save, CreditCard, Info } from 'lucide-react';

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
  const [availableBusinessTypes, setAvailableBusinessTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
  });

  useEffect(() => {
    const loadBusinessTypes = async () => {
      try {
        const types = await getAvailableBusinessTypes(region);
        setAvailableBusinessTypes(types);
        if (types.length > 0 && !formData.type) {
          setFormData(prev => ({ ...prev, type: types[0].code }));
        }
      } catch (error) {
        console.error('Failed to load business types:', error);
      } finally {
        setLoading(false);
      }
    };

    if (region) {
      loadBusinessTypes();
    }
  }, [region]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.type) {
      onSaveBusiness({
        name: formData.name.trim(),
        type: formData.type,
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-5 h-5 text-primary-600" />
          <h3 className="text-base font-medium text-gray-900">Business Details</h3>
        </div>
        <div className="text-center py-4">
          <div className="text-gray-500">Loading business types...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Shopify Payments Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-semibold text-blue-800">Company for Shopify Payments</h3>
        </div>
        <div className="flex items-start gap-2 text-xs text-blue-700">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <p>
            This is the company you plan to register with Shopify Payments. We'll help you identify 
            which directors and beneficial owners need to be provided to meet Shopify Payments requirements.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-5 h-5 text-primary-600" />
        <h3 className="text-base font-medium text-gray-900">Business Details</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
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
            placeholder="Enter the business name you plan to register with Shopify Payments"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Use the business name as it will appear in your Shopify Payments registration
          </p>
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

        <div className="flex gap-3 pt-1">
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