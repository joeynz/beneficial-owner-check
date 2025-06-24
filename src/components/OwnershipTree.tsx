import React from 'react';
import { Owner, Business } from '../types';
import { Building, User, Users, ChevronRight, ChevronDown, Plus, Percent, Crown, CreditCard } from 'lucide-react';

interface OwnershipTreeProps {
  business: Business | null;
  owners: Owner[];
  expandedNodes: Set<string>;
  onToggleNode: (nodeId: string) => void;
  onAddOwnerToOrganization: (organizationId: string) => void;
}

export const OwnershipTree: React.FC<OwnershipTreeProps> = ({
  business,
  owners,
  expandedNodes,
  onToggleNode,
  onAddOwnerToOrganization,
}) => {
  const getOwnerIcon = (ownerType: string) => {
    switch (ownerType) {
      case 'individual': return <User className="w-5 h-5" />;
      case 'organization': return <Users className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('director')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
          <Crown className="w-3 h-3" />
          Director
        </span>
      );
    }
    if (roles.includes('owner')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          <Percent className="w-3 h-3" />
          Owner
        </span>
      );
    }
    return null;
  };

  const renderOwner = (owner: Owner, level: number = 0) => {
    const hasChildren = 'owners' in owner && owner.owners && owner.owners.length > 0;
    const isExpanded = expandedNodes.has(owner.id);
    const isOrganization = owner.ownerType !== 'individual';
    const ownershipColor = owner.ownershipPercentage >= 25 ? 'text-red-600' : 'text-gray-600';
    
    return (
      <div key={owner.id} className="relative">
        {/* Level indicator */}
        <div className="flex items-start gap-4">
          {/* Level depth indicator */}
          <div className="flex-shrink-0 w-8 flex justify-center pt-3">
            {level > 0 && (
              <div className="w-px h-8 bg-gray-200" />
            )}
          </div>
          
          {/* Owner card */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Icon and expand/collapse */}
                  <div className="flex items-center gap-2">
                    {hasChildren && (
                      <button
                        onClick={() => onToggleNode(owner.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    )}
                    <div className="text-gray-500">
                      {getOwnerIcon(owner.ownerType)}
                    </div>
                  </div>
                  
                  {/* Owner details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {owner.name}
                      </h4>
                      {getRoleBadge(owner.roles)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="capitalize">{owner.ownerType}</span>
                      {owner.ownershipPercentage > 0 && (
                        <span className={`font-medium ${ownershipColor}`}>
                          {owner.ownershipPercentage}% ownership
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Add Owners button for organizations */}
                {isOrganization && (
                  <button
                    onClick={() => onAddOwnerToOrganization(owner.id)}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex-shrink-0"
                    title={`Add owners to ${owner.name}`}
                  >
                    <Plus className="w-3 h-3" />
                    Add Owners
                  </button>
                )}
              </div>
            </div>
            
            {/* Children */}
            {hasChildren && isExpanded && (
              <div className="mt-4 ml-8">
                <div className="space-y-4">
                  {owner.owners?.map((childOwner) => 
                    renderOwner(childOwner, level + 1)
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const calculateTotalOwnership = () => {
    return owners.reduce((total, owner) => total + owner.ownershipPercentage, 0);
  };

  const totalOwnership = calculateTotalOwnership();

  if (!business && owners.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ownership Structure</h3>
        <div className="text-center py-8">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No business or owners added yet</p>
          <p className="text-sm text-gray-400">Add a business and owners to see the ownership structure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Ownership Structure</h3>
        {owners.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Total Ownership:</span>
            <span className={`font-semibold ${totalOwnership > 100 ? 'text-red-600' : totalOwnership < 100 ? 'text-yellow-600' : 'text-green-600'}`}>
              {totalOwnership.toFixed(1)}%
            </span>
            {totalOwnership < 100 && (
              <span className="text-xs text-gray-400">
                ({100 - totalOwnership}% unallocated)
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Business Node - Root of the tree */}
        {business && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Building className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-blue-900">
                  {business.name}
                </h4>
                <p className="text-sm text-blue-700">
                  {business.type} • {business.region}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">For Shopify Payments Registration</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Owners */}
        {owners.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Users className="w-4 h-4" />
              Directors & Owners
            </div>
            {owners.map((owner) => renderOwner(owner, 0))}
          </div>
        )}
        
        {owners.length === 0 && business && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No owners added yet</p>
            <p className="text-sm text-gray-400">Add directors and owners to build the ownership structure</p>
          </div>
        )}
      </div>
    </div>
  );
}; 