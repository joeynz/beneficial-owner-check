import React, { useState, useEffect } from 'react';
import { PasswordProtection } from './PasswordProtection';
import { ChevronDown, Plus, Trash2, Save } from 'lucide-react';
import * as yaml from 'js-yaml';
import { Combobox } from "./ui/combobox";

interface ConfigEditorProps {}

interface BusinessType {
  code: string;
  name: string;
  description: string;
  available: boolean;
  requirements: {
    directors: { 
      required: boolean; 
      description: string;
      requiredInformation: string[];
    };
    owners: { 
      required: boolean; 
      description: string;
      requiredInformation: string[];
    };
    beneficialOwners: { 
      required: boolean; 
      description: string;
      requiredInformation: string[];
    };
    additionalRequirements: string[];
  };
}

interface RegionConfig {
  code: string;
  name: string;
  threshold: number;
  businessTypes: BusinessType[];
  requirements: {
    directors: { 
      required: boolean; 
      description: string;
      requiredInformation: string[];
    };
    owners: { 
      required: boolean; 
      description: string;
      requiredInformation: string[];
    };
    beneficialOwners: { 
      required: boolean; 
      description: string;
      requiredInformation: string[];
    };
    additionalRequirements: string[];
  };
  notes: string[];
}

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
  { value: 'ssn', label: 'SSN', type: 'ssn' },
];

export const ConfigEditor: React.FC<ConfigEditorProps> = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [config, setConfig] = useState<RegionConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'businessTypes'>('general');

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

  const handlePasswordSubmit = (password: string) => {
    if (password === 'shopifymerchantverification') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const loadYamlFile = async (regionCode: string) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`http://localhost:3001/api/config/${regionCode}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${regionCode}.yaml`);
      }
      const result = await response.json();
      
      if (result.success && result.config) {
        // Parse the config and ensure it has the required structure
        const parsedConfig = parseYamlContent(result.config);
        setConfig(parsedConfig);
        setSelectedRegion(regionCode);
      } else {
        throw new Error(`Invalid response for ${regionCode}.yaml`);
      }
    } catch (error) {
      console.error('Error loading YAML file:', error);
      setMessage({ type: 'error', text: `Failed to load ${regionCode}.yaml` });
    } finally {
      setIsLoading(false);
    }
  };

  const parseYamlContent = (content: string | any): RegionConfig => {
    try {
      let parsed: any;
      
      // If content is already an object (from API), use it directly
      if (typeof content === 'object' && content !== null) {
        parsed = content;
      } else {
        // If content is a string, parse it as YAML
        parsed = yaml.load(content as string);
      }
      
      // Ensure the parsed object has the required structure with defaults
      const config: RegionConfig = {
        code: parsed?.code || '',
        name: parsed?.name || '',
        threshold: parsed?.threshold || 25,
        businessTypes: parsed?.businessTypes || [],
        requirements: {
          directors: {
            required: parsed?.requirements?.directors?.required || false,
            description: parsed?.requirements?.directors?.description || '',
            requiredInformation: parsed?.requirements?.directors?.requiredInformation || []
          },
          owners: {
            required: parsed?.requirements?.owners?.required || false,
            description: parsed?.requirements?.owners?.description || '',
            requiredInformation: parsed?.requirements?.owners?.requiredInformation || []
          },
          beneficialOwners: {
            required: parsed?.requirements?.beneficialOwners?.required || false,
            description: parsed?.requirements?.beneficialOwners?.description || '',
            requiredInformation: parsed?.requirements?.beneficialOwners?.requiredInformation || []
          },
          additionalRequirements: parsed?.requirements?.additionalRequirements || []
        },
        notes: parsed?.notes || []
      };
      
      // Ensure each business type has the required structure
      config.businessTypes = config.businessTypes.map((bt: any) => ({
        code: bt.code || '',
        name: bt.name || '',
        description: bt.description || '',
        available: bt.available !== false,
        requirements: {
          directors: {
            required: bt.requirements?.directors?.required || false,
            description: bt.requirements?.directors?.description || '',
            requiredInformation: bt.requirements?.directors?.requiredInformation || []
          },
          owners: {
            required: bt.requirements?.owners?.required || false,
            description: bt.requirements?.owners?.description || '',
            requiredInformation: bt.requirements?.owners?.requiredInformation || []
          },
          beneficialOwners: {
            required: bt.requirements?.beneficialOwners?.required || false,
            description: bt.requirements?.beneficialOwners?.description || '',
            requiredInformation: bt.requirements?.beneficialOwners?.requiredInformation || []
          },
          additionalRequirements: bt.requirements?.additionalRequirements || []
        }
      }));
      
      return config;
    } catch (error) {
      console.error('Error parsing YAML:', error);
      // Return a default config structure if parsing fails
      return {
        code: '',
        name: '',
        threshold: 25,
        businessTypes: [],
        requirements: {
          directors: { required: false, description: '', requiredInformation: [] },
          owners: { required: false, description: '', requiredInformation: [] },
          beneficialOwners: { required: false, description: '', requiredInformation: [] },
          additionalRequirements: []
        },
        notes: []
      };
    }
  };

  const saveYamlFile = async () => {
    if (!selectedRegion || !config) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regionCode: selectedRegion,
          config: config
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
      } else {
        throw new Error(result.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving YAML file:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to save ${selectedRegion}.yaml: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (updates: Partial<RegionConfig>) => {
    if (config) {
      setConfig({ ...config, ...updates });
    }
  };

  const updateBusinessType = (index: number, updates: Partial<BusinessType>) => {
    if (config) {
      const updatedBusinessTypes = [...config.businessTypes];
      updatedBusinessTypes[index] = { ...updatedBusinessTypes[index], ...updates };
      setConfig({ ...config, businessTypes: updatedBusinessTypes });
    }
  };

  const addBusinessType = () => {
    if (config) {
      const newBusinessType: BusinessType = {
        code: '',
        name: '',
        description: '',
        available: true,
        requirements: {
          directors: { required: false, description: '', requiredInformation: [] },
          owners: { required: false, description: '', requiredInformation: [] },
          beneficialOwners: { required: false, description: '', requiredInformation: [] },
          additionalRequirements: []
        }
      };
      setConfig({
        ...config,
        businessTypes: [...config.businessTypes, newBusinessType]
      });
    }
  };

  const removeBusinessType = (index: number) => {
    if (config) {
      const updatedBusinessTypes = config.businessTypes.filter((_, i) => i !== index);
      setConfig({ ...config, businessTypes: updatedBusinessTypes });
    }
  };

  if (!isAuthenticated) {
    return <PasswordProtection onPasswordSubmit={handlePasswordSubmit} />;
  }

  return (
    <div className="space-y-6">
      {/* Region Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Region Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {regions.map((region) => (
            <button
              key={region.code}
              onClick={() => loadYamlFile(region.code)}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                selectedRegion === region.code
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {region.name}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Editor */}
      {config && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Editing {config.name || selectedRegion.toUpperCase()} Configuration
            </h3>
            <button
              onClick={saveYamlFile}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          
          {message && (
            <div className={`mb-6 p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                General Settings
              </button>
              <button
                onClick={() => setActiveTab('businessTypes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'businessTypes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Business Types
              </button>
            </nav>
          </div>

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region Code
                  </label>
                  <input
                    type="text"
                    value={config.code || ''}
                    onChange={(e) => updateConfig({ code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region Name
                  </label>
                  <input
                    type="text"
                    value={config.name || ''}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ownership Threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.threshold || 25}
                  onChange={(e) => updateConfig({ threshold: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Additional Requirements */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Additional Requirements</h4>
                <div className="space-y-2">
                  {(config.requirements?.additionalRequirements || []).map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => {
                          const updatedRequirements = [...(config.requirements?.additionalRequirements || [])];
                          updatedRequirements[index] = e.target.value;
                          updateConfig({
                            requirements: {
                              ...config.requirements,
                              additionalRequirements: updatedRequirements
                            }
                          });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter additional requirement"
                      />
                      <button
                        onClick={() => {
                          const updatedRequirements = (config.requirements?.additionalRequirements || []).filter((_, i) => i !== index);
                          updateConfig({
                            requirements: {
                              ...config.requirements,
                              additionalRequirements: updatedRequirements
                            }
                          });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updatedRequirements = [...(config.requirements?.additionalRequirements || []), ''];
                      updateConfig({
                        requirements: {
                          ...config.requirements,
                          additionalRequirements: updatedRequirements
                        }
                      });
                    }}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-3 h-3" />
                    Add Requirement
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Notes</h4>
                <div className="space-y-2">
                  {(config.notes || []).map((note, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <textarea
                        value={note}
                        onChange={(e) => {
                          const updatedNotes = [...(config.notes || [])];
                          updatedNotes[index] = e.target.value;
                          updateConfig({ notes: updatedNotes });
                        }}
                        rows={2}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter note"
                      />
                      <button
                        onClick={() => {
                          const updatedNotes = (config.notes || []).filter((_, i) => i !== index);
                          updateConfig({ notes: updatedNotes });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updatedNotes = [...(config.notes || []), ''];
                      updateConfig({ notes: updatedNotes });
                    }}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-3 h-3" />
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Business Types Tab */}
          {activeTab === 'businessTypes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900">Business Types</h4>
                <button
                  onClick={addBusinessType}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Business Type
                </button>
              </div>

              <div className="space-y-4">
                {(config.businessTypes || []).map((businessType, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-gray-900">Business Type {index + 1}</h5>
                      <button
                        onClick={() => removeBusinessType(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Code
                        </label>
                        <input
                          type="text"
                          value={businessType.code || ''}
                          onChange={(e) => updateBusinessType(index, { code: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={businessType.name || ''}
                          onChange={(e) => updateBusinessType(index, { name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={businessType.description || ''}
                        onChange={(e) => updateBusinessType(index, { description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={businessType.available !== false}
                          onChange={(e) => updateBusinessType(index, { available: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Available for selection</span>
                      </label>
                    </div>

                    <div className="space-y-3">
                      <h6 className="text-sm font-medium text-gray-900">Requirements</h6>
                      
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={businessType.requirements?.directors?.required || false}
                            onChange={(e) => updateBusinessType(index, {
                              requirements: {
                                ...businessType.requirements,
                                directors: {
                                  ...businessType.requirements?.directors,
                                  required: e.target.checked
                                }
                              }
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Directors required</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={businessType.requirements?.owners?.required || false}
                            onChange={(e) => updateBusinessType(index, {
                              requirements: {
                                ...businessType.requirements,
                                owners: {
                                  ...businessType.requirements?.owners,
                                  required: e.target.checked
                                }
                              }
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Owners required</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={businessType.requirements?.beneficialOwners?.required || false}
                            onChange={(e) => updateBusinessType(index, {
                              requirements: {
                                ...businessType.requirements,
                                beneficialOwners: {
                                  ...businessType.requirements?.beneficialOwners,
                                  required: e.target.checked
                                }
                              }
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Beneficial owners required</span>
                        </label>
                      </div>

                      {/* Requirement Descriptions */}
                      <div className="space-y-3 mt-4">
                        <h6 className="text-sm font-medium text-gray-900">Requirement Descriptions</h6>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Directors Description
                          </label>
                          <textarea
                            value={businessType.requirements?.directors?.description || ''}
                            onChange={(e) => updateBusinessType(index, {
                              requirements: {
                                ...businessType.requirements,
                                directors: {
                                  ...businessType.requirements?.directors,
                                  description: e.target.value
                                }
                              }
                            })}
                            rows={2}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Directors requirement description"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Owners Description
                          </label>
                          <textarea
                            value={businessType.requirements?.owners?.description || ''}
                            onChange={(e) => updateBusinessType(index, {
                              requirements: {
                                ...businessType.requirements,
                                owners: {
                                  ...businessType.requirements?.owners,
                                  description: e.target.value
                                }
                              }
                            })}
                            rows={2}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Owners requirement description"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Beneficial Owners Description
                          </label>
                          <textarea
                            value={businessType.requirements?.beneficialOwners?.description || ''}
                            onChange={(e) => updateBusinessType(index, {
                              requirements: {
                                ...businessType.requirements,
                                beneficialOwners: {
                                  ...businessType.requirements?.beneficialOwners,
                                  description: e.target.value
                                }
                              }
                            })}
                            rows={2}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Beneficial owners requirement description"
                          />
                        </div>
                      </div>

                      {/* Required Information */}
                      <div className="space-y-3 mt-4">
                        <h6 className="text-sm font-medium text-gray-900">Required Information</h6>
                        {/* Directors Required Information */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Directors Required Information
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {(businessType.requirements?.directors?.requiredInformation || []).map((info, infoIndex) => {
                              const req = AVAILABLE_REQUIREMENTS.find(r => r.value === info);
                              if (!req) return null;
                              return (
                                <span key={info} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                  {req.label}
                                  <button
                                    type="button"
                                    className="ml-1 text-blue-600 hover:text-red-600 focus:outline-none"
                                    onClick={() => {
                                      const updatedInfo = (businessType.requirements?.directors?.requiredInformation || []).filter((_, i) => i !== infoIndex);
                                      updateBusinessType(index, {
                                        requirements: {
                                          ...businessType.requirements,
                                          directors: {
                                            ...businessType.requirements?.directors,
                                            requiredInformation: updatedInfo
                                          }
                                        }
                                      });
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                          <Combobox
                            options={AVAILABLE_REQUIREMENTS.filter(opt => !(businessType.requirements?.directors?.requiredInformation || []).includes(opt.value))}
                            value={""}
                            onChange={(val) => {
                              if (!val) return;
                              if ((businessType.requirements?.directors?.requiredInformation || []).includes(val)) return;
                              const updatedInfo = [...(businessType.requirements?.directors?.requiredInformation || []), val];
                              updateBusinessType(index, {
                                requirements: {
                                  ...businessType.requirements,
                                  directors: {
                                    ...businessType.requirements?.directors,
                                    requiredInformation: updatedInfo
                                  }
                                }
                              });
                            }}
                            placeholder="Add requirement..."
                          />
                        </div>
                        {/* Owners Required Information */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Owners Required Information
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {(businessType.requirements?.owners?.requiredInformation || []).map((info, infoIndex) => {
                              const req = AVAILABLE_REQUIREMENTS.find(r => r.value === info);
                              if (!req) return null;
                              return (
                                <span key={info} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                  {req.label}
                                  <button
                                    type="button"
                                    className="ml-1 text-blue-600 hover:text-red-600 focus:outline-none"
                                    onClick={() => {
                                      const updatedInfo = (businessType.requirements?.owners?.requiredInformation || []).filter((_, i) => i !== infoIndex);
                                      updateBusinessType(index, {
                                        requirements: {
                                          ...businessType.requirements,
                                          owners: {
                                            ...businessType.requirements?.owners,
                                            requiredInformation: updatedInfo
                                          }
                                        }
                                      });
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                          <Combobox
                            options={AVAILABLE_REQUIREMENTS.filter(opt => !(businessType.requirements?.owners?.requiredInformation || []).includes(opt.value))}
                            value={""}
                            onChange={(val) => {
                              if (!val) return;
                              if ((businessType.requirements?.owners?.requiredInformation || []).includes(val)) return;
                              const updatedInfo = [...(businessType.requirements?.owners?.requiredInformation || []), val];
                              updateBusinessType(index, {
                                requirements: {
                                  ...businessType.requirements,
                                  owners: {
                                    ...businessType.requirements?.owners,
                                    requiredInformation: updatedInfo
                                  }
                                }
                              });
                            }}
                            placeholder="Add requirement..."
                          />
                        </div>
                        {/* Beneficial Owners Required Information */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Beneficial Owners Required Information
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {(businessType.requirements?.beneficialOwners?.requiredInformation || []).map((info, infoIndex) => {
                              const req = AVAILABLE_REQUIREMENTS.find(r => r.value === info);
                              if (!req) return null;
                              return (
                                <span key={info} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                  {req.label}
                                  <button
                                    type="button"
                                    className="ml-1 text-blue-600 hover:text-red-600 focus:outline-none"
                                    onClick={() => {
                                      const updatedInfo = (businessType.requirements?.beneficialOwners?.requiredInformation || []).filter((_, i) => i !== infoIndex);
                                      updateBusinessType(index, {
                                        requirements: {
                                          ...businessType.requirements,
                                          beneficialOwners: {
                                            ...businessType.requirements?.beneficialOwners,
                                            requiredInformation: updatedInfo
                                          }
                                        }
                                      });
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                          <Combobox
                            options={AVAILABLE_REQUIREMENTS.filter(opt => !(businessType.requirements?.beneficialOwners?.requiredInformation || []).includes(opt.value))}
                            value={""}
                            onChange={(val) => {
                              if (!val) return;
                              if ((businessType.requirements?.beneficialOwners?.requiredInformation || []).includes(val)) return;
                              const updatedInfo = [...(businessType.requirements?.beneficialOwners?.requiredInformation || []), val];
                              updateBusinessType(index, {
                                requirements: {
                                  ...businessType.requirements,
                                  beneficialOwners: {
                                    ...businessType.requirements?.beneficialOwners,
                                    requiredInformation: updatedInfo
                                  }
                                }
                              });
                            }}
                            placeholder="Add requirement..."
                          />
                        </div>
                      </div>

                      {/* Additional Requirements for Business Type */}
                      <div className="space-y-2 mt-4">
                        <h6 className="text-sm font-medium text-gray-900">Additional Requirements</h6>
                        {(businessType.requirements?.additionalRequirements || []).map((requirement, reqIndex) => (
                          <div key={reqIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={requirement}
                              onChange={(e) => {
                                const updatedRequirements = [...(businessType.requirements?.additionalRequirements || [])];
                                updatedRequirements[reqIndex] = e.target.value;
                                updateBusinessType(index, {
                                  requirements: {
                                    ...businessType.requirements,
                                    additionalRequirements: updatedRequirements
                                  }
                                });
                              }}
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter additional requirement"
                            />
                            <button
                              onClick={() => {
                                const updatedRequirements = (businessType.requirements?.additionalRequirements || []).filter((_, i) => i !== reqIndex);
                                updateBusinessType(index, {
                                  requirements: {
                                    ...businessType.requirements,
                                    additionalRequirements: updatedRequirements
                                  }
                                });
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const updatedRequirements = [...(businessType.requirements?.additionalRequirements || []), ''];
                            updateBusinessType(index, {
                              requirements: {
                                ...businessType.requirements,
                                additionalRequirements: updatedRequirements
                              }
                            });
                          }}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <Plus className="w-3 h-3" />
                          Add Requirement
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!selectedRegion && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration Editor</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>1. <strong>Select a region</strong> from the buttons above to load its configuration</p>
            <p>2. <strong>Edit settings</strong> using the form controls in the tabs</p>
            <p>3. <strong>Save your changes</strong> using the Save Changes button</p>
            <p className="text-xs text-gray-500 mt-4">
              <strong>Warning:</strong> This editor allows modification of compliance requirements. Ensure changes are accurate and comply with regulatory standards.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 