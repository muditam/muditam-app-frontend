export function createId(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function cleanMessage(error, fallback) {
  return error?.message || fallback;
}

export function normalizeAddressValue(value = '') {
  return String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
}

export function formatDateInput(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(value, options) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(
    'en-IN',
    options || {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  ).format(date);
}

export function getPackageEffectivePrice(item) {
  const offerPrice = Number(item?.offerPrice || 0);
  const price = Number(item?.price || 0);
  return offerPrice || price || 0;
}

export function buildPricingSummary(selectedPackages, selectedLab, patientCount = 1) {
  const multiplier = Math.max(1, Number(patientCount) || 1);
  const packageSubtotal = selectedPackages.reduce((sum, item) => sum + getPackageEffectivePrice(item), 0);
  const subtotal = packageSubtotal * multiplier;
  const discount = selectedLab?.id === 'redcliffe' ? Math.round(subtotal * 0.06) : Math.round(subtotal * 0.03);
  const payable = Math.max(0, subtotal - discount);
  return {
    patientCount: multiplier,
    packageSubtotal,
    subtotal,
    discount,
    payable,
  };
}

export function buildAddressLabel(address) {
  if (!address) return '';
  return normalizeAddressValue(
    [
      address.houseFlat,
      address.apartment,
      address.localityLabel || address.addressLine,
      address.city,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(', ')
  );
}

export function createEmptyDraft() {
  return {
    step: 'home',
    searchQuery: '',
    selectedPackages: [],
    selectedAddressId: '',
    selectedPatientIds: [],
    selectedLabId: '',
    selectedSlotId: '',
    selectedDate: '',
    selectedLocality: null,
    slotGender: '',
    currentAddressForm: {
      tag: 'Home',
      houseFlat: '',
      apartment: '',
      landmark: '',
      pincode: '',
    },
    contactInfo: {
      phone: '',
      whatsappPhone: '',
      email: '',
      paymentMode: 'credit',
    },
    createdBooking: null,
    confirmation: null,
  };
}

export function createBookingPayload({
  draft,
  selectedAddress,
  selectedPatients,
  selectedSlot,
}) {
  const [primaryPatient, ...additionalPatients] = selectedPatients;

  return {
    bookingDate: formatDateInput(new Date()),
    collectionDate: draft.selectedDate,
    collectionSlot: selectedSlot?.id,
    primaryCustomer: {
      customerName: primaryPatient.name.trim(),
      customerAge: Number(primaryPatient.age),
      customerGender: primaryPatient.gender,
      paymentMode: draft.contactInfo.paymentMode,
      phone: draft.contactInfo.phone.trim(),
      altPhone: draft.contactInfo.phone.trim(),
      whatsappPhone: (draft.contactInfo.whatsappPhone || draft.contactInfo.phone).trim(),
      email: draft.contactInfo.email.trim(),
      packageCodes: draft.selectedPackages.map((item) => item.code),
      address: buildAddressLabel(selectedAddress),
      addressLine2: normalizeAddressValue(
        [selectedAddress?.houseFlat, selectedAddress?.apartment, selectedAddress?.landmark].filter(Boolean).join(', ')
      ),
      landmark: selectedAddress?.landmark || '',
      areaPincodeId: selectedAddress?.areaPincodeId,
      pincode: selectedAddress?.pincode,
      latitude: selectedAddress?.latitude,
      longitude: selectedAddress?.longitude,
    },
    additionalMembers: additionalPatients.slice(0, 4).map((patient) => ({
      customerName: patient.name.trim(),
      customerAge: Number(patient.age),
      customerGender: patient.gender,
      packageCodes: draft.selectedPackages.map((item) => item.code),
    })),
  };
}
