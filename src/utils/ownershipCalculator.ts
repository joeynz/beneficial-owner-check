import { Owner, Region, RegionRequirements, RequiredOwner } from '../types';

// Helper function to calculate effective ownership percentage through ownership chains
function calculateEffectiveOwnership(
  owner: Owner, 
  parentOwnership: number, 
  region: Region,
  visited: Set<string> = new Set()
): { individuals: Array<{ owner: Owner; effectiveOwnership: number }>; totalOwnership: number } {
  const individuals: Array<{ owner: Owner; effectiveOwnership: number }> = [];
  let totalOwnership = 0;
  
  // Prevent infinite loops in case of circular ownership
  if (visited.has(owner.id)) {
    return { individuals, totalOwnership };
  }
  visited.add(owner.id);
  
  if (owner.ownerType === 'individual') {
    // Individual owner - calculate their effective ownership
    const effectiveOwnership = (parentOwnership * owner.ownershipPercentage) / 100;
    individuals.push({ owner, effectiveOwnership });
    totalOwnership += owner.ownershipPercentage;
  } else if ('owners' in owner && owner.owners) {
    // Organization owner - drill down into its owners
    const organizationOwnership = (parentOwnership * owner.ownershipPercentage) / 100;
    
    for (const subOwner of owner.owners) {
      const result = calculateEffectiveOwnership(subOwner, organizationOwnership, region, new Set(visited));
      individuals.push(...result.individuals);
      totalOwnership += result.totalOwnership;
    }
  }
  
  return { individuals, totalOwnership };
}

export function calculateRequiredOwners(owners: Owner[], region: Region, businessTypeRequirements?: RegionRequirements): RequiredOwner[] {
  const requirements = businessTypeRequirements || region.requirements;
  const requiredOwners: RequiredOwner[] = [];
  
  // Always include directors if required by business type or region
  if (requirements.directors.required) {
    const directors = owners.filter(owner => owner.roles.includes('director'));
    requiredOwners.push(...directors.map(owner => ({
      owner,
      effectiveOwnership: 0, // Directors don't have ownership percentages
      reason: 'director' as const
    })));
  }
  
  // Calculate beneficial owners by drilling down through organizations
  const beneficialIndividuals: Array<{ owner: Owner; effectiveOwnership: number }> = [];
  
  for (const owner of owners) {
    if (owner.roles.includes('owner')) {
      const result = calculateEffectiveOwnership(owner, 100, region); // 100% represents full ownership of the main business
      beneficialIndividuals.push(...result.individuals);
    }
  }
  
  // Filter individuals who meet the beneficial ownership threshold
  const thresholdIndividuals = beneficialIndividuals.filter(({ effectiveOwnership }) => 
    effectiveOwnership >= region.threshold
  );
  
  // Add unique individuals who meet the threshold
  const uniqueIndividuals = thresholdIndividuals.filter(({ owner }, index, self) => 
    index === self.findIndex(o => o.owner.id === owner.id)
  );
  
  // Sum up effective ownership for each individual
  const individualOwnershipMap = new Map<string, number>();
  for (const { owner, effectiveOwnership } of beneficialIndividuals) {
    const current = individualOwnershipMap.get(owner.id) || 0;
    individualOwnershipMap.set(owner.id, current + effectiveOwnership);
  }
  
  // Only include individuals whose total effective ownership meets the threshold
  const finalBeneficialOwners = uniqueIndividuals.filter(({ owner }) => {
    const totalEffectiveOwnership = individualOwnershipMap.get(owner.id) || 0;
    return totalEffectiveOwnership >= region.threshold;
  });
  
  requiredOwners.push(...finalBeneficialOwners.map(({ owner }) => ({
    owner,
    effectiveOwnership: individualOwnershipMap.get(owner.id) || 0,
    reason: 'beneficial-owner' as const
  })));
  
  // Remove duplicates (in case someone is both director and beneficial owner)
  const uniqueOwners = requiredOwners.filter((requiredOwner, index, self) => 
    index === self.findIndex(o => o.owner.id === requiredOwner.owner.id)
  );
  
  return uniqueOwners;
}

export function validateOwnershipStructure(owners: Owner[], businessTypeRequirements?: RegionRequirements): {
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
  
  // Check for directors requirement if business type requirements are provided
  if (businessTypeRequirements?.directors.required) {
    const hasDirectors = owners.some(owner => owner.roles.includes('director'));
    if (!hasDirectors) {
      errors.push('At least one director is required for this business type');
    }
  }
  
  return {
    isValid: errors.length === 0,
    totalOwnership,
    errors,
  };
} 