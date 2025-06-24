import React from 'react';
import { Owner } from '../types';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface OwnerListProps {
  owners: Owner[];
  onRemoveOwner: (id: string) => void;
  requiredOwners: Owner[];
}

export const OwnerList: React.FC<OwnerListProps> = ({
  owners,
  onRemoveOwner,
  requiredOwners,
}) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'director':
        return 'bg-blue-100 text-blue-800';
      case 'shareholder':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isRequired = (owner: Owner) => {
    return requiredOwners.some(required => required.id === owner.id);
  };

  if (owners.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No owners added yet. Add your first business owner above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-900">Business Owners</h3>
      {owners.map((owner) => {
        const required = isRequired(owner);
        return (
          <div
            key={owner.id}
            className={`p-4 border rounded-lg ${
              required
                ? 'border-warning-300 bg-warning-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">{owner.name}</h4>
                  {required && (
                    <div className="flex items-center gap-1 text-warning-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Required</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex flex-wrap gap-1">
                    {owner.roles.map((role) => (
                      <span
                        key={role}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(role)}`}
                      >
                        {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                  {owner.ownershipPercentage > 0 && (
                    <span className="text-sm text-gray-600">
                      {owner.ownershipPercentage}% ownership
                    </span>
                  )}
                </div>
                
                {required && (
                  <div className="flex items-center gap-1 text-warning-700 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>This individual must be reported for compliance</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => onRemoveOwner(owner.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Remove owner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 