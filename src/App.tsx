import React, { useState, useMemo } from 'react';
import { Owner, Region, Business } from './types';
import { regions } from './data/regions';
import { calculateRequiredOwners, validateOwnershipStructure } from './utils/ownershipCalculator';
import { RegionSelector } from './components/RegionSelector';
import { BusinessForm } from './components/BusinessForm';
import { BusinessSummary } from './components/BusinessSummary';
import { OwnerForm } from './components/OwnerForm';
import { OwnerList } from './components/OwnerList';
import { ComplianceSummary } from './components/ComplianceSummary';

function App() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [business, setBusiness] = useState<Business | null>(null);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);

  const currentRegion = useMemo(() => 
    regions.find(r => r.code === selectedRegion) || null, 
    [selectedRegion]
  );

  const { isValid, totalOwnership, errors } = useMemo(() => 
    validateOwnershipStructure(owners), 
    [owners]
  );

  const requiredOwners = useMemo(() => 
    currentRegion ? calculateRequiredOwners(owners, currentRegion) : [], 
    [owners, currentRegion]
  );

  const handleRegionChange = (regionCode: string) => {
    setSelectedRegion(regionCode);
    if (regionCode) {
      setShowBusinessForm(true);
      // Reset business when region changes
      setBusiness(null);
    } else {
      setShowBusinessForm(false);
      setBusiness(null);
    }
  };

  const handleSaveBusiness = (businessData: Omit<Business, 'region'>) => {
    const newBusiness: Business = {
      ...businessData,
      region: selectedRegion,
    };
    setBusiness(newBusiness);
    setShowBusinessForm(false);
  };

  const handleSkipBusiness = () => {
    setShowBusinessForm(false);
  };

  const handleEditBusiness = () => {
    setShowBusinessForm(true);
  };

  const handleAddOwner = (ownerData: Omit<Owner, 'id' | 'isRequired' | 'region'>) => {
    const newOwner: Owner = {
      ...ownerData,
      id: Date.now().toString(),
      isRequired: false,
      region: selectedRegion,
    };
    setOwners(prev => [...prev, newOwner]);
  };

  const handleRemoveOwner = (id: string) => {
    setOwners(prev => prev.filter(owner => owner.id !== id));
  };

  const canAddOwners = selectedRegion && !showBusinessForm && (business || !showBusinessForm);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Beneficial Owner Check
          </h1>
          <p className="text-lg text-gray-600">
            Identify which individuals need to be provided as directors or beneficial owners of your business
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Forms */}
          <div className="space-y-6">
            {/* Region Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <RegionSelector
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
              />
            </div>

            {/* Business Form */}
            {showBusinessForm && (
              <BusinessForm
                region={selectedRegion}
                onSaveBusiness={handleSaveBusiness}
                onSkip={handleSkipBusiness}
              />
            )}

            {/* Owner Form */}
            {canAddOwners && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <OwnerForm onAddOwner={handleAddOwner} />
              </div>
            )}

            {/* Owner List */}
            {canAddOwners && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <OwnerList
                  owners={owners}
                  onRemoveOwner={handleRemoveOwner}
                  requiredOwners={requiredOwners}
                />
              </div>
            )}
          </div>

          {/* Right Column - Summary Information */}
          <div className="space-y-6">
            {/* Business Summary */}
            {business && !showBusinessForm && (
              <BusinessSummary
                business={business}
                onEdit={handleEditBusiness}
              />
            )}

            {/* Compliance Summary */}
            {selectedRegion && !showBusinessForm && (
              <ComplianceSummary
                requiredOwners={requiredOwners}
                totalOwners={owners.length}
                region={currentRegion}
                isValid={isValid}
                errors={errors}
              />
            )}

            {/* Instructions */}
            {!selectedRegion && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Getting Started</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>1. Select your business region to see compliance requirements</p>
                  <p>2. Enter your business details (optional but recommended)</p>
                  <p>3. Add directors, shareholders, and beneficial owners</p>
                  <p>4. Specify ownership percentages for each individual</p>
                  <p>5. Review which individuals must be reported for compliance</p>
                </div>
              </div>
            )}

            {/* Total Ownership Display */}
            {selectedRegion && !showBusinessForm && owners.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ownership Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Ownership:</span>
                    <span className={`font-medium ${totalOwnership > 100 ? 'text-red-600' : 'text-gray-900'}`}>
                      {totalOwnership.toFixed(2)}%
                    </span>
                  </div>
                  {totalOwnership < 100 && (
                    <div className="text-sm text-gray-500">
                      Unallocated: {(100 - totalOwnership).toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 