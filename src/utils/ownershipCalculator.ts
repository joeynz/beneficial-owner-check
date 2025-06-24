import { Owner, Region } from '../types';

export function calculateRequiredOwners(owners: Owner[], region: Region): Owner[] {
  const requiredOwners: Owner[] = [];
  
  // Always include directors if required by region
  if (region.requirements.directors.required) {
    const directors = owners.filter(owner => owner.roles.includes('director'));
    requiredOwners.push(...directors);
  }
  
  // Include shareholders above threshold (these are beneficial owners)
  const thresholdOwners = owners.filter(owner => 
    owner.roles.includes('shareholder') &&
    owner.ownershipPercentage >= region.threshold
  );
  
  requiredOwners.push(...thresholdOwners);
  
  // Remove duplicates (in case someone is both director and shareholder)
  const uniqueOwners = requiredOwners.filter((owner, index, self) => 
    index === self.findIndex(o => o.id === owner.id)
  );
  
  return uniqueOwners;
}

export function validateOwnershipStructure(owners: Owner[]): {
  isValid: boolean;
  totalOwnership: number;
  errors: string[];
} {
  const errors: string[] = [];
  const totalOwnership = owners.reduce((sum, owner) => sum + owner.ownershipPercentage, 0);
  
  if (totalOwnership > 100) {
    errors.push('Total ownership percentage cannot exceed 100%');
  }
  
  if (owners.length === 0) {
    errors.push('At least one owner must be added');
  }
  
  const hasDirectors = owners.some(owner => owner.roles.includes('director'));
  if (!hasDirectors) {
    errors.push('At least one director is required');
  }
  
  return {
    isValid: errors.length === 0,
    totalOwnership,
    errors,
  };
} 