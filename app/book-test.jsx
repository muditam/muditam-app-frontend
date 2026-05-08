import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getContentWidth, getFluidValue, getScreenPadding } from '../utils/responsive';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.48:3001';

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_MODES = [
  { value: 'credit', label: 'Credit / prepaid' },
  { value: 'cash', label: 'Pay at collection' },
];

const createAdditionalMember = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  customerName: '',
  customerAge: '',
  customerGender: '',
  packageCodes: [],
});

const formatDateInput = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const cleanMessage = (error, fallback) => error?.message || fallback;

const normalizeAddressValue = (value = '') =>
  String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }
  return data;
}

function StatusMessage({ message }) {
  if (!message?.text) return null;
  return (
    <View
      style={[
        styles.messageBox,
        message.type === 'error' ? styles.messageError : styles.messageInfo,
        message.type === 'success' ? styles.messageSuccess : null,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          message.type === 'error' ? styles.messageErrorText : styles.messageInfoText,
          message.type === 'success' ? styles.messageSuccessText : null,
        ]}
      >
        {message.text}
      </Text>
    </View>
  );
}

function ChoiceGroup({ options, value, onChange }) {
  return (
    <View style={styles.choiceGroup}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.choicePill, selected && styles.choicePillSelected]}
          >
            <Text style={[styles.choicePillText, selected && styles.choicePillTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PackageSelectorModal({
  visible,
  onClose,
  title,
  packageSearch,
  onSearchChange,
  packageOptions,
  packageLoading,
  selectedCodes,
  onToggleCode,
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSubtitle}>Choose one or more packages.</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={22} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Search package code or name"
            value={packageSearch}
            onChangeText={onSearchChange}
            autoCapitalize="characters"
          />

          <ScrollView style={{ marginTop: 14 }} contentContainerStyle={{ paddingBottom: 18 }}>
            {packageLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#205446" />
              </View>
            ) : null}

            {!packageLoading && packageOptions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No packages matched your search.</Text>
              </View>
            ) : null}

            {packageOptions.map((item) => {
              const selected = selectedCodes.includes(item.code);
              return (
                <Pressable
                  key={item.code}
                  onPress={() => onToggleCode(item.code)}
                  style={[styles.packageRow, selected && styles.packageRowSelected]}
                >
                  <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                    {selected ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.packageCodeText}>
                      {item.code} · {item.name}
                    </Text>
                    <Text style={styles.packageMetaText}>
                      {item.parameters || 0} parameters
                      {item.offerPrice ? ` · ₹${item.offerPrice}` : ''}
                      {item.fastingTime ? ` · ${item.fastingTime}` : ''}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function AddressEditorModal({
  visible,
  onClose,
  localityQuery,
  onLocalityQueryChange,
  locationOptions,
  locationLoading,
  localityOpen,
  setLocalityOpen,
  onSelectLocality,
  address,
  updateAddressField,
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Edit Address</Text>
              <Text style={styles.modalSubtitle}>Update the locality and visit address.</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={22} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <View>
            <Text style={styles.fieldLabel}>Locality</Text>
            <TextInput
              style={styles.input}
              placeholder="Search locality"
              value={localityQuery}
              onFocus={() => setLocalityOpen(true)}
              onBlur={() => {
                setTimeout(() => setLocalityOpen(false), 180);
              }}
              onChangeText={onLocalityQueryChange}
            />
            {localityOpen ? (
              <View style={styles.suggestionBox}>
                {locationLoading ? (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color="#205446" />
                  </View>
                ) : null}
                {!locationLoading && locationOptions.length === 0 ? (
                  <Text style={styles.emptyText}>No matching locality found.</Text>
                ) : null}
                {!locationLoading &&
                  locationOptions.map((option) => (
                    <Pressable
                      key={`${option.eloc}-${option.label}`}
                      style={styles.suggestionRow}
                      onPress={() => onSelectLocality(option)}
                    >
                      <Text style={styles.suggestionTitle}>{option.label}</Text>
                      <Text style={styles.suggestionSubtitle}>{option.addressLine}</Text>
                    </Pressable>
                  ))}
              </View>
            ) : null}
          </View>

          <View style={styles.modalFieldsWrap}>
            <View style={styles.singleField}>
              <Text style={styles.fieldLabel}>House / flat</Text>
              <TextInput
                style={styles.input}
                value={address.houseFlat}
                onChangeText={(value) => updateAddressField('houseFlat', value)}
              />
            </View>
            <View style={styles.singleField}>
              <Text style={styles.fieldLabel}>Apartment / building / street</Text>
              <TextInput
                style={styles.input}
                value={address.apartment}
                onChangeText={(value) => updateAddressField('apartment', value)}
              />
            </View>
            <View style={styles.singleField}>
              <Text style={styles.fieldLabel}>Landmark</Text>
              <TextInput
                style={styles.input}
                value={address.landmark}
                onChangeText={(value) => updateAddressField('landmark', value)}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function BookTestScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const screenPadding = getScreenPadding(width);
  const contentWidth = getContentWidth(width, 960);
  const headlineSize = Math.round(getFluidValue(width, 320, 1024, 24, 32));
  const sectionTitleSize = Math.round(getFluidValue(width, 320, 1024, 18, 22));
  const isWide = width >= 960;
  const isTablet = width >= 640;
  const fieldColumns = isWide ? 3 : isTablet ? 2 : 1;
  const slotColumns = width >= 920 ? 3 : width >= 380 ? 2 : 1;

  const [messages, setMessages] = useState({
    step1: null,
    step2: null,
    step4: null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationFocused, setLocationFocused] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);
  const [editorLocationQuery, setEditorLocationQuery] = useState('');
  const [editorLocationFocused, setEditorLocationFocused] = useState(false);
  const [address, setAddress] = useState({
    eloc: '',
    localityLabel: '',
    addressLine: '',
    areaPincodeId: '',
    pincode: '',
    city: '',
    state: '',
    houseFlat: '',
    apartment: '',
    landmark: '',
    latitude: '',
    longitude: '',
  });

  const [slotForm, setSlotForm] = useState({
    collectionDate: '',
    customerGender: '',
  });
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState('');

  const [primaryCustomer, setPrimaryCustomer] = useState({
    customerName: '',
    customerAge: '',
    paymentMode: '',
    phone: '',
    whatsappPhone: '',
    email: '',
    customerAddress: '',
    packageCodes: [],
  });
  const [additionalMembers, setAdditionalMembers] = useState([]);
  const [packageSearch, setPackageSearch] = useState('');
  const [packageOptions, setPackageOptions] = useState([]);
  const [packageLoading, setPackageLoading] = useState(false);
  const [packageModal, setPackageModal] = useState({ visible: false, ownerId: 'primary' });

  const [bookingActionLoading, setBookingActionLoading] = useState('');
  const [temporaryBooking, setTemporaryBooking] = useState(null);
  const [confirmationResponse, setConfirmationResponse] = useState(null);

  const selectedSlot = useMemo(
    () => slots.find((slot) => String(slot.id) === String(selectedSlotId)) || null,
    [selectedSlotId, slots]
  );

  const primaryPackageSummary = useMemo(() => primaryCustomer.packageCodes.join(', '), [primaryCustomer.packageCodes]);
  const effectiveBookingStatus = useMemo(
    () => String(confirmationResponse?.bookingStatus || temporaryBooking?.status || '').trim().toLowerCase(),
    [confirmationResponse?.bookingStatus, temporaryBooking?.status]
  );
  const isAlreadyConfirmed = ['confirmed', 'order booked'].includes(effectiveBookingStatus);

  useEffect(() => {
    const hydrateUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('userDetails');
        const user = JSON.parse(stored || '{}');
        setPrimaryCustomer((current) => ({
          ...current,
          customerName: user?.name || '',
          phone: user?.phone || '',
          email: user?.email || '',
        }));
      } catch (error) {
        console.error('Failed to load user details', error);
      }
    };

    hydrateUser();
  }, []);

  useEffect(() => {
    if (!locationFocused || locationQuery.trim().length < 2) {
      setLocationOptions([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        setLocationLoading(true);
        const data = await requestJson(`/api/redcliffe/location-search?place_query=${encodeURIComponent(locationQuery.trim())}`);
        setLocationOptions(data.localities || []);
      } catch (error) {
        setMessages((current) => ({
          ...current,
          step1: { type: 'error', text: cleanMessage(error, 'Could not load locality suggestions.') },
        }));
      } finally {
        setLocationLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [locationFocused, locationQuery]);

  useEffect(() => {
    if (!editorLocationFocused || editorLocationQuery.trim().length < 2) {
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        setLocationLoading(true);
        const data = await requestJson(`/api/redcliffe/location-search?place_query=${encodeURIComponent(editorLocationQuery.trim())}`);
        setLocationOptions(data.localities || []);
      } catch (error) {
        setMessages((current) => ({
          ...current,
          step1: { type: 'error', text: cleanMessage(error, 'Could not load locality suggestions.') },
        }));
      } finally {
        setLocationLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [editorLocationFocused, editorLocationQuery]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setPackageLoading(true);
        const data = await requestJson(`/api/redcliffe/packages?search=${encodeURIComponent(packageSearch.trim())}`);
        setPackageOptions(data.packages || []);
      } catch (error) {
        setMessages((current) => ({
          ...current,
          step4: { type: 'error', text: cleanMessage(error, 'Could not load packages.') },
        }));
      } finally {
        setPackageLoading(false);
      }
    }, 240);

    return () => clearTimeout(timer);
  }, [packageSearch]);

  const updateAddressField = (key, value) => {
    setAddress((current) => ({ ...current, [key]: value }));
  };

  const updatePrimaryField = (key, value) => {
    setPrimaryCustomer((current) => ({ ...current, [key]: value }));
  };

  const updateMemberField = (memberId, key, value) => {
    setAdditionalMembers((current) =>
      current.map((member) => (member.id === memberId ? { ...member, [key]: value } : member))
    );
  };

  const currentSelectedPackageCodes =
    packageModal.ownerId === 'primary'
      ? primaryCustomer.packageCodes
      : additionalMembers.find((member) => member.id === packageModal.ownerId)?.packageCodes || [];

  const togglePackageCode = (code) => {
    const currentCodes = currentSelectedPackageCodes;
    const nextCodes = currentCodes.includes(code)
      ? currentCodes.filter((item) => item !== code)
      : [...currentCodes, code];

    if (packageModal.ownerId === 'primary') {
      updatePrimaryField('packageCodes', nextCodes);
      return;
    }
    updateMemberField(packageModal.ownerId, 'packageCodes', nextCodes);
  };

  const applyLocality = async (option) => {
    if (!option) return;

    setLocationQuery(option.label);
    setEditorLocationQuery(option.label);
    setLocationFocused(false);
    setEditorLocationFocused(false);

    setAddress((current) => ({
      ...current,
      eloc: option.eloc,
      localityLabel: option.label || current.localityLabel,
      addressLine: option.addressLine || current.addressLine,
      areaPincodeId: option.areaPincodeId || current.areaPincodeId,
      pincode: option.pincode || current.pincode,
      city: option.city || current.city,
      state: option.state || current.state,
    }));
    setPrimaryCustomer((current) => ({
      ...current,
      customerAddress:
        current.customerAddress.trim() ||
        [option.addressLine || option.label, option.pincode].filter(Boolean).join(', '),
    }));

    try {
      const geo = await requestJson(`/api/redcliffe/location-by-eloc?eloc=${encodeURIComponent(option.eloc)}`);
      setAddress((current) => ({
        ...current,
        latitude: geo.latitude || '',
        longitude: geo.longitude || '',
      }));
      setMessages((current) => ({
        ...current,
        step1: {
          type: 'success',
          text: 'Collection area is ready. Review the address details if needed.',
        },
      }));
    } catch (error) {
      setMessages((current) => ({
        ...current,
        step1: { type: 'error', text: cleanMessage(error, 'Could not confirm the locality.') },
      }));
    }
  };

  const fetchSlots = async () => {
    if (!address.latitude || !address.longitude) {
      setMessages((current) => ({
        ...current,
        step2: { type: 'error', text: 'Choose the collection area first.' },
      }));
      return;
    }
    if (!slotForm.collectionDate || !slotForm.customerGender) {
      setMessages((current) => ({
        ...current,
        step2: { type: 'error', text: 'Select collection date and customer gender first.' },
      }));
      return;
    }

    try {
      setSlotsLoading(true);
      setSelectedSlotId('');
      const data = await requestJson(
        `/api/redcliffe/time-slots?collection_date=${encodeURIComponent(slotForm.collectionDate)}&latitude=${encodeURIComponent(
          String(address.latitude)
        )}&longitude=${encodeURIComponent(String(address.longitude))}&customer_gender=${encodeURIComponent(
          slotForm.customerGender
        )}`
      );
      setSlots(data.slots || []);
      setMessages((current) => ({
        ...current,
        step2: {
          type: 'success',
          text: (data.slots || []).length
            ? 'Select the collection slot that works best.'
            : data.message || 'No slots are available for the selected date.',
        },
      }));
    } catch (error) {
      setSlots([]);
      setMessages((current) => ({
        ...current,
        step2: { type: 'error', text: cleanMessage(error, 'Could not load time slots.') },
      }));
    } finally {
      setSlotsLoading(false);
    }
  };

  const buildAddressLine = () => {
    const typedAddress = normalizeAddressValue(primaryCustomer.customerAddress);
    const localityAddress = normalizeAddressValue(
      [address.addressLine || address.localityLabel, address.city, address.state, address.pincode].filter(Boolean).join(', ')
    );
    const merged = normalizeAddressValue(
      [typedAddress, localityAddress].filter(Boolean).join(', ')
    );
    return merged || localityAddress;
  };

  const buildAddressLine2 = () =>
    normalizeAddressValue(
      [address.houseFlat, address.apartment, address.addressLine || address.localityLabel, address.city, address.state, address.pincode]
        .filter(Boolean)
        .join(', ')
    );

  const handleCreateBooking = async () => {
    if (!address.eloc || !address.latitude || !address.longitude) {
      setMessages((current) => ({
        ...current,
        step4: { type: 'error', text: 'Choose the collection area before creating the booking.' },
      }));
      return;
    }
    if (!selectedSlot) {
      setMessages((current) => ({
        ...current,
        step4: { type: 'error', text: 'Choose a collection slot first.' },
      }));
      return;
    }
    if (
      !primaryCustomer.customerName.trim() ||
      !primaryCustomer.customerAge ||
      !primaryCustomer.paymentMode ||
      !primaryCustomer.phone.trim() ||
      !primaryCustomer.whatsappPhone.trim() ||
      !primaryCustomer.email.trim()
    ) {
      setMessages((current) => ({
        ...current,
        step4: { type: 'error', text: 'Complete the required primary customer details first.' },
      }));
      return;
    }
    if (!primaryCustomer.packageCodes.length) {
      setMessages((current) => ({
        ...current,
        step4: { type: 'error', text: 'Select at least one package for the primary customer.' },
      }));
      return;
    }
    if (!buildAddressLine()) {
      setMessages((current) => ({
        ...current,
        step4: { type: 'error', text: 'Complete the address details before creating the booking.' },
      }));
      return;
    }

    const validAdditionalMembers = additionalMembers
      .filter(
        (member) =>
          member.customerName.trim() &&
          member.customerAge &&
          member.customerGender &&
          member.packageCodes.length
      )
      .slice(0, 4);

    try {
      setBookingActionLoading('create');
      setConfirmationResponse(null);
      const response = await requestJson('/api/redcliffe/bookings/create', {
        method: 'POST',
        body: JSON.stringify({
          bookingDate: formatDateInput(new Date()),
          collectionDate: slotForm.collectionDate,
          collectionSlot: selectedSlot.id,
          primaryCustomer: {
            customerName: primaryCustomer.customerName.trim(),
            customerAge: Number(primaryCustomer.customerAge),
            customerGender: slotForm.customerGender,
            paymentMode: primaryCustomer.paymentMode,
            phone: primaryCustomer.phone.trim(),
            altPhone: primaryCustomer.phone.trim(),
            whatsappPhone: primaryCustomer.whatsappPhone.trim(),
            email: primaryCustomer.email.trim(),
            packageCodes: primaryCustomer.packageCodes,
            address: buildAddressLine(),
            addressLine2: buildAddressLine2(),
            landmark: address.landmark,
            areaPincodeId: address.areaPincodeId,
            pincode: address.pincode,
            latitude: address.latitude,
            longitude: address.longitude,
          },
          additionalMembers: validAdditionalMembers.map((member) => ({
            customerName: member.customerName.trim(),
            customerAge: Number(member.customerAge),
            customerGender: member.customerGender,
            packageCode: member.packageCodes,
            packageCodes: member.packageCodes,
          })),
        }),
      });

      setTemporaryBooking(response.booking);
      if (response.booking?.status) {
        setConfirmationResponse({ bookingStatus: response.booking.status });
      }
      setMessages((current) => ({
        ...current,
        step4: {
          type: 'success',
          text:
            response.booking?.status && ['confirmed', 'order booked'].includes(String(response.booking.status).toLowerCase())
              ? 'Booking has already been accepted by Redcliffe.'
              : response.message || 'Temporary booking created.',
        },
      }));
    } catch (error) {
      setMessages((current) => ({
        ...current,
        step4: { type: 'error', text: cleanMessage(error, 'Could not create the booking.') },
      }));
    } finally {
      setBookingActionLoading('');
    }
  };

  const handleConfirmBooking = async (action) => {
    if (!temporaryBooking?.bookingId) {
      setMessages((current) => ({
        ...current,
        step4: { type: 'error', text: 'Create the temporary booking first.' },
      }));
      return;
    }
    if (action === 'cancel' && isAlreadyConfirmed) {
      setMessages((current) => ({
        ...current,
        step4: { type: 'error', text: 'This booking is already confirmed and Redcliffe does not allow unconfirming it.' },
      }));
      return;
    }

    try {
      setBookingActionLoading(action);
      const response = await requestJson('/api/redcliffe/bookings/confirm', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: temporaryBooking.bookingId,
          isConfirmed: action === 'confirm',
        }),
      });
      setConfirmationResponse(response);
      setMessages((current) => ({
        ...current,
        step4: { type: 'success', text: response.message || 'Booking status updated.' },
      }));
    } catch (error) {
      setMessages((current) => ({
        ...current,
        step4: { type: 'error', text: cleanMessage(error, 'Could not update the booking.') },
      }));
    } finally {
      setBookingActionLoading('');
    }
  };

  const openPackagePicker = (ownerId) => {
    setPackageModal({ visible: true, ownerId });
  };

  const renderPackageChips = (codes) => {
    if (!codes.length) {
      return <Text style={styles.placeholderText}>Select packages</Text>;
    }
    return (
      <View style={styles.packageChipWrap}>
        {codes.map((code) => (
          <View key={code} style={styles.packageChip}>
            <Text style={styles.packageChipText}>{code}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingHorizontal: screenPadding }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.shell, { maxWidth: contentWidth }]}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={22} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <LinearGradient
              colors={['#5B2E91', '#7F56D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <Text style={[styles.title, { fontSize: headlineSize }]}>Book Test</Text>
              <Text style={styles.subtitle}>Schedule a home sample collection.</Text>
            </LinearGradient>

          <View style={styles.stepCard}>
            <Text style={styles.stepKicker}>Step 1 · Collection Area</Text>
            <Text style={[styles.stepTitle, { fontSize: sectionTitleSize }]}>Choose locality</Text>

            <Text style={styles.fieldLabel}>Locality</Text>
            <TextInput
              style={styles.input}
              placeholder="Search area, colony or sector"
              value={locationQuery}
              onFocus={() => setLocationFocused(true)}
              onBlur={() => {
                setTimeout(() => setLocationFocused(false), 180);
              }}
              onChangeText={setLocationQuery}
            />

            {locationFocused ? (
              <View style={styles.suggestionBox}>
                {locationLoading ? (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color="#205446" />
                  </View>
                ) : null}
                {!locationLoading && locationOptions.length === 0 ? (
                  <Text style={styles.emptyText}>Type to search locality.</Text>
                ) : null}
                {!locationLoading &&
                  locationOptions.map((option) => (
                    <Pressable
                      key={`${option.eloc}-${option.label}`}
                      style={styles.suggestionRow}
                      onPress={() => applyLocality(option)}
                    >
                      <Text style={styles.suggestionTitle}>{option.label}</Text>
                      <Text style={styles.suggestionSubtitle}>{option.addressLine}</Text>
                    </Pressable>
                  ))}
              </View>
            ) : null}

            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Selected address</Text>
              <Text style={styles.previewText}>
                {buildAddressLine() || 'Address details will appear here.'}
              </Text>
              {address.landmark ? <Text style={styles.previewText}>Landmark: {address.landmark}</Text> : null}
            </View>

            <TouchableOpacity style={[styles.secondaryButton, styles.fullWidthButton]} onPress={() => setAddressEditorOpen(true)}>
              <Ionicons name="create-outline" size={18} color="#205446" />
              <Text style={styles.secondaryButtonText}>Edit Address</Text>
            </TouchableOpacity>

            <StatusMessage message={messages.step1} />
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepKicker}>Step 2 · Get Collection Slot</Text>
            <Text style={[styles.stepTitle, { fontSize: sectionTitleSize }]}>Choose a slot</Text>

            <Text style={styles.fieldLabel}>Collection date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={slotForm.collectionDate ? styles.dateButtonText : styles.datePlaceholderText}>
                {slotForm.collectionDate ? formatDateLabel(slotForm.collectionDate) : 'Select collection date'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color="#52616A" />
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Customer gender</Text>
            <ChoiceGroup
              options={GENDERS}
              value={slotForm.customerGender}
              onChange={(value) => setSlotForm((current) => ({ ...current, customerGender: value }))}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={fetchSlots} disabled={slotsLoading}>
              <Text style={styles.primaryButtonText}>{slotsLoading ? 'Loading slots...' : 'Get slots'}</Text>
            </TouchableOpacity>

            <View style={styles.slotGrid}>
              {slots.map((slot) => {
                const selected = String(selectedSlotId) === String(slot.id);
                return (
                  <Pressable
                    key={slot.id}
                    disabled={!slot.available}
                    onPress={() => setSelectedSlotId(slot.id)}
                    style={[
                      styles.slotCard,
                      { width: slotColumns === 1 ? '100%' : slotColumns === 2 ? '48%' : '31.5%' },
                      selected && styles.slotCardSelected,
                      !slot.available && styles.slotCardDisabled,
                    ]}
                  >
                    <Text style={styles.slotTimeText}>{slot.timeRange12}</Text>
                    <Text style={styles.slotSubText}>{slot.timeRange24}</Text>
                    <Text style={styles.slotMetaText}>
                      {slot.availableSlot} slot{slot.availableSlot === 1 ? '' : 's'} available
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <StatusMessage message={messages.step2} />
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepKicker}>Step 3 · Create Booking</Text>
            <Text style={[styles.stepTitle, { fontSize: sectionTitleSize }]}>Fill only the required details needed to create the booking.</Text>

            <Text style={styles.fieldLabel}>Package details</Text>
            <TouchableOpacity style={styles.selectorButton} onPress={() => openPackagePicker('primary')}>
              <View style={styles.selectorButtonContent}>
                <View style={styles.selectorTextWrap}>
                  {primaryCustomer.packageCodes.length ? (
                    renderPackageChips(primaryCustomer.packageCodes)
                  ) : (
                    <Text style={styles.selectorPlaceholder}>Select package(s)</Text>
                  )}
                </View>
                <Text style={styles.selectorActionText}>CHOOSE</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.fieldGrid}>
              <View style={[styles.gridItem, { width: `${100 / fieldColumns}%` }]}>
                <Text style={styles.fieldLabel}>Customer name</Text>
                <TextInput
                  style={styles.input}
                  value={primaryCustomer.customerName}
                  onChangeText={(value) => updatePrimaryField('customerName', value)}
                />
              </View>
              <View style={[styles.gridItem, { width: `${100 / fieldColumns}%` }]}>
                <Text style={styles.fieldLabel}>Customer age</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={primaryCustomer.customerAge}
                  onChangeText={(value) => updatePrimaryField('customerAge', value)}
                />
              </View>
              <View style={[styles.gridItem, { width: `${100 / fieldColumns}%` }]}>
                <Text style={styles.fieldLabel}>Payment mode</Text>
                <ChoiceGroup
                  options={PAYMENT_MODES}
                  value={primaryCustomer.paymentMode}
                  onChange={(value) => updatePrimaryField('paymentMode', value)}
                />
              </View>
            </View>

            <View style={styles.fieldGrid}>
              <View style={[styles.gridItem, { width: `${100 / fieldColumns}%` }]}>
                <Text style={styles.fieldLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={primaryCustomer.phone}
                  onChangeText={(value) => updatePrimaryField('phone', value)}
                />
              </View>
              <View style={[styles.gridItem, { width: `${100 / fieldColumns}%` }]}>
                <Text style={styles.fieldLabel}>WhatsApp phone</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={primaryCustomer.whatsappPhone}
                  onChangeText={(value) => updatePrimaryField('whatsappPhone', value)}
                />
              </View>
              <View style={[styles.gridItem, { width: `${100 / fieldColumns}%` }]}>
                <Text style={styles.fieldLabel}>Customer email</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={primaryCustomer.email}
                  onChangeText={(value) => updatePrimaryField('email', value)}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Customer address</Text>
            <TextInput
              style={[styles.input, styles.textAreaInput]}
              multiline
              textAlignVertical="top"
              value={primaryCustomer.customerAddress}
              onChangeText={(value) => updatePrimaryField('customerAddress', value)}
            />

            <View style={styles.fieldGrid}>
              <View style={[styles.gridItem, { width: `${100 / 2}%` }]}>
                <Text style={styles.fieldLabel}>Landmark</Text>
                <TextInput
                  style={styles.input}
                  value={address.landmark}
                  onChangeText={(value) => updateAddressField('landmark', value)}
                />
              </View>
              <View style={[styles.gridItem, { width: `${100 / 2}%` }]}>
                <Text style={styles.fieldLabel}>Pincode</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={address.pincode ? String(address.pincode) : ''}
                  onChangeText={(value) => updateAddressField('pincode', value)}
                />
              </View>
            </View>

            <View style={styles.memberHeader}>
              <TouchableOpacity
                style={[styles.addMemberButton, additionalMembers.length >= 4 && styles.buttonDisabled]}
                disabled={additionalMembers.length >= 4}
                onPress={() => setAdditionalMembers((current) => [...current, createAdditionalMember()])}
              >
                <Ionicons name="add-circle" size={18} color="#B86C3F" />
                <Text style={styles.addMemberButtonText}>Add Additional Member ({additionalMembers.length}/4)</Text>
              </TouchableOpacity>
            </View>

            {additionalMembers.map((member, index) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberCardHeader}>
                  <Text style={styles.memberCardTitle}>Additional member {index + 1}</Text>
                  <TouchableOpacity onPress={() => setAdditionalMembers((current) => current.filter((item) => item.id !== member.id))}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.fieldGrid}>
                  <View style={[styles.gridItem, { width: `${100 / fieldColumns}%` }]}>
                    <Text style={styles.fieldLabel}>Customer name</Text>
                    <TextInput
                      style={styles.input}
                      value={member.customerName}
                      onChangeText={(value) => updateMemberField(member.id, 'customerName', value)}
                    />
                  </View>
                  <View style={[styles.gridItem, { width: `${100 / fieldColumns}%` }]}>
                    <Text style={styles.fieldLabel}>Customer age</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={member.customerAge}
                      onChangeText={(value) => updateMemberField(member.id, 'customerAge', value)}
                    />
                  </View>
                  <View style={[styles.gridItem, { width: `${100 / fieldColumns}%` }]}>
                    <Text style={styles.fieldLabel}>Customer gender</Text>
                    <ChoiceGroup
                      options={GENDERS}
                      value={member.customerGender}
                      onChange={(value) => updateMemberField(member.id, 'customerGender', value)}
                    />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Package details</Text>
                <View style={styles.packageSelectionBox}>{renderPackageChips(member.packageCodes)}</View>
                <TouchableOpacity style={[styles.secondaryButton, styles.fullWidthButton]} onPress={() => openPackagePicker(member.id)}>
                  <Ionicons name="albums-outline" size={18} color="#205446" />
                  <Text style={styles.secondaryButtonText}>Choose Packages</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepKicker}>Step 4 · Booking Confirmation</Text>
            <Text style={[styles.stepTitle, { fontSize: sectionTitleSize }]}>Complete booking</Text>

            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Booking summary</Text>
              <Text style={styles.previewText}>Area: {address.localityLabel || 'Not selected yet'}</Text>
              <Text style={styles.previewText}>
                Slot: {selectedSlot ? `${formatDateLabel(slotForm.collectionDate)} · ${selectedSlot.timeRange12}` : 'Not selected yet'}
              </Text>
              <Text style={styles.previewText}>Packages: {primaryPackageSummary || 'Not selected yet'}</Text>
              <Text style={styles.previewText}>
                Additional members: {additionalMembers.filter((member) => member.customerName.trim()).length}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, bookingActionLoading === 'create' && styles.buttonDisabled]}
              disabled={bookingActionLoading === 'create'}
              onPress={handleCreateBooking}
            >
              <Text style={styles.primaryButtonText}>
                {bookingActionLoading === 'create' ? 'Creating...' : 'Create Temporary Booking'}
              </Text>
            </TouchableOpacity>

            <View style={styles.confirmationActions}>
              <TouchableOpacity
                style={[styles.confirmButton, (!temporaryBooking?.bookingId || isAlreadyConfirmed) && styles.buttonDisabled]}
                disabled={!temporaryBooking?.bookingId || bookingActionLoading === 'confirm' || isAlreadyConfirmed}
                onPress={() => handleConfirmBooking('confirm')}
              >
                <Text style={styles.confirmButtonText}>
                  {isAlreadyConfirmed ? 'Already Confirmed' : bookingActionLoading === 'confirm' ? 'Confirming...' : 'Confirm Booking'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, (!temporaryBooking?.bookingId || isAlreadyConfirmed) && styles.buttonDisabled]}
                disabled={!temporaryBooking?.bookingId || bookingActionLoading === 'cancel' || isAlreadyConfirmed}
                onPress={() => handleConfirmBooking('cancel')}
              >
                <Text style={styles.cancelButtonText}>
                  {isAlreadyConfirmed ? 'Cannot Cancel After Confirmation' : bookingActionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Booking'}
                </Text>
              </TouchableOpacity>
            </View>

            {temporaryBooking?.bookingId ? (
              <View style={styles.infoMiniBox}>
                <Text style={styles.infoMiniText}>Temporary booking ID: {temporaryBooking.bookingId}</Text>
              </View>
            ) : null}
            {confirmationResponse?.bookingStatus ? (
              <View style={styles.infoMiniBox}>
                <Text style={styles.infoMiniText}>Latest status: {confirmationResponse.bookingStatus}</Text>
              </View>
            ) : null}

            <StatusMessage message={messages.step4} />
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker ? (
        <DateTimePicker
          value={slotForm.collectionDate ? new Date(slotForm.collectionDate) : new Date()}
          mode="date"
          minimumDate={new Date()}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (event.type === 'dismissed' || !selectedDate) return;
            setSlotForm((current) => ({ ...current, collectionDate: formatDateInput(selectedDate) }));
            if (Platform.OS !== 'ios') setShowDatePicker(false);
          }}
        />
      ) : null}

      <AddressEditorModal
        visible={addressEditorOpen}
        onClose={() => setAddressEditorOpen(false)}
        localityQuery={editorLocationQuery}
        onLocalityQueryChange={setEditorLocationQuery}
        locationOptions={locationOptions}
        locationLoading={locationLoading}
        localityOpen={editorLocationFocused}
        setLocalityOpen={setEditorLocationFocused}
        onSelectLocality={applyLocality}
        address={address}
        updateAddressField={updateAddressField}
      />

      <PackageSelectorModal
        visible={packageModal.visible}
        onClose={() => setPackageModal({ visible: false, ownerId: 'primary' })}
        title={packageModal.ownerId === 'primary' ? 'Choose primary customer packages' : 'Choose member packages'}
        packageSearch={packageSearch}
        onSearchChange={setPackageSearch}
        packageOptions={packageOptions}
        packageLoading={packageLoading}
        selectedCodes={currentSelectedPackageCodes}
        onToggleCode={togglePackageCode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingTop: 18,
    paddingBottom: 30,
  },
  shell: {
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EADFF8',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F3FE',
  },
  heroCard: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 14,
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 12,
  },
  heroBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  heroPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    lineHeight: 19,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEE8F7',
    shadowColor: '#32125A',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  stepKicker: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6D3AAD',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  stepTitle: {
    marginTop: 8,
    fontWeight: '800',
    color: '#1D2433',
  },
  stepCopy: {
    marginTop: 4,
    fontSize: 14,
    color: '#6F7381',
    lineHeight: 20,
  },
  fieldLabel: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 13,
    color: '#4F566B',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E7E1F1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1D2433',
    backgroundColor: '#FCFCFF',
  },
  dateButton: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E7E1F1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#FCFCFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonText: {
    color: '#17312B',
    fontSize: 15,
  },
  datePlaceholderText: {
    color: '#8A948D',
    fontSize: 15,
  },
  choiceGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choicePill: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E7DEF5',
    backgroundColor: '#F8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choicePillSelected: {
    backgroundColor: '#543287',
    borderColor: '#543287',
  },
  choicePillText: {
    color: '#543287',
    fontWeight: '700',
  },
  choicePillTextSelected: {
    color: '#FFFFFF',
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 18,
    marginTop: 16,
    backgroundColor: '#543287',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E4DCF4',
    backgroundColor: '#F6F1FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  fullWidthButton: {
    width: '100%',
    alignSelf: 'stretch',
  },
  secondaryButtonText: {
    color: '#543287',
    fontSize: 14,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.48,
  },
  suggestionBox: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E1F1',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#32125A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  suggestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0EB',
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D2433',
  },
  suggestionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#7A8190',
  },
  previewBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F8F5FE',
    borderWidth: 1,
    borderColor: '#ECE5F7',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2D2342',
    marginBottom: 6,
  },
  previewText: {
    fontSize: 13,
    color: '#6C6E7C',
    lineHeight: 19,
  },
  slotGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotCard: {
    minHeight: 92,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7E1F1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  slotCardSelected: {
    backgroundColor: '#F6F1FF',
    borderColor: '#7C4DDB',
    shadowColor: '#7C4DDB',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  slotCardDisabled: {
    opacity: 0.44,
  },
  slotTimeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D2433',
  },
  slotSubText: {
    marginTop: 4,
    fontSize: 12,
    color: '#7A8190',
  },
  slotMetaText: {
    fontSize: 12,
    color: '#6A5A88',
    fontWeight: '700',
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginTop: 2,
  },
  gridItem: {
    paddingHorizontal: 6,
  },
  packageSelectionBox: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#E7E1F1',
    borderRadius: 16,
    padding: 12,
    minHeight: 56,
    justifyContent: 'center',
    backgroundColor: '#FCFCFF',
  },
  selectorButton: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#D8DEE8',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  selectorButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectorTextWrap: {
    flex: 1,
    minHeight: 24,
    justifyContent: 'center',
  },
  selectorPlaceholder: {
    color: '#6C7280',
    fontSize: 15,
  },
  selectorActionText: {
    color: '#8C5A39',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  placeholderText: {
    color: '#8A8FA0',
    fontSize: 14,
  },
  packageChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  packageChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#EEE6FF',
  },
  packageChipText: {
    color: '#5B35A0',
    fontWeight: '800',
    fontSize: 13,
  },
  memberHeader: {
    marginTop: 18,
    gap: 10,
  },
  addMemberButton: {
    minHeight: 48,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2A077',
    borderStyle: 'dashed',
    backgroundColor: '#FFF9F5',
  },
  addMemberButtonText: {
    color: '#8C5A39',
    fontSize: 14,
    fontWeight: '800',
  },
  memberHeaderContent: {
    gap: 2,
  },
  memberAddButton: {
    width: '100%',
    alignSelf: 'stretch',
    marginTop: 2,
  },
  memberTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D2433',
  },
  memberSubtitle: {
    marginTop: 2,
    color: '#7A8190',
    fontSize: 13,
  },
  memberCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#EFE8F6',
    borderRadius: 22,
    padding: 14,
    backgroundColor: '#FBFAFE',
  },
  memberCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D2433',
  },
  removeText: {
    color: '#B34A52',
    fontWeight: '700',
  },
  textAreaInput: {
    minHeight: 108,
    paddingTop: 14,
  },
  confirmationActions: {
    marginTop: 14,
    gap: 10,
  },
  confirmButton: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#6D3AAD',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  cancelButton: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#FFF4F7',
    borderWidth: 1,
    borderColor: '#F1D0D7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#B04C63',
    fontSize: 15,
    fontWeight: '800',
  },
  infoMiniBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8F5FE',
  },
  infoMiniText: {
    color: '#5F5A70',
    fontSize: 13,
    fontWeight: '700',
  },
  messageBox: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
  },
  messageInfo: {
    backgroundColor: '#EFF4FF',
  },
  messageInfoText: {
    color: '#455C8A',
  },
  messageError: {
    backgroundColor: '#FDECEC',
  },
  messageErrorText: {
    color: '#9D3D3D',
  },
  messageSuccess: {
    backgroundColor: '#E8F4ED',
  },
  messageSuccessText: {
    color: '#1F6A49',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(29, 19, 51, 0.34)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D2433',
  },
  modalSubtitle: {
    marginTop: 4,
    color: '#7A8190',
    fontSize: 13,
  },
  loadingWrap: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyBox: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7A8190',
    fontSize: 13,
  },
  packageRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE8F6',
    backgroundColor: '#FCFCFF',
    marginBottom: 10,
    alignItems: 'center',
  },
  packageRowSelected: {
    borderColor: '#7C4DDB',
    backgroundColor: '#F6F1FF',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D7CDED',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#6D3AAD',
    borderColor: '#6D3AAD',
  },
  packageCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D2433',
  },
  packageMetaText: {
    marginTop: 3,
    fontSize: 12,
    color: '#7A8190',
  },
  modalFieldsWrap: {
    marginTop: 8,
  },
  singleField: {
    marginTop: 6,
  },
});
