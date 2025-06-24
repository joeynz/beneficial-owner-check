// Configuration interfaces
export interface InformationField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface Requirement {
  required: boolean;
  description: string;
  requiredInformation: string[];
  additionalRequirements: string[];
  notes?: string;
  matchesRequirements?: string;
  onlyForMainBusiness?: boolean;
}

export interface Role {
  name: string;
  description: string;
  category: string;
  requirements: string;
  appliesTo: string[];
  notes: string;
  autoAssigned?: boolean;
  thresholdBased?: boolean;
  onlyForMainBusiness?: boolean;
}

export interface RoleCategory {
  name: string;
  description: string;
  roles: string[];
  requirements: string;
}

export interface BusinessType {
  name: string;
  description: string;
  category: string;
  characteristics: string[];
  defaultRequirements: {
    directors: boolean;
    owners: boolean;
    beneficialOwners: boolean;
  };
  notes: string;
}

export interface Region {
  name: string;
  code: string;
  continent: string;
  currency: string;
  threshold: number;
  description: string;
  characteristics: string[];
  availableBusinessTypes: string[];
  additionalRequirements: string[];
  notes: string;
  roleMappings?: Record<string, string[]>;
}

export interface RegionBusinessTypeMapping {
  availableTypes: string[];
  defaultThreshold: number;
  notes: string;
}

export interface BusinessTypeRequirement {
  directors: Requirement;
  officers: Requirement;
  secretaries: Requirement;
  owners: Requirement;
  beneficialOwners: Requirement;
  representatives: Requirement;
  additionalRequirements: string[];
}

export interface Configuration {
  requirements: {
    directors: Requirement;
    officers: Requirement;
    secretaries: Requirement;
    owners: Requirement;
    beneficialOwners: Requirement;
    representatives: Requirement;
  };
  roles: Record<string, Role>;
  roleCategories: Record<string, RoleCategory>;
  informationFields: Record<string, InformationField>;
  additionalRequirements: Record<string, {
    name: string;
    description: string;
    appliesTo: string[];
  }>;
  businessTypes: Record<string, BusinessType>;
  regions: Record<string, Region>;
  regionBusinessTypes: Record<string, RegionBusinessTypeMapping>;
  businessTypeRequirements: Record<string, Record<string, BusinessTypeRequirement>>;
  defaultRequirements: BusinessTypeRequirement;
}

// Cache for loaded configurations
let configCache: Configuration | null = null;

/**
 * Load all configuration files and merge them into a single configuration object
 */
export async function loadConfiguration(): Promise<Configuration> {
  if (configCache) {
    return configCache;
  }

  try {
    // Load global configuration files via API
    const requirementsResponse = await fetch('http://localhost:3001/api/requirements');
    const businessTypesResponse = await fetch('http://localhost:3001/api/business-types');
    const relationshipsResponse = await fetch('http://localhost:3001/api/relationships');

    if (!requirementsResponse.ok || !businessTypesResponse.ok || !relationshipsResponse.ok) {
      throw new Error('Failed to load configuration from API');
    }

    const requirementsData = await requirementsResponse.json();
    const businessTypesData = await businessTypesResponse.json();
    const relationshipsData = await relationshipsResponse.json();

    if (!requirementsData.success || !businessTypesData.success || !relationshipsData.success) {
      throw new Error('API returned error response');
    }

    const requirements = requirementsData.requirements;
    const businessTypes = businessTypesData.businessTypes;
    const relationships = relationshipsData.relationships;

    // Create regions from the relationships data
    const regions: Record<string, Region> = {};
    const regionBusinessTypes: Record<string, RegionBusinessTypeMapping> = {};
    const businessTypeRequirements: Record<string, Record<string, BusinessTypeRequirement>> = {};

    // Get all region codes from the relationships data
    const regionCodes = Object.keys(relationships.regionBusinessTypes);
    
    for (const regionCode of regionCodes) {
      const regionMapping = relationships.regionBusinessTypes[regionCode];
      
      // Create region metadata
      regions[regionCode] = {
        name: getRegionName(regionCode),
        code: regionCode,
        continent: getContinentFromRegion(regionCode),
        currency: getCurrencyFromRegion(regionCode),
        threshold: regionMapping.defaultThreshold,
        description: getRegionName(regionCode),
        characteristics: getCharacteristicsFromRegion(regionCode),
        availableBusinessTypes: regionMapping.availableTypes,
        additionalRequirements: getAdditionalRequirementsFromRegion(regionCode),
        notes: regionMapping.notes || getNotesFromRegion(regionCode)
      };

      // Create region-business type mapping
      regionBusinessTypes[regionCode] = {
        availableTypes: regionMapping.availableTypes,
        defaultThreshold: regionMapping.defaultThreshold,
        notes: regionMapping.notes || getNotesFromRegion(regionCode)
      };

      // Create business type requirements mapping
      businessTypeRequirements[regionCode] = {};
      
      for (const businessTypeCode of regionMapping.availableTypes) {
        const specificRequirements = relationships.businessTypeRequirements[regionCode]?.[businessTypeCode];
        
        if (specificRequirements) {
          businessTypeRequirements[regionCode][businessTypeCode] = specificRequirements;
        } else {
          // Use default requirements
          businessTypeRequirements[regionCode][businessTypeCode] = relationships.defaultRequirements;
        }
      }
    }

    // Merge configurations
    const config: Configuration = {
      requirements: requirements.requirements,
      roles: requirements.roles,
      roleCategories: requirements.roleCategories,
      informationFields: requirements.informationFields,
      additionalRequirements: requirements.additionalRequirements,
      businessTypes: businessTypes.businessTypes,
      regions,
      regionBusinessTypes: relationships.regionBusinessTypes,
      businessTypeRequirements: relationships.businessTypeRequirements,
      defaultRequirements: relationships.defaultRequirements
    };

    configCache = config;
    return config;
  } catch (error) {
    console.error('Error loading configuration:', error);
    throw new Error('Failed to load configuration');
  }
}

// Helper functions
function getRegionName(regionCode: string): string {
  const regionNames: Record<string, string> = {
    'US': 'United States',
    'UK': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'EU': 'European Union',
    'HK': 'Hong Kong',
    'JP': 'Japan',
    'SG': 'Singapore'
  };
  return regionNames[regionCode] || regionCode;
}

function getContinentFromRegion(regionCode: string): string {
  const continentMap: Record<string, string> = {
    'US': 'North America',
    'CA': 'North America',
    'UK': 'Europe',
    'EU': 'Europe',
    'AU': 'Oceania',
    'HK': 'Asia',
    'JP': 'Asia',
    'SG': 'Asia'
  };
  return continentMap[regionCode] || 'Unknown';
}

function getCurrencyFromRegion(regionCode: string): string {
  const currencyMap: Record<string, string> = {
    'US': 'USD',
    'CA': 'CAD',
    'UK': 'GBP',
    'EU': 'EUR',
    'AU': 'AUD',
    'HK': 'HKD',
    'JP': 'JPY',
    'SG': 'SGD'
  };
  return currencyMap[regionCode] || 'USD';
}

function getCharacteristicsFromRegion(regionCode: string): string[] {
  const characteristicsMap: Record<string, string[]> = {
    'US': ['Common law', 'Federal system', 'Strong financial regulations'],
    'UK': ['Common law', 'Parliamentary system', 'Financial services hub'],
    'EU': ['Civil law', 'Supranational union', 'Harmonized regulations'],
    'CA': ['Common law', 'Parliamentary system', 'Strong banking sector'],
    'AU': ['Common law', 'Parliamentary system', 'Pacific region hub'],
    'HK': ['Common law', 'Special administrative region', 'Financial center'],
    'JP': ['Civil law', 'Constitutional monarchy', 'Advanced economy'],
    'SG': ['Common law', 'Parliamentary republic', 'Financial hub']
  };
  return characteristicsMap[regionCode] || ['Standard business environment'];
}

function getAdditionalRequirementsFromRegion(regionCode: string): string[] {
  const requirementsMap: Record<string, string[]> = {
    'US': ['shopify_payments_kyc', 'financial_services_regulations'],
    'UK': ['shopify_payments_kyc', 'financial_services_regulations', 'anti_money_laundering'],
    'EU': ['shopify_payments_kyc', 'financial_services_regulations', 'anti_money_laundering', 'data_protection'],
    'CA': ['shopify_payments_kyc', 'financial_services_regulations'],
    'AU': ['shopify_payments_kyc', 'financial_services_regulations'],
    'HK': ['shopify_payments_kyc', 'financial_services_regulations'],
    'JP': ['shopify_payments_kyc', 'financial_services_regulations'],
    'SG': ['shopify_payments_kyc', 'financial_services_regulations']
  };
  return requirementsMap[regionCode] || ['shopify_payments_kyc'];
}

function getNotesFromRegion(regionCode: string): string {
  const notesMap: Record<string, string> = {
    'US': 'US has the most comprehensive set of business types available',
    'UK': 'UK has common law business structures',
    'EU': 'EU has civil law business structures',
    'CA': 'Canada has similar business types to US but fewer variations',
    'AU': 'Australia has common law business structures',
    'HK': 'Hong Kong has common law business structures',
    'JP': 'Japan has civil law business structures',
    'SG': 'Singapore has comprehensive business structures'
  };
  return notesMap[regionCode] || 'Standard business environment';
}

/**
 * Get available business types for a specific region
 */
export async function getAvailableBusinessTypes(regionCode: string): Promise<BusinessType[]> {
  const config = await loadConfiguration();
  const regionMapping = config.regionBusinessTypes[regionCode];
  
  if (!regionMapping) {
    return [];
  }

  return regionMapping.availableTypes
    .map(typeCode => config.businessTypes[typeCode])
    .filter(Boolean);
}

/**
 * Get requirements for a specific business type in a specific region
 */
export async function getBusinessTypeRequirements(
  regionCode: string, 
  businessTypeCode: string
): Promise<BusinessTypeRequirement | null> {
  const config = await loadConfiguration();
  
  // Try to get specific requirements for this region/business type combination
  const specificRequirements = config.businessTypeRequirements[regionCode]?.[businessTypeCode];
  
  if (specificRequirements) {
    return specificRequirements;
  }

  // Fall back to default requirements
  return config.defaultRequirements;
}

/**
 * Get all regions
 */
export async function getAllRegions(): Promise<Region[]> {
  const config = await loadConfiguration();
  return Object.values(config.regions);
}

/**
 * Get a specific region by code
 */
export async function getRegion(regionCode: string): Promise<Region | null> {
  const config = await loadConfiguration();
  return config.regions[regionCode] || null;
}

/**
 * Get a specific business type by code
 */
export async function getBusinessType(businessTypeCode: string): Promise<BusinessType | null> {
  const config = await loadConfiguration();
  return config.businessTypes[businessTypeCode] || null;
}

/**
 * Get all roles
 */
export async function getAllRoles(): Promise<Role[]> {
  const config = await loadConfiguration();
  return Object.values(config.roles);
}

/**
 * Get a specific role by code
 */
export async function getRole(roleCode: string): Promise<Role | null> {
  const config = await loadConfiguration();
  return config.roles[roleCode] || null;
}

/**
 * Get roles by category
 */
export async function getRolesByCategory(category: string): Promise<Role[]> {
  const config = await loadConfiguration();
  const roleCategory = config.roleCategories[category];
  
  if (!roleCategory) {
    return [];
  }

  return roleCategory.roles
    .map(roleCode => config.roles[roleCode])
    .filter(Boolean);
}

/**
 * Get available roles for a business type
 */
export async function getAvailableRoles(businessTypeCode: string): Promise<Role[]> {
  const config = await loadConfiguration();
  const businessType = config.businessTypes[businessTypeCode];
  
  if (!businessType) {
    return [];
  }

  return Object.values(config.roles).filter(role => {
    if (role.appliesTo.includes('all')) {
      return true;
    }
    if (role.appliesTo.includes('main_business_only')) {
      return true; // This will be filtered at the UI level
    }
    return role.appliesTo.includes(businessTypeCode);
  });
}

/**
 * Get requirements for a specific role
 */
export async function getRoleRequirements(roleCode: string): Promise<Requirement | null> {
  const config = await loadConfiguration();
  const role = config.roles[roleCode];
  
  if (!role) {
    return null;
  }

  return config.requirements[role.requirements as keyof typeof config.requirements] || null;
}

/**
 * Check if a role is automatically assigned based on ownership threshold
 */
export async function isRoleAutoAssigned(roleCode: string): Promise<boolean> {
  const config = await loadConfiguration();
  const role = config.roles[roleCode];
  
  return role?.autoAssigned || false;
}

/**
 * Check if a role is only available for the main business
 */
export async function isRoleOnlyForMainBusiness(roleCode: string): Promise<boolean> {
  const config = await loadConfiguration();
  const role = config.roles[roleCode];
  
  return role?.onlyForMainBusiness || false;
}

/**
 * Get information field definitions
 */
export async function getInformationFields(): Promise<Record<string, InformationField>> {
  const config = await loadConfiguration();
  return config.informationFields;
}

/**
 * Get additional requirements definitions
 */
export async function getAdditionalRequirements(): Promise<Record<string, {
  name: string;
  description: string;
  appliesTo: string[];
}>> {
  const config = await loadConfiguration();
  return config.additionalRequirements;
}

/**
 * Check if a business type is available in a region
 */
export async function isBusinessTypeAvailable(
  regionCode: string, 
  businessTypeCode: string
): Promise<boolean> {
  const config = await loadConfiguration();
  const regionMapping = config.regionBusinessTypes[regionCode];
  
  if (!regionMapping) {
    return false;
  }

  return regionMapping.availableTypes.includes(businessTypeCode);
}

/**
 * Get the ownership threshold for a region
 */
export async function getOwnershipThreshold(regionCode: string): Promise<number> {
  const config = await loadConfiguration();
  const regionMapping = config.regionBusinessTypes[regionCode];
  
  if (!regionMapping) {
    return 25; // Default threshold
  }

  return regionMapping.defaultThreshold;
}

/**
 * Clear the configuration cache (useful for development)
 */
export function clearConfigurationCache(): void {
  configCache = null;
}