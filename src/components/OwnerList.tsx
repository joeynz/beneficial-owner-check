import React from 'react';
import { Owner, OwnerType, RequiredOwner } from '../types';
import { X, AlertCircle, CheckCircle, Building, User, Shield, Users, ChevronRight, Plus } from 'lucide-react';

interface OwnerListProps {
  owners: Owner[];
  onRemoveOwner: (id: string) => void;
  onAddOwnerToOrganization: (organizationId: string) => void;
  requiredOwners: RequiredOwner[];
}

export const OwnerList: React.FC<OwnerListProps> = ({
  owners,
  onRemoveOwner,
  onAddOwnerToOrganization,
  requiredOwners,
}) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'director':
        return 'bg-blue-100 text-blue-800';
      case 'owner':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOwnerTypeIcon = (type: OwnerType) => {
    switch (type) {
      case 'individual': return <User className="w-4 h-4" />;
      case 'company': return <Building className="w-4 h-4" />;
      case 'trust': return <Shield className="w-4 h-4" />;
      case 'organization': return <Users className="w-4 h-4" />;
    }
  };

  const getOwnerTypeColor = (type: OwnerType) => {
    switch (type) {
      case 'individual': return 'text-blue-600';
      case 'company': return 'text-green-600';
      case 'trust': return 'text-purple-600';
      case 'organization': return 'text-orange-600';
    }
  };

  const isRequired = (owner: Owner) => {
    return requiredOwners.some(required => required.owner.id === owner.id);
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
        const isEntity = owner.ownerType !== 'individual';
        
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
                  <div className={`${getOwnerTypeColor(owner.ownerType)}`}>
                    {getOwnerTypeIcon(owner.ownerType)}
                  </div>
                  <h4 className="font-medium text-gray-900">{owner.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getOwnerTypeColor(owner.ownerType)}`}>
                    {owner.ownerType.charAt(0).toUpperCase() + owner.ownerType.slice(1)}
                  </span>
                  {required && (
                    <div className="flex items-center gap-1 text-warning-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Required</span>
                    </div>
                  )}
                </div>
                
                {/* Entity-specific information */}
                {isEntity && (
                  <div className="mb-2 text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span><strong>Type:</strong> {owner.entityType}</span>
                      {owner.registrationNumber && (
                        <span><strong>Reg #:</strong> {owner.registrationNumber}</span>
                      )}
                      {owner.jurisdiction && (
                        <span><strong>Jurisdiction:</strong> {owner.jurisdiction}</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      {owner.owners && owner.owners.length > 0 && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <ChevronRight className="w-4 h-4" />
                          <span>{owner.owners.length} nested owner{owner.owners.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <button
                        onClick={() => onAddOwnerToOrganization(owner.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add Owners
                      </button>
                    </div>
                  </div>
                )}
                
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
                      {owner.ownershipPercentage % 1 !== 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          (reported as {Math.round(owner.ownershipPercentage)}% for Shopify Payments)
                        </span>
                      )}
                    </span>
                  )}
                </div>
                
                {required && (
                  <div className="flex items-center gap-1 text-warning-700 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>This {owner.ownerType} must be reported for compliance</span>
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