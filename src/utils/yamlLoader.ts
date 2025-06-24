import { Region } from '../types';
import * as yaml from 'js-yaml';

// Cache for loaded region configurations
let regionConfigs: Record<string, Region> | null = null;

// Parse YAML configurations
const parseYamlConfig = (yamlContent: string): Region => {
  try {
    const parsed = yaml.load(yamlContent) as Region;
    return parsed;
  } catch (error) {
    console.error('Error parsing YAML configuration:', error);
    throw new Error('Invalid YAML configuration');
  }
};

// Load YAML file content
const loadYamlFile = async (regionCode: string): Promise<string> => {
  try {
    const response = await fetch(`/src/config/regions/${regionCode.toLowerCase()}.yaml`);
    if (!response.ok) {
      throw new Error(`Failed to load ${regionCode} configuration`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading ${regionCode} configuration:`, error);
    throw error;
  }
};

// Initialize region configurations
const initializeRegionConfigs = async (): Promise<Record<string, Region>> => {
  if (regionConfigs) {
    return regionConfigs;
  }

  const regions = ['us', 'uk', 'eu', 'ca', 'au', 'hk', 'jp', 'sg'];
  const configs: Record<string, Region> = {};

  for (const region of regions) {
    try {
      const yamlContent = await loadYamlFile(region);
      const config = parseYamlConfig(yamlContent);
      configs[region.toUpperCase()] = config;
    } catch (error) {
      console.error(`Failed to load ${region} configuration:`, error);
    }
  }

  regionConfigs = configs;
  return configs;
};

/**
 * Load a specific region configuration by region code
 * @param regionCode - The region code (e.g., 'US', 'UK', 'EU')
 * @returns The region configuration or null if not found
 */
export async function loadRegionConfig(regionCode: string): Promise<Region | null> {
  const configs = await initializeRegionConfigs();
  return configs[regionCode.toUpperCase()] || null;
}

/**
 * Get all available regions
 * @returns Array of all region configurations
 */
export async function getAllRegions(): Promise<Region[]> {
  const configs = await initializeRegionConfigs();
  return Object.values(configs);
}

/**
 * Get available business types for a specific region
 * @param regionCode - The region code
 * @returns Array of available business types or empty array if region not found
 */
export async function getAvailableBusinessTypes(regionCode: string) {
  const region = await loadRegionConfig(regionCode);
  return region?.businessTypes.filter(type => type.available) || [];
}

/**
 * Get requirements for a specific business type in a region
 * Falls back to region-level requirements if business-type-specific requirements are not defined
 * @param regionCode - The region code
 * @param businessTypeCode - The business type code
 * @returns The requirements object or undefined if region/business type not found
 */
export async function getBusinessTypeRequirements(regionCode: string, businessTypeCode: string) {
  const region = await loadRegionConfig(regionCode);
  if (!region) return undefined;

  const businessType = region.businessTypes.find(type => type.code === businessTypeCode);
  if (!businessType) return undefined;

  // Return business-type-specific requirements if available, otherwise fall back to region requirements
  return businessType.requirements || region.requirements;
} 