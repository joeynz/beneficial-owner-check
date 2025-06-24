export type OwnerType = 'individual' | 'company' | 'trust' | 'organization';

export interface BaseOwner {
  id: string;
  name: string;
  roles: ('director' | 'owner')[];
  ownershipPercentage: number;
  isRequired: boolean;
  region: string;
  ownerType: OwnerType;
}

export interface IndividualOwner extends BaseOwner {
  ownerType: 'individual';
}

export interface EntityOwner extends BaseOwner {
  ownerType: 'company' | 'trust' | 'organization';
  entityType: string;
  registrationNumber?: string;
  jurisdiction?: string;
  owners: Owner[]; // Nested owners of this entity
}

export type Owner = IndividualOwner | EntityOwner;

export interface Business {
  name: string;
  type: string; // Now dynamic based on region configuration
  region: string;
}

export interface BusinessType {
  code: string;
  name: string;
  description: string;
  available: boolean;
  requirements?: RegionRequirements;
}

export interface RegionRequirements {
  directors: {
    required: boolean;
    description: string;
  };
  owners: {
    required: boolean;
    description: string;
  };
  beneficialOwners: {
    required: boolean;
    description: string;
  };
  additionalRequirements: string[];
}

export interface Region {
  code: string;
  name: string;
  threshold: number; // Percentage threshold for beneficial ownership reporting
  businessTypes: BusinessType[];
  requirements: RegionRequirements;
  notes: string[];
}

export interface BusinessStructure {
  owners: Owner[];
  totalOwnership: number;
  region: string;
}

export interface RequiredOwner {
  owner: Owner;
  effectiveOwnership: number;
  reason: 'director' | 'beneficial-owner';
} 