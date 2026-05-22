export const ADDRESS_TAGS = ['Home', 'Work', 'Other'];

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const PAYMENT_MODES = [
  { value: 'credit', label: 'Pay now' },
  { value: 'cash', label: 'Pay at collection' },
];

export function buildLabOptions({ selectedPackages = [], selectedAddress, selectedSlot }) {
  const packageCount = selectedPackages.length;
  const distanceHint = selectedAddress?.city || 'your area';
  const sameDayEligible = selectedSlot?.availableSlot > 2 || packageCount <= 2;

  return [
    {
      id: 'orange-health',
      name: 'Orange Health',
      subtitle: 'Fast Confirmation',
      homeCollectionLabel: sameDayEligible ? 'Same-Day Home Collection' : 'Home Collection',
      category: 'Pathology',
      testsIncluded: packageCount || 1,
      reportLabel: 'Express Reports',
      distanceLabel: `Popular in ${distanceHint}`,
      priceFactor: 1,
      accent: '#FF8A00',
    },
    {
      id: 'redcliffe',
      name: 'Redcliffe Life Diagnostics',
      subtitle: 'Certified Lab',
      homeCollectionLabel: 'Free Home Collection',
      category: 'Radiology',
      testsIncluded: packageCount || 1,
      reportLabel: 'Reports in 12h',
      distanceLabel: `Available near ${distanceHint}`,
      priceFactor: 0.94,
      accent: '#FF8A00',
    },
    {
      id: 'carepath',
      name: 'CarePath Diagnostics',
      subtitle: 'Fast Confirmation',
      homeCollectionLabel: 'Morning Collection',
      category: 'Pathology',
      testsIncluded: packageCount || 1,
      reportLabel: 'Express Reports',
      distanceLabel: `Home visit in ${distanceHint}`,
      priceFactor: 0.98,
      accent: '#FF8A00',
    },
  ];
}
