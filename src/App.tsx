import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Owner, Region, Business, RegionRequirements, RequiredOwner } from './types';
import { getRegions } from './data/regions';
import { calculateRequiredOwners, validateOwnershipStructure } from './utils/ownershipCalculator';
import { getBusinessTypeRequirements } from './utils/yamlLoader';
import { RegionSelector } from './components/RegionSelector';
import { BusinessForm } from './components/BusinessForm';
import { BusinessSummary } from './components/BusinessSummary';
import { OwnerForm } from './components/OwnerForm';
import { OwnerList } from './components/OwnerList';
import { ComplianceSummary } from './components/ComplianceSummary';
import { OwnershipTree } from './components/OwnershipTree';
import { ConfigEditor } from './components/ConfigEditor';
import { GettingStartedModal } from './components/GettingStartedModal';

// Main App Component
function MainApp() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [business, setBusiness] = useState<Business | null>(null);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [businessTypeRequirements, setBusinessTypeRequirements] = useState<RegionRequirements | undefined>(undefined);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showGettingStarted, setShowGettingStarted] = useState(true);
  const [addingToOrganization, setAddingToOrganization] = useState<string | null>(null);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const loadedRegions = await getRegions();
        setRegions(loadedRegions);
      } catch (error) {
        console.error('Failed to load regions:', error);
      }
    };

    loadRegions();
  }, []);

  // Load business type requirements when business changes
  useEffect(() => {
    const loadBusinessTypeRequirements = async () => {
      if (business?.region && business?.type) {
        try {
          const requirements = await getBusinessTypeRequirements(business.region, business.type);
          setBusinessTypeRequirements(requirements);
        } catch (error) {
          console.error('Failed to load business type requirements:', error);
          setBusinessTypeRequirements(undefined);
        }
      } else {
        setBusinessTypeRequirements(undefined);
      }
    };

    loadBusinessTypeRequirements();
  }, [business]);

  const currentRegion = useMemo(() => 
    regions.find(r => r.code === selectedRegion) || null, 
    [selectedRegion, regions]
  );

  const { isValid, totalOwnership, errors } = useMemo(() => 
    validateOwnershipStructure(owners, businessTypeRequirements), 
    [owners, businessTypeRequirements]
  );

  const requiredOwners = useMemo(() => 
    currentRegion ? calculateRequiredOwners(owners, currentRegion, businessTypeRequirements) : [], 
    [owners, currentRegion, businessTypeRequirements]
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

  const handleRemoveOwner = (id: string) => {
    setOwners(prev => prev.filter(owner => owner.id !== id));
  };

  const handleAddOwnerToOrganization = (organizationId: string) => {
    setAddingToOrganization(organizationId);
  };

  const handleAddOwner = (ownerData: Omit<Owner, 'id' | 'isRequired' | 'region'>) => {
    const newOwner: Owner = {
      ...ownerData,
      id: Date.now().toString(),
      isRequired: false,
      region: selectedRegion,
    } as Owner;

    if (addingToOrganization) {
      // Add owner to a specific organization
      setOwners(prev => prev.map(owner => {
        if (owner.id === addingToOrganization && 'owners' in owner) {
          return {
            ...owner,
            owners: [...(owner.owners || []), newOwner]
          };
        }
        return owner;
      }));
      setAddingToOrganization(null);
    } else {
      // Add owner to the main business
      setOwners(prev => [...prev, newOwner]);
    }
  };

  const handleToggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const canAddOwners = selectedRegion && !showBusinessForm && (business || !showBusinessForm);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Floating Configuration Editor Button */}
        <div className="fixed top-8 right-8 z-50">
          <Link
            to="/editor"
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-xl"
            title="Configuration Editor"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Config</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <BusinessForm
                  region={selectedRegion}
                  onSaveBusiness={handleSaveBusiness}
                  onSkip={handleSkipBusiness}
                />
              </div>
            )}

            {/* Business Summary */}
            {business && !showBusinessForm && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <BusinessSummary
                  business={business}
                  onEdit={handleEditBusiness}
                />
              </div>
            )}

            {/* Owner Form */}
            {canAddOwners && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <OwnerForm
                  onAddOwner={handleAddOwner}
                  currentOwners={owners}
                  totalOwnership={totalOwnership}
                  businessType={business?.type}
                  region={selectedRegion}
                  addingToOrganization={addingToOrganization}
                  organizationName={addingToOrganization ? owners.find(o => o.id === addingToOrganization)?.name : undefined}
                />
              </div>
            )}

            {/* Owner List */}
            {owners.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <OwnerList
                  owners={owners}
                  onRemoveOwner={handleRemoveOwner}
                  onAddOwnerToOrganization={handleAddOwnerToOrganization}
                  requiredOwners={requiredOwners}
                />
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ownership Tree */}
            {owners.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <OwnershipTree
                  business={business}
                  owners={owners}
                  expandedNodes={expandedNodes}
                  onToggleNode={handleToggleNode}
                  onAddOwnerToOrganization={handleAddOwnerToOrganization}
                />
              </div>
            )}

            {/* Compliance Summary */}
            {requiredOwners.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <ComplianceSummary
                  requiredOwners={requiredOwners}
                  totalOwners={owners.length}
                  region={currentRegion}
                  businessTypeRequirements={businessTypeRequirements}
                  isValid={isValid}
                  errors={errors}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Getting Started Modal */}
      <GettingStartedModal
        isOpen={showGettingStarted}
        onClose={() => setShowGettingStarted(false)}
      />
    </div>
  );
}

// Editor Component
function EditorApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuration Editor</h1>
          <Link
            to="/"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Main App
          </Link>
        </div>
        <ConfigEditor />
      </div>
    </div>
  );
}

// Main App Component with Routing
function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/editor" element={<EditorApp />} />
    </Routes>
  );
}

export default App; 