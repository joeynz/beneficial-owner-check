export interface Owner {
  id: string;
  name: string;
  roles: ('director' | 'shareholder')[];
  ownershipPercentage: number;
  isRequired: boolean;
  region: string;
}

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
}

export interface RegionRequirements {
  directors: {
    required: boolean;
    description: string;
  };
  shareholders: {
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