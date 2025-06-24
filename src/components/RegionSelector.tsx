import React from 'react';
import { Region } from '../types';
import { regions } from '../data/regions';

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (regionCode: string) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegion,
  onRegionChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
          Select Your Business Region
        </label>
        <select
          id="region"
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select a region...</option>
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>
      </div>
      
      {selectedRegion && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Compliance Requirements for {regions.find(r => r.code === selectedRegion)?.name}
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Beneficial ownership threshold: {regions.find(r => r.code === selectedRegion)?.threshold}%</p>
            <p>• Directors must be reported: {regions.find(r => r.code === selectedRegion)?.requirements.directors.required ? 'Yes' : 'No'}</p>
            <p>• Shareholders must be reported: {regions.find(r => r.code === selectedRegion)?.requirements.shareholders.required ? 'Yes' : 'No'}</p>
            <p>• Beneficial owners must be reported: {regions.find(r => r.code === selectedRegion)?.requirements.beneficialOwners.required ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 