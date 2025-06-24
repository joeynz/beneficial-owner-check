import { Region } from '../types';

// In a real application, you would use a YAML parser like 'js-yaml'
// For now, we'll create a simple loader that imports the YAML files
// This is a placeholder implementation - in production you'd want proper YAML parsing

const regionConfigs: Record<string, Region> = {
  US: {
    code: 'US',
    name: 'United States',
    threshold: 25,
    businessTypes: [
      {
        code: 'corporation',
        name: 'Corporation',
        description: 'A legal entity separate from its owners',
        available: true,
      },
      {
        code: 'llc',
        name: 'Limited Liability Company (LLC)',
        description: 'A flexible business structure combining corporate and partnership features',
        available: true,
      },
      {
        code: 'partnership',
        name: 'Partnership',
        description: 'A business owned by two or more individuals',
        available: true,
      },
      {
        code: 'sole-proprietorship',
        name: 'Sole Proprietorship',
        description: 'A business owned and operated by one individual',
        available: true,
      },
      {
        code: 's-corporation',
        name: 'S-Corporation',
        description: 'A corporation that elects to pass corporate income through to shareholders',
        available: true,
      },
    ],
    requirements: {
      directors: {
        required: true,
        description: 'All directors must be reported regardless of ownership percentage',
      },
      shareholders: {
        required: false,
        description: 'Shareholders are not automatically required to be reported',
      },
      beneficialOwners: {
        required: true,
        description: 'Individuals with 25% or greater ownership must be reported as beneficial owners',
      },
      additionalRequirements: [
        'Corporate Transparency Act (CTA) compliance',
        'FinCEN reporting requirements',
        'State-specific requirements may apply',
      ],
    },
    notes: [
      'Effective January 1, 2024, most US businesses must report beneficial ownership information to FinCEN',
      'Exemptions apply to certain large operating companies and regulated entities',
      'Penalties for non-compliance can include civil and criminal penalties',
    ],
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    threshold: 25,
    businessTypes: [
      {
        code: 'corporation',
        name: 'Private Limited Company (Ltd)',
        description: 'A company limited by shares with private ownership',
        available: true,
      },
      {
        code: 'llc',
        name: 'Limited Liability Partnership (LLP)',
        description: 'A partnership with limited liability for its members',
        available: true,
      },
      {
        code: 'partnership',
        name: 'General Partnership',
        description: 'A business owned by two or more individuals',
        available: true,
      },
      {
        code: 'sole-proprietorship',
        name: 'Sole Trader',
        description: 'A business owned and operated by one individual',
        available: true,
      },
      {
        code: 'plc',
        name: 'Public Limited Company (PLC)',
        description: 'A company that can offer shares to the public',
        available: true,
      },
    ],
    requirements: {
      directors: {
        required: true,
        description: 'All directors must be reported to Companies House',
      },
      shareholders: {
        required: false,
        description: 'Shareholders are not automatically required to be reported',
      },
      beneficialOwners: {
        required: true,
        description: 'Individuals with 25% or greater ownership must be reported as Persons with Significant Control (PSC)',
      },
      additionalRequirements: [
        'Companies House PSC register compliance',
        'UK Money Laundering Regulations',
        '5MLD (Fifth Money Laundering Directive) requirements',
      ],
    },
    notes: [
      'All UK companies must maintain a PSC register and report to Companies House',
      'PSC information must be updated within 14 days of any changes',
      'Failure to comply can result in criminal penalties and fines',
    ],
  },
  EU: {
    code: 'EU',
    name: 'European Union',
    threshold: 25,
    businessTypes: [
      {
        code: 'corporation',
        name: 'Private Limited Company',
        description: 'A company limited by shares with private ownership',
        available: true,
      },
      {
        code: 'llc',
        name: 'Limited Liability Company',
        description: 'A flexible business structure with limited liability',
        available: true,
      },
      {
        code: 'partnership',
        name: 'General Partnership',
        description: 'A business owned by two or more individuals',
        available: true,
      },
      {
        code: 'sole-proprietorship',
        name: 'Sole Proprietorship',
        description: 'A business owned and operated by one individual',
        available: true,
      },
      {
        code: 'public-company',
        name: 'Public Limited Company',
        description: 'A company that can offer shares to the public',
        available: true,
      },
      {
        code: 'cooperative',
        name: 'Cooperative',
        description: 'A business owned and controlled by its members',
        available: true,
      },
    ],
    requirements: {
      directors: {
        required: true,
        description: 'All directors must be reported to national registries',
      },
      shareholders: {
        required: false,
        description: 'Shareholders are not automatically required to be reported',
      },
      beneficialOwners: {
        required: true,
        description: 'Individuals with 25% or greater ownership must be reported as beneficial owners',
      },
      additionalRequirements: [
        '5MLD (Fifth Money Laundering Directive) compliance',
        'National beneficial ownership registers',
        'EU-wide information sharing requirements',
      ],
    },
    notes: [
      'Each EU member state maintains its own beneficial ownership register',
      'Information is shared across EU member states',
      'Requirements may vary slightly between member states',
      'Compliance is mandatory for all EU businesses',
    ],
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    threshold: 25,
    businessTypes: [
      {
        code: 'corporation',
        name: 'Corporation',
        description: 'A legal entity separate from its owners',
        available: true,
      },
      {
        code: 'llc',
        name: 'Limited Liability Company',
        description: 'A flexible business structure with limited liability',
        available: true,
      },
      {
        code: 'partnership',
        name: 'Partnership',
        description: 'A business owned by two or more individuals',
        available: true,
      },
      {
        code: 'sole-proprietorship',
        name: 'Sole Proprietorship',
        description: 'A business owned and operated by one individual',
        available: true,
      },
      {
        code: 'cooperative',
        name: 'Cooperative',
        description: 'A business owned and controlled by its members',
        available: true,
      },
    ],
    requirements: {
      directors: {
        required: true,
        description: 'All directors must be reported to provincial/territorial registries',
      },
      shareholders: {
        required: false,
        description: 'Shareholders are not automatically required to be reported',
      },
      beneficialOwners: {
        required: true,
        description: 'Individuals with 25% or greater ownership must be reported as beneficial owners',
      },
      additionalRequirements: [
        'Provincial/territorial beneficial ownership registers',
        'Canada Business Corporations Act compliance',
        'Anti-money laundering regulations',
      ],
    },
    notes: [
      'Requirements vary by province/territory',
      'Federal corporations have additional reporting requirements',
      'Provinces are implementing beneficial ownership registers',
      'Compliance deadlines vary by jurisdiction',
    ],
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    threshold: 25,
    businessTypes: [
      {
        code: 'corporation',
        name: 'Proprietary Limited Company (Pty Ltd)',
        description: 'A private company limited by shares',
        available: true,
      },
      {
        code: 'llc',
        name: 'Limited Liability Company',
        description: 'A flexible business structure with limited liability',
        available: true,
      },
      {
        code: 'partnership',
        name: 'Partnership',
        description: 'A business owned by two or more individuals',
        available: true,
      },
      {
        code: 'sole-proprietorship',
        name: 'Sole Trader',
        description: 'A business owned and operated by one individual',
        available: true,
      },
      {
        code: 'public-company',
        name: 'Public Company Limited (Ltd)',
        description: 'A company that can offer shares to the public',
        available: true,
      },
      {
        code: 'cooperative',
        name: 'Cooperative',
        description: 'A business owned and controlled by its members',
        available: true,
      },
    ],
    requirements: {
      directors: {
        required: true,
        description: 'All directors must be reported to ASIC',
      },
      shareholders: {
        required: false,
        description: 'Shareholders are not automatically required to be reported',
      },
      beneficialOwners: {
        required: true,
        description: 'Individuals with 25% or greater ownership must be reported as beneficial owners',
      },
      additionalRequirements: [
        'ASIC beneficial ownership reporting',
        'Anti-Money Laundering and Counter-Terrorism Financing Act',
        'Corporations Act 2001 compliance',
      ],
    },
    notes: [
      'ASIC maintains the beneficial ownership register',
      'Reporting requirements apply to all Australian companies',
      'Penalties for non-compliance can be significant',
      'Regular updates required when ownership changes',
    ],
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    threshold: 25,
    businessTypes: [
      {
        code: 'corporation',
        name: 'Private Limited Company (Pte Ltd)',
        description: 'A private company limited by shares',
        available: true,
      },
      {
        code: 'llc',
        name: 'Limited Liability Partnership (LLP)',
        description: 'A partnership with limited liability for its partners',
        available: true,
      },
      {
        code: 'partnership',
        name: 'General Partnership',
        description: 'A business owned by two or more individuals',
        available: true,
      },
      {
        code: 'sole-proprietorship',
        name: 'Sole Proprietorship',
        description: 'A business owned and operated by one individual',
        available: true,
      },
      {
        code: 'public-company',
        name: 'Public Company Limited (Ltd)',
        description: 'A company that can offer shares to the public',
        available: true,
      },
    ],
    requirements: {
      directors: {
        required: true,
        description: 'All directors must be reported to ACRA',
      },
      shareholders: {
        required: false,
        description: 'Shareholders are not automatically required to be reported',
      },
      beneficialOwners: {
        required: true,
        description: 'Individuals with 25% or greater ownership must be reported as beneficial owners',
      },
      additionalRequirements: [
        'ACRA beneficial ownership register',
        'Companies Act compliance',
        'Anti-money laundering regulations',
      ],
    },
    notes: [
      'ACRA maintains the beneficial ownership register',
      'All Singapore companies must comply with reporting requirements',
      'Regular updates required when ownership changes',
      'Penalties for non-compliance include fines and imprisonment',
    ],
  },
  HK: {
    code: 'HK',
    name: 'Hong Kong',
    threshold: 25,
    businessTypes: [
      {
        code: 'corporation',
        name: 'Private Limited Company',
        description: 'A private company limited by shares',
        available: true,
      },
      {
        code: 'llc',
        name: 'Limited Liability Company',
        description: 'A flexible business structure with limited liability',
        available: true,
      },
      {
        code: 'partnership',
        name: 'General Partnership',
        description: 'A business owned by two or more individuals',
        available: true,
      },
      {
        code: 'sole-proprietorship',
        name: 'Sole Proprietorship',
        description: 'A business owned and operated by one individual',
        available: true,
      },
      {
        code: 'public-company',
        name: 'Public Limited Company',
        description: 'A company that can offer shares to the public',
        available: true,
      },
    ],
    requirements: {
      directors: {
        required: true,
        description: 'All directors must be reported to Companies Registry',
      },
      shareholders: {
        required: false,
        description: 'Shareholders are not automatically required to be reported',
      },
      beneficialOwners: {
        required: true,
        description: 'Individuals with 25% or greater ownership must be reported as beneficial owners',
      },
      additionalRequirements: [
        'Companies Registry beneficial ownership register',
        'Companies Ordinance compliance',
        'Anti-money laundering regulations',
      ],
    },
    notes: [
      'Companies Registry maintains the beneficial ownership register',
      'All Hong Kong companies must comply with reporting requirements',
      'Regular updates required when ownership changes',
      'Penalties for non-compliance include fines and imprisonment',
    ],
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    threshold: 25,
    businessTypes: [
      {
        code: 'corporation',
        name: 'Kabushiki Kaisha (KK)',
        description: 'A joint-stock corporation',
        available: true,
      },
      {
        code: 'llc',
        name: 'Godo Kaisha (GK)',
        description: 'A limited liability company',
        available: true,
      },
      {
        code: 'partnership',
        name: 'Kumiai',
        description: 'A general partnership',
        available: true,
      },
      {
        code: 'sole-proprietorship',
        name: 'Kojo',
        description: 'A sole proprietorship',
        available: true,
      },
      {
        code: 'public-company',
        name: 'Public KK',
        description: 'A public joint-stock corporation',
        available: true,
      },
    ],
    requirements: {
      directors: {
        required: true,
        description: 'All directors must be reported to Legal Affairs Bureau',
      },
      shareholders: {
        required: false,
        description: 'Shareholders are not automatically required to be reported',
      },
      beneficialOwners: {
        required: true,
        description: 'Individuals with 25% or greater ownership must be reported as beneficial owners',
      },
      additionalRequirements: [
        'Legal Affairs Bureau beneficial ownership register',
        'Companies Act compliance',
        'Anti-money laundering regulations',
      ],
    },
    notes: [
      'Legal Affairs Bureau maintains the beneficial ownership register',
      'All Japanese companies must comply with reporting requirements',
      'Regular updates required when ownership changes',
      'Penalties for non-compliance include fines and imprisonment',
    ],
  },
};

export function loadRegionConfig(regionCode: string): Region | null {
  return regionConfigs[regionCode] || null;
}

export function getAllRegions(): Region[] {
  return Object.values(regionConfigs);
}

export function getAvailableBusinessTypes(regionCode: string) {
  const region = loadRegionConfig(regionCode);
  return region?.businessTypes.filter(type => type.available) || [];
} 