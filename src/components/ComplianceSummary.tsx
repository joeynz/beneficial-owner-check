import React from 'react';
import { Owner, Region, RegionRequirements, RequiredOwner } from '../types';
import { Shield, Users, AlertTriangle } from 'lucide-react';

interface ComplianceSummaryProps {
  requiredOwners: RequiredOwner[];
  totalOwners: number;
  region: Region | null;
  businessTypeRequirements?: RegionRequirements;
  isValid: boolean;
  errors: string[];
}

export const ComplianceSummary: React.FC<ComplianceSummaryProps> = ({
  requiredOwners,
  totalOwners,
  region,
  businessTypeRequirements,
  isValid,
  errors,
}) => {
  if (!region) {
    return null;
  }

  const requirements = businessTypeRequirements || region.requirements;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-medium text-gray-900">Compliance Summary</h3>
        </div>

        {!isValid && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-red-800">Issues Found</h4>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{totalOwners}</div>
            <div className="text-sm text-gray-600">Total Owners</div>
          </div>
          <div className="text-center p-3 bg-warning-50 rounded-lg">
            <div className="text-2xl font-bold text-warning-600">{requiredOwners.length}</div>
            <div className="text-sm text-warning-700">Required for Compliance</div>
          </div>
          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">{region.threshold}%</div>
            <div className="text-sm text-primary-700">Ownership Threshold</div>
          </div>
        </div>

        {/* Requirements Summary */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Compliance Requirements</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Directors must be reported: {requirements.directors.required ? 'Yes' : 'No'}</p>
            <p>• Owners must be reported: {requirements.owners.required ? 'Yes' : 'No'}</p>
            <p>• Beneficial owners must be reported: {requirements.beneficialOwners.required ? 'Yes' : 'No'}</p>
            {businessTypeRequirements && (
              <p className="text-xs text-blue-600 mt-2">
                <em>Requirements specific to your business type</em>
              </p>
            )}
          </div>
        </div>

        {requiredOwners.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-warning-600" />
              <h4 className="font-medium text-gray-900">Individuals Required for Reporting</h4>
            </div>
            <div className="space-y-2">
              {requiredOwners.map((requiredOwner) => (
                <div
                  key={requiredOwner.owner.id}
                  className="flex items-center justify-between p-3 bg-warning-50 border border-warning-200 rounded-md"
                >
                  <div>
                    <div className="font-medium text-gray-900">{requiredOwner.owner.name}</div>
                    <div className="text-sm text-gray-600">
                      <span className="flex flex-wrap gap-1 mt-1">
                        {requiredOwner.owner.roles.map((role) => (
                          <span
                            key={role}
                            className="px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-800"
                          >
                            {role.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </span>
                        ))}
                      </span>
                      {requiredOwner.effectiveOwnership > 0 && (
                        <div className="mt-1">
                          {requiredOwner.effectiveOwnership.toFixed(2)}% effective ownership
                          {requiredOwner.reason === 'beneficial-owner' && (
                            <span className="text-xs text-gray-500 ml-1">
                              (through corporate structure)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-warning-700 bg-warning-100 px-2 py-1 rounded">
                    {requiredOwner.reason === 'director' ? 'Director' : 'Beneficial Owner'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isValid && requiredOwners.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p>No individuals currently meet the reporting requirements.</p>
          </div>
        )}
      </div>
    </div>
  );
}; 