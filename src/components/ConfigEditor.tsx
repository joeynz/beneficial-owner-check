import React, { useState, useEffect } from 'react';
import { PasswordProtection } from './PasswordProtection';
import { ChevronDown, Plus, Trash2, Save } from 'lucide-react';
import * as yaml from 'js-yaml';
import { Combobox } from "./ui/combobox";
import { 
  loadConfiguration, 
  getRegion, 
  getBusinessType, 
  getAllRoles, 
  getInformationFields,
  getAdditionalRequirements,
  type Configuration,
  type Region,
  type BusinessType,
  type Role,
  type InformationField
} from '../utils/configLoader';

interface ConfigEditorProps {}

// Predefined list of available requirements with field types
const AVAILABLE_REQUIREMENTS = [
  { value: 'first_name', label: 'First Name', type: 'text' },
  { value: 'last_name', label: 'Last Name', type: 'text' },
  { value: 'phone_number', label: 'Phone Number', type: 'phone' },
  { value: 'email_address', label: 'Email Address', type: 'email' },
  { value: 'home_address', label: 'Home Address', type: 'address' },
  { value: 'nationality', label: 'Nationality', type: 'select' },
  { value: 'aliases', label: 'Aliases', type: 'multiple_text' },
  { value: 'personal_tin', label: 'Personal TIN', type: 'tin' },
  { value: 'job_title', label: 'Job Title', type: 'text' },
  { value: 'date_of_birth', label: 'Date of Birth', type: 'date' },
];

export const ConfigEditor: React.FC<ConfigEditorProps> = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [config, setConfig] = useState<Configuration | null>(null);
  const [regionConfig, setRegionConfig] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'businessTypes' | 'roles' | 'requirements'>('general');
  const [roles, setRoles] = useState<Role[]>([]);
  const [informationFields, setInformationFields] = useState<Record<string, InformationField>>({});
  const [additionalRequirements, setAdditionalRequirements] = useState<Record<string, any>>({});

  const regions = [
    { code: 'us', name: 'United States' },
    { code: 'uk', name: 'United Kingdom' },
    { code: 'ca', name: 'Canada' },
    { code: 'au', name: 'Australia' },
    { code: 'eu', name: 'European Union' },
    { code: 'hk', name: 'Hong Kong' },
    { code: 'jp', name: 'Japan' },
    { code: 'sg', name: 'Singapore' },
  ];

  // Load configuration on component mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const fullConfig = await loadConfiguration();
        setConfig(fullConfig);
        
        const allRoles = await getAllRoles();
        setRoles(allRoles);
        
        const fields = await getInformationFields();
        setInformationFields(fields);
        
        const additional = await getAdditionalRequirements();
        setAdditionalRequirements(additional);
      } catch (error) {
        console.error('Failed to load configuration:', error);
        setMessage({ type: 'error', text: 'Failed to load configuration' });
      }
    };

    if (isAuthenticated) {
      loadConfig();
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (password: string) => {
    if (password === 'shopifymerchantverification') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const loadRegionConfig = async (regionCode: string) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const region = await getRegion(regionCode.toUpperCase());
      if (region) {
        setRegionConfig(region);
        setSelectedRegion(regionCode);
      } else {
        throw new Error(`Region ${regionCode} not found`);
      }
    } catch (error) {
      console.error('Error loading region config:', error);
      setMessage({ type: 'error', text: `Failed to load ${regionCode} configuration` });
    } finally {
      setIsLoading(false);
    }
  };

  const saveRegionConfig = async () => {
    if (!regionConfig) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`http://localhost:3001/api/config/${selectedRegion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: regionConfig
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: `${selectedRegion.toUpperCase()} configuration saved successfully` });
      } else {
        throw new Error(result.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRegionField = (field: keyof Region, value: any) => {
    if (!regionConfig) return;
    setRegionConfig({
      ...regionConfig,
      [field]: value
    });
  };

  const getFieldLabel = (fieldCode: string): string => {
    return informationFields[fieldCode]?.name || fieldCode;
  };

  const getRequirementLabel = (reqCode: string): string => {
    return additionalRequirements[reqCode]?.name || reqCode;
  };

  if (!isAuthenticated) {
    return <PasswordProtection onPasswordSubmit={handlePasswordSubmit} />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Configuration Editor</h1>
          <p className="text-gray-600 mt-2">
            Edit region configurations, business types, roles, and requirements
          </p>
        </div>

        {/* Region Selector */}
        <div className="p-6 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Region
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => loadRegionConfig(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Choose a region...</option>
            {regions.map((region) => (
              <option key={region.code} value={region.code}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'general', label: 'General' },
              { id: 'businessTypes', label: 'Business Types' },
              { id: 'roles', label: 'Roles' },
              { id: 'requirements', label: 'Requirements' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading configuration...</div>
            </div>
          )}

          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {!selectedRegion && !isLoading && (
            <div className="text-center py-8">
              <div className="text-gray-500">Select a region to edit its configuration</div>
            </div>
          )}

          {selectedRegion && regionConfig && !isLoading && (
            <>
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region Name
                    </label>
                    <input
                      type="text"
                      value={regionConfig.name}
                      onChange={(e) => updateRegionField('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={regionConfig.description}
                      onChange={(e) => updateRegionField('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ownership Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={regionConfig.threshold}
                      onChange={(e) => updateRegionField('threshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={regionConfig.currency}
                      onChange={(e) => updateRegionField('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={regionConfig.notes}
                      onChange={(e) => updateRegionField('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}

              {/* Business Types Tab */}
              {activeTab === 'businessTypes' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Available Business Types</h3>
                    {/* Grouped business types */}
                    {(() => {
                      if (!config?.businessTypes) return null;
                      // Group business types by category
                      const groups = {
                        individual: [] as [string, any][],
                        registered: [] as [string, any][],
                        nonprofit: [] as [string, any][]
                      };
                      Object.entries(config.businessTypes).forEach(([code, businessType]) => {
                        // Special case: move 'sole_proprietorship' to registered, and 'registered_charity' to nonprofit
                        if (code === 'sole_proprietorship') {
                          groups.registered.push([code, businessType]);
                        } else if (code === 'registered_charity') {
                          groups.nonprofit.push([code, businessType]);
                        } else {
                          switch (businessType.category) {
                            case 'individual':
                              groups.individual.push([code, businessType]);
                              break;
                            case 'nonprofit':
                              groups.nonprofit.push([code, businessType]);
                              break;
                            case 'corporate':
                            case 'llc':
                            case 'partnership':
                            case 'trust':
                            case 'cooperative':
                            default:
                              groups.registered.push([code, businessType]);
                          }
                        }
                      });
                      return (
                        <>
                          {/* Unregistered Individual */}
                          {groups.individual.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-md font-semibold text-gray-700 mb-2">Unregistered Individual</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {groups.individual.map(([code, businessType]) => (
                                  <div key={code} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium text-gray-900">{businessType.name}</h5>
                                      <input
                                        type="checkbox"
                                        checked={regionConfig.availableBusinessTypes.includes(code)}
                                        onChange={(e) => {
                                          const updatedTypes = e.target.checked
                                            ? [...regionConfig.availableBusinessTypes, code]
                                            : regionConfig.availableBusinessTypes.filter(t => t !== code);
                                          updateRegionField('availableBusinessTypes', updatedTypes);
                                        }}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                      />
                                    </div>
                                    <p className="text-sm text-gray-600">{businessType.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Registered Business */}
                          {groups.registered.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-md font-semibold text-gray-700 mb-2">Registered Business</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {groups.registered.map(([code, businessType]) => (
                                  <div key={code} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium text-gray-900">{businessType.name}</h5>
                                      <input
                                        type="checkbox"
                                        checked={regionConfig.availableBusinessTypes.includes(code)}
                                        onChange={(e) => {
                                          const updatedTypes = e.target.checked
                                            ? [...regionConfig.availableBusinessTypes, code]
                                            : regionConfig.availableBusinessTypes.filter(t => t !== code);
                                          updateRegionField('availableBusinessTypes', updatedTypes);
                                        }}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                      />
                                    </div>
                                    <p className="text-sm text-gray-600">{businessType.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Non-Profit Entity */}
                          {groups.nonprofit.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-md font-semibold text-gray-700 mb-2">Non-Profit Entity</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {groups.nonprofit.map(([code, businessType]) => (
                                  <div key={code} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium text-gray-900">{businessType.name}</h5>
                                      <input
                                        type="checkbox"
                                        checked={regionConfig.availableBusinessTypes.includes(code)}
                                        onChange={(e) => {
                                          const updatedTypes = e.target.checked
                                            ? [...regionConfig.availableBusinessTypes, code]
                                            : regionConfig.availableBusinessTypes.filter(t => t !== code);
                                          updateRegionField('availableBusinessTypes', updatedTypes);
                                        }}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                      />
                                    </div>
                                    <p className="text-sm text-gray-600">{businessType.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Roles Tab */}
              {activeTab === 'roles' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Role Definitions</h3>
                    <div className="space-y-4">
                      {roles.map((role) => (
                        <div key={role.name} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{role.name}</h4>
                            <span className="text-sm text-gray-500">{role.category}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                          <p className="text-xs text-gray-500 mb-4">{role.notes}</p>
                          
                          {/* Business Type Mappings */}
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Applies to Business Types in {selectedRegion.toUpperCase()}:
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {config?.businessTypes && Object.entries(config.businessTypes)
                                .filter(([code]) => regionConfig.availableBusinessTypes.includes(code))
                                .map(([code, businessType]) => {
                                  const roleMappings = regionConfig.roleMappings || {};
                                  const isSelected = roleMappings[role.name.toLowerCase().replace(/\s+/g, '_')]?.includes(code) || false;
                                  
                                  return (
                                    <label key={code} className="flex items-center space-x-2 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          const roleKey = role.name.toLowerCase().replace(/\s+/g, '_');
                                          const currentMappings = regionConfig.roleMappings || {};
                                          const currentBusinessTypes = currentMappings[roleKey] || [];
                                          
                                          const updatedBusinessTypes = e.target.checked
                                            ? [...currentBusinessTypes, code]
                                            : currentBusinessTypes.filter(bt => bt !== code);
                                          
                                          const updatedMappings = {
                                            ...currentMappings,
                                            [roleKey]: updatedBusinessTypes
                                          };
                                          
                                          updateRegionField('roleMappings', updatedMappings);
                                        }}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                      />
                                      <span className="text-gray-700">{businessType.name}</span>
                                    </label>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Requirements Tab */}
              {activeTab === 'requirements' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Information Fields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(informationFields).map(([code, field]) => (
                        <div key={code} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">{field.name}</h4>
                          <p className="text-sm text-gray-600">{field.description}</p>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {field.type}
                            </span>
                            {field.required && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(additionalRequirements).map(([code, requirement]) => (
                        <div key={code} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900">{requirement.name}</h4>
                          <p className="text-sm text-gray-600">{requirement.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={saveRegionConfig}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 