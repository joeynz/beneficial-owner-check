import React, { useState } from 'react';
import { Owner, OwnerType } from '../types';
import { Plus, Building, User, Shield, Users } from 'lucide-react';

interface OwnerFormProps {
  onAddOwner: (owner: Omit<Owner, 'id' | 'isRequired' | 'region'>) => void;
  currentOwners: Owner[];
  totalOwnership: number;
  businessType?: string;
  region?: string;
  addingToOrganization?: string | null;
  organizationName?: string;
}

export const OwnerForm: React.FC<OwnerFormProps> = ({ 
  onAddOwner, 
  currentOwners, 
  totalOwnership, 
  businessType, 
  region, 
  addingToOrganization, 
  organizationName 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    ownerType: 'individual' as OwnerType,
    roles: [] as ('director' | 'owner')[],
    ownershipPercentage: 0,
    // Entity-specific fields
    isForeignEntity: false,
  });

  const isOwnershipFull = totalOwnership >= 100;
  
  // Check if this is a sole proprietor/sole trader business type
  const isSoleProprietor = businessType && [
    'sole-proprietorship', 
    'individual', 
    'single-member-llc'
  ].includes(businessType);
  
  // Check if this is Singapore (where sole proprietors can have multiple individuals)
  const isSingapore = region === 'SG';
  
  // For sole proprietors outside Singapore, only allow 100% owners
  const isSoleProprietorRestricted = isSoleProprietor && !isSingapore;
  
  // Calculate total ownership for the specific entity we're adding to
  const getEntityOwnership = () => {
    if (addingToOrganization) {
      const organization = currentOwners.find(o => o.id === addingToOrganization);
      if (organization && 'owners' in organization) {
        return organization.owners?.reduce((sum, owner) => sum + owner.ownershipPercentage, 0) || 0;
      }
      return 0;
    }
    return totalOwnership;
  };
  
  const entityOwnership = getEntityOwnership();
  const isEntityOwnershipFull = entityOwnership >= 100;
  
  // Check if adding the current ownership percentage would exceed 100%
  const wouldExceed100 = entityOwnership + formData.ownershipPercentage > 100;
  
  const canAddOwner = !isEntityOwnershipFull && !wouldExceed100 || !formData.roles.includes('owner');
  const canAddIndividual = !isSoleProprietorRestricted || formData.ownershipPercentage === 100;

  const handleRoleChange = (role: 'director' | 'owner', checked: boolean) => {
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

  const handleOwnerTypeChange = (ownerType: OwnerType) => {
    setFormData(prev => ({
      ...prev,
      ownerType,
      // Reset entity-specific fields when switching to individual
      isForeignEntity: ownerType === 'individual' ? false : prev.isForeignEntity,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.roles.length > 0 && canAddOwner && canAddIndividual && !wouldExceed100) {
      if (formData.ownerType === 'individual') {
        onAddOwner({
          name: formData.name.trim(),
          ownerType: 'individual',
          roles: formData.roles,
          ownershipPercentage: formData.ownershipPercentage,
        });
      } else {
        onAddOwner({
          name: formData.name.trim(),
          ownerType: 'organization',
          roles: formData.roles,
          ownershipPercentage: formData.ownershipPercentage,
          entityType: '',
          owners: [], // Empty array for nested owners
        } as any); // Type assertion to handle the union type
      }
      
      setFormData({
        name: '',
        ownerType: 'individual',
        roles: [],
        ownershipPercentage: 0,
        isForeignEntity: false,
      });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900">
        {addingToOrganization 
          ? `Add Owner to ${organizationName || 'Organization'}`
          : 'Add Owner or Director'
        }
      </h3>
      
      {addingToOrganization && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Adding to organization:</strong> {organizationName}
          </p>
        </div>
      )}
      
      {isEntityOwnershipFull && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> 100% ownership is already allocated to {addingToOrganization ? organizationName || 'this organization' : 'the business'}. You can still add directors, but no additional owners can be added.
          </p>
        </div>
      )}

      {wouldExceed100 && formData.roles.includes('owner') && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> Adding {formData.ownershipPercentage}% ownership would exceed 100% total ownership for {addingToOrganization ? organizationName || 'this organization' : 'the business'} (currently {entityOwnership.toFixed(2)}%).
          </p>
        </div>
      )}

      {isSoleProprietorRestricted && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Restriction:</strong> For sole proprietors/sole traders, only individuals with 100% ownership can be added.
          </p>
        </div>
      )}

      {/* Owner Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Owner Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['individual', 'organization'] as OwnerType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleOwnerTypeChange(type)}
              className={`flex items-center justify-center gap-2 p-3 border rounded-md text-sm font-medium transition-colors ${
                formData.ownerType === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {getOwnerTypeIcon(type)}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          {formData.ownerType === 'individual' ? 'Full Name' : 'Entity Name'}
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder={formData.ownerType === 'individual' ? 'Enter full name' : 'Enter entity name'}
          required
        />
      </div>

      {/* Entity-specific fields */}
      {formData.ownerType === 'organization' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isForeignEntity: false })}
                className={`flex items-center justify-center gap-2 p-3 border rounded-md text-sm font-medium transition-colors ${
                  !formData.isForeignEntity
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {region ? `${region.toUpperCase()}` : 'Current Region'}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isForeignEntity: true })}
                className={`flex items-center justify-center gap-2 p-3 border rounded-md text-sm font-medium transition-colors ${
                  formData.isForeignEntity
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Foreign Entity
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After adding this entity, you'll need to add its owners to complete the ownership structure.
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Roles (select all that apply)
        </label>
        <div className="space-y-2">
          <label className={`flex items-center ${isSoleProprietorRestricted || formData.ownerType === 'organization' ? 'opacity-50' : ''}`}>
            <input
              type="checkbox"
              checked={formData.roles.includes('director')}
              onChange={(e) => handleRoleChange('director', e.target.checked)}
              disabled={isSoleProprietorRestricted || formData.ownerType === 'organization'}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">
              Director
              {isSoleProprietorRestricted && <span className="text-xs text-gray-500 block">(Not applicable for sole proprietors)</span>}
              {formData.ownerType === 'organization' && <span className="text-xs text-gray-500 block">(Only individuals can be directors)</span>}
            </span>
          </label>
          <label className={`flex items-center ${isEntityOwnershipFull ? 'opacity-50' : ''}`}>
            <input
              type="checkbox"
              checked={formData.roles.includes('owner')}
              onChange={(e) => handleRoleChange('owner', e.target.checked)}
              disabled={isEntityOwnershipFull || false}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">
              Owner
              {isEntityOwnershipFull && <span className="text-xs text-gray-500 block">(100% ownership allocated)</span>}
              {wouldExceed100 && formData.roles.includes('owner') && <span className="text-xs text-red-500 block">(Would exceed 100% ownership)</span>}
            </span>
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
          disabled={!formData.roles.includes('owner')}
        />
        <p className="text-xs text-gray-500 mt-1">
          Owners with {formData.roles.includes('owner') ? '25% or greater' : '25%+'} ownership are considered beneficial owners
          {isSoleProprietorRestricted && formData.roles.includes('owner') && (
            <span className="block text-red-600">Must be 100% for sole proprietors</span>
          )}
        </p>
      </div>

      <button
        type="submit"
        disabled={formData.roles.length === 0 || !canAddOwner || !canAddIndividual}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add {formData.ownerType.charAt(0).toUpperCase() + formData.ownerType.slice(1)}
      </button>
    </form>
  );
}; 