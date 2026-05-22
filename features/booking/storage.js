import AsyncStorage from '@react-native-async-storage/async-storage';

export const BOOKING_STORAGE_KEYS = {
  draft: 'bookingFlowDraftV1',
  addresses: 'bookingSavedAddressesV1',
  patients: 'bookingSavedPatientsV1',
};

async function safeReadJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Failed to read booking storage for ${key}`, error);
    return fallback;
  }
}

async function safeWriteJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write booking storage for ${key}`, error);
  }
}

export const bookingStorage = {
  loadDraft() {
    return safeReadJson(BOOKING_STORAGE_KEYS.draft, null);
  },
  saveDraft(value) {
    return safeWriteJson(BOOKING_STORAGE_KEYS.draft, value);
  },
  clearDraft() {
    return AsyncStorage.removeItem(BOOKING_STORAGE_KEYS.draft).catch(() => undefined);
  },
  loadAddresses() {
    return safeReadJson(BOOKING_STORAGE_KEYS.addresses, []);
  },
  saveAddresses(value) {
    return safeWriteJson(BOOKING_STORAGE_KEYS.addresses, value);
  },
  loadPatients() {
    return safeReadJson(BOOKING_STORAGE_KEYS.patients, []);
  },
  savePatients(value) {
    return safeWriteJson(BOOKING_STORAGE_KEYS.patients, value);
  },
};
