import React, { useState } from 'react';
import { Owner } from '../types';
import { Plus } from 'lucide-react';

interface OwnerFormProps {
  onAddOwner: (owner: Omit<Owner, 'id' | 'isRequired' | 'region'>) => void;
}

export const OwnerForm: React.FC<OwnerFormProps> = ({ onAddOwner }) => {
  const [formData, setFormData] = useState({
    name: '',
    roles: ['director'] as ('director' | 'shareholder')[],
    ownershipPercentage: 0,
  });

  const handleRoleChange = (role: 'director' | 'shareholder', checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, role]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        roles: prev.roles.filter(r => r !== role)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.roles.length > 0) {
      onAddOwner({
        name: formData.name.trim(),
        roles: formData.roles,
        ownershipPercentage: formData.ownershipPercentage,
      });
      setFormData({
        name: '',
        roles: ['director'],
        ownershipPercentage: 0,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900">Add Business Owner</h3>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter full name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Roles (select all that apply)
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.roles.includes('director')}
              onChange={(e) => handleRoleChange('director', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Director</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.roles.includes('shareholder')}
              onChange={(e) => handleRoleChange('shareholder', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Shareholder</span>
          </label>
        </div>
        {formData.roles.length === 0 && (
          <p className="text-sm text-red-600 mt-1">Please select at least one role</p>
        )}
      </div>

      <div>
        <label htmlFor="ownership" className="block text-sm font-medium text-gray-700 mb-1">
          Ownership Percentage
        </label>
        <input
          type="number"
          id="ownership"
          value={formData.ownershipPercentage}
          onChange={(e) => setFormData({ ...formData, ownershipPercentage: parseFloat(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="0"
          min="0"
          max="100"
          step="0.01"
        />
        <p className="text-xs text-gray-500 mt-1">
          Shareholders with {formData.roles.includes('shareholder') ? '25% or greater' : '25%+'} ownership are considered beneficial owners
        </p>
      </div>

      <button
        type="submit"
        disabled={formData.roles.length === 0}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Owner
      </button>
    </form>
  );
}; 