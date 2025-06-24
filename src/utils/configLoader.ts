import yaml from 'js-yaml';

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
    // Load individual configuration files
    const requirementsResponse = await fetch('/src/config/requirements.yaml');
    const businessTypesResponse = await fetch('/src/config/business-types.yaml');
    const regionsResponse = await fetch('/src/config/regions.yaml');
    const relationshipsResponse = await fetch('/src/config/relationships.yaml');

    const requirementsText = await requirementsResponse.text();
    const businessTypesText = await businessTypesResponse.text();
    const regionsText = await regionsResponse.text();
    const relationshipsText = await relationshipsResponse.text();

    const requirements = yaml.load(requirementsText) as any;
    const businessTypes = yaml.load(businessTypesText) as any;
    const regions = yaml.load(regionsText) as any;
    const relationships = yaml.load(relationshipsText) as any;

    // Merge configurations
    const config: Configuration = {
      requirements: requirements.requirements,
      roles: requirements.roles,
      roleCategories: requirements.roleCategories,
      informationFields: requirements.informationFields,
      additionalRequirements: requirements.additionalRequirements,
      businessTypes: businessTypes.businessTypes,
      regions: regions.regions,
      regionBusinessTypes: relationships.regionBusinessTypes,
      businessTypeRequirements: relationships.businessTypeRequirements,
      defaultRequirements: relationships.defaultRequirements,
    };

    configCache = config;
    return config;
  } catch (error) {
    console.error('Failed to load configuration:', error);
    throw new Error('Failed to load configuration files');
  }
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