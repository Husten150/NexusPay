export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currency: string;
  phoneCode: string;
  bvnLabel: string; // e.g. "Bank Verification Number (BVN)" for Nigeria, "SSN / ITIN" for USA, "IBAN / Sort Code" for UK
  bvnPlaceholder: string;
  idTypes: { label: string; value: string }[];
  bankFields: {
    routingLabel: string; // e.g. "ABA Routing Number", "Sort Code", "IFSC Code", "Branch Code"
    routingPlaceholder: string;
    accountLabel: string;
  };
}

export const SUPPORTED_COUNTRIES: CountryConfig[] = [
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    phoneCode: '+234',
    bvnLabel: 'Bank Verification Number (BVN)',
    bvnPlaceholder: '22190482019',
    idTypes: [
      { label: 'National Identification Number (NIN)', value: 'NATIONAL_ID' },
      { label: 'International Passport', value: 'PASSPORT' },
      { label: 'Driver\'s License', value: 'DRIVERS_LICENSE' },
      { label: 'Voter\'s Card', value: 'VOTER_CARD' },
    ],
    bankFields: {
      routingLabel: 'Bank NUBAN Branch / Sort Code',
      routingPlaceholder: '011151',
      accountLabel: '10-Digit NUBAN Account Number',
    },
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    phoneCode: '+1',
    bvnLabel: 'Social Security Number (SSN) / ITIN',
    bvnPlaceholder: 'XXX-XX-6789',
    idTypes: [
      { label: 'Social Security Card (SSN)', value: 'SOCIAL_SECURITY' },
      { label: 'US Passport', value: 'PASSPORT' },
      { label: 'State Driver\'s License', value: 'DRIVERS_LICENSE' },
      { label: 'State ID Card', value: 'NATIONAL_ID' },
    ],
    bankFields: {
      routingLabel: '9-Digit ABA Routing Number',
      routingPlaceholder: '021000021',
      accountLabel: 'Checking / Savings Account Number',
    },
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    phoneCode: '+44',
    bvnLabel: 'National Insurance Number (NIN)',
    bvnPlaceholder: 'QQ 12 34 56 C',
    idTypes: [
      { label: 'UK Passport', value: 'PASSPORT' },
      { label: 'UK Driver\'s License', value: 'DRIVERS_LICENSE' },
      { label: 'National Insurance Card', value: 'NATIONAL_ID' },
    ],
    bankFields: {
      routingLabel: '6-Digit Sort Code',
      routingPlaceholder: '20-00-00',
      accountLabel: '8-Digit Account Number or IBAN',
    },
  },
  {
    code: 'EU',
    name: 'European Union (SEPA)',
    flag: '🇪🇺',
    currency: 'EUR',
    phoneCode: '+33',
    bvnLabel: 'Tax Identification Number (TIN)',
    bvnPlaceholder: 'FR 12 345 678 901',
    idTypes: [
      { label: 'EU National Identity Card', value: 'NATIONAL_ID' },
      { label: 'EU Passport', value: 'PASSPORT' },
      { label: 'EU Driving Licence', value: 'DRIVERS_LICENSE' },
    ],
    bankFields: {
      routingLabel: 'SWIFT / BIC Code',
      routingPlaceholder: 'BNPAFRPPXXX',
      accountLabel: 'IBAN (International Bank Account Number)',
    },
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    phoneCode: '+91',
    bvnLabel: 'Aadhaar / PAN Card Number',
    bvnPlaceholder: '1234 5678 9012 or ABCDE1234F',
    idTypes: [
      { label: 'Aadhaar Card', value: 'NATIONAL_ID' },
      { label: 'PAN Card', value: 'TAX_ID' },
      { label: 'Indian Passport', value: 'PASSPORT' },
      { label: 'Voter ID', value: 'VOTER_CARD' },
    ],
    bankFields: {
      routingLabel: '11-Character IFSC Code',
      routingPlaceholder: 'SBIN0001234',
      accountLabel: 'Bank Account Number / UPI ID',
    },
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    phoneCode: '+1',
    bvnLabel: 'Social Insurance Number (SIN)',
    bvnPlaceholder: '123-456-789',
    idTypes: [
      { label: 'Canadian Passport', value: 'PASSPORT' },
      { label: 'Provincial Driver\'s License', value: 'DRIVERS_LICENSE' },
      { label: 'Provincial Health Card / ID', value: 'NATIONAL_ID' },
    ],
    bankFields: {
      routingLabel: '3-Digit Institution & 5-Digit Transit',
      routingPlaceholder: '003-12345',
      accountLabel: 'Account Number',
    },
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    currency: 'BRL',
    phoneCode: '+55',
    bvnLabel: 'CPF / CNPJ Identification',
    bvnPlaceholder: '123.456.789-00',
    idTypes: [
      { label: 'CPF Document', value: 'TAX_ID' },
      { label: 'RG (National Identity)', value: 'NATIONAL_ID' },
      { label: 'Brazilian Passport', value: 'PASSPORT' },
    ],
    bankFields: {
      routingLabel: 'Bank Agency Code (Agência)',
      routingPlaceholder: '0001',
      accountLabel: 'Account Number / PIX Key',
    },
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    phoneCode: '+27',
    bvnLabel: 'South African National ID / Tax No',
    bvnPlaceholder: '9001015009087',
    idTypes: [
      { label: 'SA Smart ID Card / Green Book', value: 'NATIONAL_ID' },
      { label: 'SA Passport', value: 'PASSPORT' },
      { label: 'Driver\'s License Card', value: 'DRIVERS_LICENSE' },
    ],
    bankFields: {
      routingLabel: 'Universal Branch Code',
      routingPlaceholder: '250655',
      accountLabel: 'Account Number',
    },
  },
  {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    currency: 'GHS',
    phoneCode: '+233',
    bvnLabel: 'Ghana Card Number / TIN',
    bvnPlaceholder: 'GHA-712345678-9',
    idTypes: [
      { label: 'Ghana Card (National ID)', value: 'NATIONAL_ID' },
      { label: 'Ghanaian Passport', value: 'PASSPORT' },
      { label: 'Voter\'s ID', value: 'VOTER_CARD' },
    ],
    bankFields: {
      routingLabel: 'Bank Branch Code / MoMo Code',
      routingPlaceholder: '030101',
      accountLabel: 'Account Number / Mobile Money No',
    },
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    currency: 'KES',
    phoneCode: '+254',
    bvnLabel: 'National ID / KRA PIN Number',
    bvnPlaceholder: 'A012345678X',
    idTypes: [
      { label: 'Kenyan National ID Card', value: 'NATIONAL_ID' },
      { label: 'KRA PIN Document', value: 'TAX_ID' },
      { label: 'Kenyan Passport', value: 'PASSPORT' },
    ],
    bankFields: {
      routingLabel: 'Bank Clearing Code / Paybill',
      routingPlaceholder: '01000',
      accountLabel: 'Account Number / M-Pesa Number',
    },
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    phoneCode: '+971',
    bvnLabel: 'Emirates ID Number (EID)',
    bvnPlaceholder: '784-1990-1234567-1',
    idTypes: [
      { label: 'Emirates ID Card', value: 'NATIONAL_ID' },
      { label: 'UAE Resident Passport', value: 'PASSPORT' },
    ],
    bankFields: {
      routingLabel: 'SWIFT / BIC Code',
      routingPlaceholder: 'EBBKAEADXXX',
      accountLabel: 'IBAN Account Number',
    },
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    currency: 'JPY',
    phoneCode: '+81',
    bvnLabel: 'My Number (Personal Number)',
    bvnPlaceholder: '1234-5678-9012',
    idTypes: [
      { label: 'My Number Card', value: 'NATIONAL_ID' },
      { label: 'Japanese Passport', value: 'PASSPORT' },
      { label: 'Japanese Driver\'s License', value: 'DRIVERS_LICENSE' },
    ],
    bankFields: {
      routingLabel: 'Branch Code (店番号)',
      routingPlaceholder: '001',
      accountLabel: '7-Digit Account Number (口座番号)',
    },
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    phoneCode: '+61',
    bvnLabel: 'Tax File Number (TFN)',
    bvnPlaceholder: '123 456 789',
    idTypes: [
      { label: 'Australian Passport', value: 'PASSPORT' },
      { label: 'Australian Driver\'s Licence', value: 'DRIVERS_LICENSE' },
      { label: 'Medicare Card', value: 'NATIONAL_ID' },
    ],
    bankFields: {
      routingLabel: '6-Digit BSB Code',
      routingPlaceholder: '062-000',
      accountLabel: 'Account Number or PayID',
    },
  },
  {
    code: 'GLOBAL',
    name: 'Other International / Global',
    flag: '🌍',
    currency: 'USD',
    phoneCode: '+1',
    bvnLabel: 'National Bank Verification / Tax ID',
    bvnPlaceholder: 'Enter National ID or Tax Number',
    idTypes: [
      { label: 'International Passport', value: 'PASSPORT' },
      { label: 'National ID Card', value: 'NATIONAL_ID' },
      { label: 'Tax Identification Card', value: 'TAX_ID' },
      { label: 'Driver\'s License', value: 'DRIVERS_LICENSE' },
    ],
    bankFields: {
      routingLabel: 'SWIFT / BIC / Routing Code',
      routingPlaceholder: 'SWIFT/Routing Code',
      accountLabel: 'IBAN or Account Number',
    },
  },
];

export const getCountryConfig = (countryCodeOrName?: string): CountryConfig => {
  if (!countryCodeOrName) return SUPPORTED_COUNTRIES[0];
  const found = SUPPORTED_COUNTRIES.find(
    (c) =>
      c.code.toLowerCase() === countryCodeOrName.toLowerCase() ||
      c.name.toLowerCase() === countryCodeOrName.toLowerCase()
  );
  return found || SUPPORTED_COUNTRIES[0];
};
