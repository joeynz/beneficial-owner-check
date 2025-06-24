import React, { useState, useEffect } from 'react';
import { Region } from '../types';
import { getRegions } from '../data/regions';

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (regionCode: string) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegion,
  onRegionChange,
}) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const loadedRegions = await getRegions();
        setRegions(loadedRegions);
      } catch (error) {
        console.error('Failed to load regions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRegions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
            Select Your Business Region
          </label>
          <select
            id="region"
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-gray-100"
          >
            <option>Loading regions...</option>
          </select>
        </div>
      </div>
    );
  }

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
    </div>
  );
}; 