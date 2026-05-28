import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { bookingApi } from './api';
import { LEAFLET_CSS, LEAFLET_JS } from './leafletAssets';
import { bookingStorage } from './storage';
import {
  buildAddressLabel,
  buildPricingSummary,
  cleanMessage,
  createBookingPayload,
  createEmptyDraft,
  createId,
  formatDateInput,
  formatDateLabel,
  getPackageEffectivePrice,
  isValidPhoneValue,
  normalizePhoneValue,
} from './utils';
import { getContentWidth, getFluidValue, getScreenPadding } from '../../utils/responsive';

const FLOW_INDEX = ['home', 'packages', 'addresses', 'location', 'saveAddress', 'patients', 'labs', 'slots', 'review'];
const ADDRESS_TAGS = ['Home', 'Work', 'Other'];
const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];
const SLOT_PERIODS = [
  { key: 'Morning', start: 0, end: 12 },
  { key: 'Afternoon', start: 12, end: 17 },
  { key: 'Evening', start: 17, end: 24 },
];
const REAL_BOOKING_PROVIDER = {
  id: 'redcliffe',
  name: 'Redcliffe Labs',
};
const BOOKING_TEST_VARIANT_ID_MAP = {
  'urine routine & microscopic examination test': '54021343707446',
  'testosterone total test': '54021343674678',
  'prolactin test (prl)': '54021343641910',
  'muditam full body with vitamin d and b12': '54021343609142',
  'muditam ayurveda hba1c': '54021343576374',
  'muditam ayurveda full body check-up': '54021343543606',
  'muditam ayurveda advance body check-up': '54021343510838',
  'muditam - fever package': '54021343478070',
  'iron studies test': '54021343445302',
  'high-sensitivity c-reactive protein (hscrp ) test': '54021343412534',
  'ferritin test': '54021343379766',
};
const DEFAULT_MAP_CENTER = {
  latitude: 28.5245,
  longitude: 77.1855,
};
const MAP_ZOOM = 16;
const MAP_HEIGHT = 360;
const MAP_TILE_SIZE = 256;

let cachedLocationModule = null;
let locationModuleUnavailable = false;

function getMapTileCoordinate({ latitude, longitude, zoom }) {
  const latRad = (latitude * Math.PI) / 180;
  const scale = 2 ** zoom;
  const x = ((longitude + 180) / 360) * scale;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale;

  return { x, y, scale };
}

function buildStreetTiles({ latitude, longitude, width: mapWidth, height: mapHeight = MAP_HEIGHT, zoom = MAP_ZOOM }) {
  const center = getMapTileCoordinate({ latitude, longitude, zoom });
  const centerPixelX = center.x * MAP_TILE_SIZE;
  const centerPixelY = center.y * MAP_TILE_SIZE;
  const centerTileX = Math.floor(center.x);
  const centerTileY = Math.floor(center.y);
  const tileRangeX = Math.ceil(mapWidth / MAP_TILE_SIZE / 2) + 1;
  const tileRangeY = Math.ceil(mapHeight / MAP_TILE_SIZE / 2) + 1;
  const tiles = [];

  for (let xOffset = -tileRangeX; xOffset <= tileRangeX; xOffset += 1) {
    for (let yOffset = -tileRangeY; yOffset <= tileRangeY; yOffset += 1) {
      const tileX = centerTileX + xOffset;
      const tileY = centerTileY + yOffset;
      const wrappedTileX = ((tileX % center.scale) + center.scale) % center.scale;

      tiles.push({
        key: `${zoom}-${tileX}-${tileY}`,
        url: `https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${wrappedTileX}/${tileY}.png`,
        left: tileX * MAP_TILE_SIZE - centerPixelX + mapWidth / 2,
        top: tileY * MAP_TILE_SIZE - centerPixelY + mapHeight / 2,
      });
    }
  }

  return tiles;
}

function normalizePackageNameKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function hasNativeLocationModule() {
  try {
    const ExpoModulesCore = require('expo-modules-core');
    return Boolean(ExpoModulesCore.requireOptionalNativeModule?.('ExpoLocation'));
  } catch (_error) {
    return false;
  }
}

async function getLocationModule() {
  if (cachedLocationModule) {
    return cachedLocationModule;
  }

  if (locationModuleUnavailable) {
    throw new Error('Location services are not available in this build yet. Rebuild the app to enable current location.');
  }

  try {
    const ExpoModulesCore = require('expo-modules-core');
    const nativeLocationModule = ExpoModulesCore.requireOptionalNativeModule?.('ExpoLocation');

    if (!nativeLocationModule) {
      locationModuleUnavailable = true;
      throw new Error('Location services are not available in this build yet. Rebuild the app to enable current location.');
    }

    cachedLocationModule = require('expo-location');
    return cachedLocationModule;
  } catch (_error) {
    cachedLocationModule = null;
    locationModuleUnavailable = true;
    throw new Error('Location services are not available in this build yet. Rebuild the app to enable current location.');
  }
}

function buildLocationMapHtml({ latitude, longitude }) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      ${LEAFLET_CSS}
      html, body, #map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: transparent;
      }
      body {
        overflow: hidden;
      }
      .leaflet-control-container {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      ${LEAFLET_JS}
      (function() {
        function post(message) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
          }
        }

        if (!window.L) {
          post({ type: 'map-error', message: 'Leaflet failed to load.' });
          return;
        }

        var map = L.map('map', {
          zoomControl: false,
          attributionControl: false,
          preferCanvas: true
        }).setView([${latitude}, ${longitude}], ${MAP_ZOOM});

        var usingFallbackTiles = false;
        var streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          subdomains: 'abcd',
          maxZoom: 20,
          detectRetina: true
        }).addTo(map);

        function loadFallbackTiles() {
          usingFallbackTiles = true;
          map.removeLayer(streetLayer);
          streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 20,
            detectRetina: true
          }).addTo(map);
          streetLayer.on('tileerror', function() {
            post({ type: 'map-error', message: 'Street map tiles could not load. Check the device internet connection.' });
          });
        }

        streetLayer.on('tileerror', function() {
          if (!usingFallbackTiles) {
            loadFallbackTiles();
          }
        });

        function emit(type) {
          var center = map.getCenter();
          post({
            type: type,
            latitude: center.lat,
            longitude: center.lng,
            zoom: map.getZoom()
          });
        }

        map.whenReady(function() {
          setTimeout(function() {
            map.invalidateSize();
          }, 120);
          emit('map-ready');
        });

        map.on('moveend', function() {
          emit('moveend');
        });

        window.__bookingMap = {
          setCenter: function(lat, lng, zoom) {
            map.setView([lat, lng], zoom || map.getZoom(), { animate: true });
          }
        };
      })();
    </script>
  </body>
</html>`;
}

function SearchField({ value, onChangeText, placeholder, onFocus }) {
  return (
    <View style={styles.searchWrap}>
      <Ionicons name="search-outline" size={18} color="#C084FC" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor="#8B8B95"
        style={styles.searchInput}
      />
    </View>
  );
}

function ScreenHeader({ title, onBack }) {
  return (
    <View style={styles.screenHeader}>
      <TouchableOpacity onPress={onBack} style={styles.headerIconButton}>
        <Ionicons name="arrow-back" size={20} color="#111111" />
      </TouchableOpacity>
      <Text style={styles.screenHeaderTitle}>{title}</Text>
      <View style={styles.headerIconButtonSpacer} />
    </View>
  );
}

function ChoicePills({ options, value, onChange, compact }) {
  return (
    <View style={[styles.pillRow, compact && styles.pillRowCompact]}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.pill, compact && styles.pillCompact, selected && styles.pillSelected]}
          >
            <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function StatusBanner({ message }) {
  if (!message?.text) return null;
  const isError = message.type === 'error';
  return (
    <View style={[styles.statusBanner, isError ? styles.statusError : styles.statusSuccess]}>
      <Ionicons
        name={isError ? 'alert-circle-outline' : 'checkmark-circle-outline'}
        size={16}
        color={isError ? '#A61B2B' : '#1F7A4E'}
      />
      <Text style={[styles.statusBannerText, isError ? styles.statusBannerErrorText : styles.statusBannerSuccessText]}>
        {message.text}
      </Text>
    </View>
  );
}

function BottomBar({ children, bottomInset, maxWidth, screenPadding, onHeightChange }) {
  return (
    <View
      style={[
        styles.bottomBar,
        {
          paddingBottom: bottomInset + 12,
          paddingHorizontal: screenPadding,
        },
      ]}
    >
      <View
        style={[styles.bottomBarInner, { maxWidth }]}
        onLayout={(event) => {
          onHeightChange?.(event.nativeEvent.layout.height + bottomInset + 12);
        }}
      >
        {children}
      </View>
    </View>
  );
}

function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function EmptyState({ title, subtitle }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateText}>{subtitle}</Text>
    </View>
  );
}

function PatientModal({ visible, onClose, onSave, initialValue, mode = 'basic', defaultEmail = '' }) {
  const [form, setForm] = useState(
    initialValue || { id: '', name: '', age: '', gender: 'male', email: defaultEmail, useSameEmailForOthers: true }
  );
  const showEmailFields = mode === 'primary-email';

  useEffect(() => {
    setForm(
      initialValue || { id: '', name: '', age: '', gender: 'male', email: defaultEmail, useSameEmailForOthers: true }
    );
  }, [defaultEmail, initialValue, visible]);

  const handleSave = () => {
    if (showEmailFields && !String(form.email || '').trim()) return;
    if (!form.name.trim() || !form.age || !form.gender) return;
    onSave({ ...form, age: String(form.age), email: String(form.email || '').trim() });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{form.id ? 'Edit Patient' : 'Add New Patient'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
          <SectionLabel>Full Name</SectionLabel>
          <TextInput
            value={form.name}
            onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
            style={styles.textField}
            placeholder="Rajesh Kumar"
            placeholderTextColor="#A09BB7"
          />
          <SectionLabel>Age</SectionLabel>
          <TextInput
            value={form.age}
            keyboardType="number-pad"
            onChangeText={(value) => setForm((current) => ({ ...current, age: value }))}
            style={styles.textField}
            placeholder="36"
            placeholderTextColor="#A09BB7"
          />
          <SectionLabel>Gender</SectionLabel>
          <ChoicePills options={GENDERS} value={form.gender} onChange={(value) => setForm((current) => ({ ...current, gender: value }))} compact />
          {showEmailFields ? (
            <>
              <SectionLabel>Email</SectionLabel>
              <TextInput
                value={form.email}
                onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
                style={styles.textField}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#A09BB7"
              />
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() =>
                  setForm((current) => ({
                    ...current,
                    useSameEmailForOthers: !current.useSameEmailForOthers,
                  }))
                }
              >
                <Ionicons
                  name={form.useSameEmailForOthers ? 'checkbox' : 'square-outline'}
                  size={20}
                  color="#7E22CE"
                />
                <Text style={styles.checkboxLabel}>Use same email for others</Text>
              </TouchableOpacity>
            </>
          ) : null}
          <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Save Patient</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ContactInfoModal({ visible, onClose, onSave, initialValue }) {
  const [form, setForm] = useState(initialValue || { phone: '', altPhone: '', whatsappPhone: '', email: '' });
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    setForm(initialValue || { phone: '', altPhone: '', whatsappPhone: '', email: '' });
    setErrorText('');
  }, [initialValue, visible]);

  const handleSave = () => {
    const phone = normalizePhoneValue(form.phone);
    const altPhone = normalizePhoneValue(form.altPhone || phone);
    const whatsappPhone = normalizePhoneValue(form.whatsappPhone || phone);
    const email = String(form.email || '').trim();

    if (!isValidPhoneValue(phone)) {
      setErrorText('Please enter a valid phone number');
      return;
    }
    if (!email) {
      setErrorText('Please enter an email address');
      return;
    }

    onSave({
      phone,
      altPhone,
      whatsappPhone,
      email,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Contact Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
          <SectionLabel>Phone</SectionLabel>
          <TextInput
            value={form.phone}
            onChangeText={(value) => setForm((current) => ({ ...current, phone: normalizePhoneValue(value) }))}
            style={styles.textField}
            keyboardType="phone-pad"
            placeholder="9876543210"
            placeholderTextColor="#A09BB7"
          />
          <SectionLabel>Alternate Phone</SectionLabel>
          <TextInput
            value={form.altPhone}
            onChangeText={(value) => setForm((current) => ({ ...current, altPhone: normalizePhoneValue(value) }))}
            style={styles.textField}
            keyboardType="phone-pad"
            placeholder="9876543210"
            placeholderTextColor="#A09BB7"
          />
          <SectionLabel>WhatsApp Phone</SectionLabel>
          <TextInput
            value={form.whatsappPhone}
            onChangeText={(value) => setForm((current) => ({ ...current, whatsappPhone: normalizePhoneValue(value) }))}
            style={styles.textField}
            keyboardType="phone-pad"
            placeholder="9876543210"
            placeholderTextColor="#A09BB7"
          />
          <SectionLabel>Email</SectionLabel>
          <TextInput
            value={form.email}
            onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
            style={styles.textField}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#A09BB7"
          />
          {errorText ? <Text style={styles.contactModalErrorText}>{errorText}</Text> : null}
          <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Save Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function BookingSuccessOverlay({ visible, animationValue }) {
  const scale = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });

  const opacity = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.successOverlayBackdrop}>
        <Animated.View style={[styles.successOverlayCard, { opacity, transform: [{ scale }] }]}>
          <View style={styles.successOverlayIcon}>
            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.successOverlayTitle}>Booking confirmed</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function BookingFlow() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const screenPadding = getScreenPadding(width);
  const contentWidth = getContentWidth(width, 460);
  const heroTitleSize = Math.round(getFluidValue(width, 320, 460, 26, 30));
  const isTablet = width >= 768;
  const bottomInset = insets.bottom;
  const shellWidth = isTablet ? Math.min(contentWidth + 140, 620) : contentWidth;
  const saveAddressSheetHeight = Math.round(height * 0.65);

  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState(createEmptyDraft());
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [savedPatients, setSavedPatients] = useState([]);
  const [packageResults, setPackageResults] = useState([]);
  const [likedPackageCodes, setLikedPackageCodes] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [customerBookingsLoading, setCustomerBookingsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [stickyFooterHeight, setStickyFooterHeight] = useState(0);
  const [bookingSuccessVisible, setBookingSuccessVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [patientModalState, setPatientModalState] = useState({ visible: false, patient: null, mode: 'basic' });
  const [patientDrawerVisible, setPatientDrawerVisible] = useState(false);
  const [slotDrawerVisible, setSlotDrawerVisible] = useState(false);
  const [selectedSlotPeriod, setSelectedSlotPeriod] = useState('Morning');
  const [actionLoading, setActionLoading] = useState('');
  const [deviceLocation, setDeviceLocation] = useState(null);
  const mapWebViewRef = useRef(null);
  const mapSyncTimeoutRef = useRef(null);
  const ignoreNextMapMoveRef = useRef(false);
  const resumeBookingAfterContactRef = useRef(false);
  const bookingSuccessAnimation = useRef(new Animated.Value(0)).current;
  const locationModuleReady = useMemo(() => hasNativeLocationModule(), []);
  const hasStickyBar = ['packages', 'addresses', 'patients', 'labs', 'slots', 'review'].includes(draft.step);
  const scrollBottomPadding = hasStickyBar ? Math.max(stickyFooterHeight, 104) + 20 : 20 + bottomInset;
  const safeAreaBackground = draft.step === 'home' ? '#8C33F4' : '#FFFFFF';

  const selectedAddress = useMemo(
    () => savedAddresses.find((item) => item.id === draft.selectedAddressId) || null,
    [draft.selectedAddressId, savedAddresses]
  );

  const selectedPatients = useMemo(
    () =>
      draft.selectedPatientIds
        .map((id) => savedPatients.find((item) => item.id === id))
        .filter(Boolean),
    [draft.selectedPatientIds, savedPatients]
  );

  const selectedPatient = selectedPatients[0] || null;

  const selectedSlot = useMemo(
    () => slots.find((item) => String(item.id) === String(draft.selectedSlotId)) || null,
    [draft.selectedSlotId, slots]
  );

  const selectedLab = REAL_BOOKING_PROVIDER;

  const pricingSummary = useMemo(
    () => buildPricingSummary(draft.selectedPackages, selectedPatients.length || 1),
    [draft.selectedPackages, selectedPatients.length]
  );

  const slotDateOptions = useMemo(
    () =>
      Array.from({ length: 4 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return {
          value: formatDateInput(date),
          dayLabel: new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(date).toUpperCase(),
          numberLabel: new Intl.DateTimeFormat('en-IN', { day: '2-digit' }).format(date),
        };
      }),
    []
  );

  const slotsByPeriod = useMemo(() => {
    const grouped = SLOT_PERIODS.reduce((accumulator, period) => ({ ...accumulator, [period.key]: [] }), {});
    slots.forEach((slot) => {
      const startText = slot.timeRange24?.split(' - ')?.[0] || '00:00';
      const startHour = Number(startText.split(':')[0] || 0);
      const period = SLOT_PERIODS.find((item) => startHour >= item.start && startHour < item.end)?.key || 'Morning';
      grouped[period].push(slot);
    });
    return grouped;
  }, [slots]);
  const mapRegion = useMemo(() => {
    const latitude = Number(draft.selectedLocality?.latitude || deviceLocation?.latitude || DEFAULT_MAP_CENTER.latitude);
    const longitude = Number(draft.selectedLocality?.longitude || deviceLocation?.longitude || DEFAULT_MAP_CENTER.longitude);

    return {
      latitude: Number.isFinite(latitude) ? latitude : DEFAULT_MAP_CENTER.latitude,
      longitude: Number.isFinite(longitude) ? longitude : DEFAULT_MAP_CENTER.longitude,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    };
  }, [deviceLocation, draft.selectedLocality?.latitude, draft.selectedLocality?.longitude]);
  const mapHtml = useMemo(
    () =>
      buildLocationMapHtml({
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      }),
    [mapRegion.latitude, mapRegion.longitude]
  );
  const mapStreetTiles = useMemo(
    () =>
      buildStreetTiles({
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
        width: shellWidth,
      }),
    [mapRegion.latitude, mapRegion.longitude, shellWidth]
  );

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const [storedDraft, storedAddresses, storedPatients, storedUserRaw] = await Promise.all([
          bookingStorage.loadDraft(),
          bookingStorage.loadAddresses(),
          bookingStorage.loadPatients(),
          AsyncStorage.getItem('userDetails'),
        ]);

        if (!mounted) return;

        const storedUser = JSON.parse(storedUserRaw || '{}');
        const nextDraft = {
          ...createEmptyDraft(),
          ...(storedDraft || {}),
          step: 'home',
          searchQuery: '',
          selectedPackages: [],
          selectedLabId: '',
          selectedSlotId: '',
          selectedDate: '',
          createdBooking: null,
          confirmation: null,
            contactInfo: {
              ...createEmptyDraft().contactInfo,
            phone: normalizePhoneValue(storedDraft?.contactInfo?.phone || storedUser?.phone || ''),
            altPhone: normalizePhoneValue(storedDraft?.contactInfo?.altPhone || ''),
            whatsappPhone: normalizePhoneValue(storedDraft?.contactInfo?.whatsappPhone || storedUser?.phone || ''),
            email: storedDraft?.contactInfo?.email || storedUser?.email || '',
            paymentMode: 'credit',
          },
        };

        let nextPatients = Array.isArray(storedPatients) ? storedPatients : [];
        if (!nextPatients.length && storedUser?.name) {
          const autoPatient = {
            id: createId('patient'),
            name: storedUser.name,
            age: '',
            gender: 'male',
          };
          nextPatients = [autoPatient];
          nextDraft.selectedPatientIds = [autoPatient.id];
        }

        setSavedPatients(nextPatients);
        setSavedAddresses(Array.isArray(storedAddresses) ? storedAddresses : []);
        setDraft(nextDraft);
        setLocationQuery(nextDraft.selectedLocality?.label || '');
      } catch (error) {
        console.error('Failed to hydrate booking flow', error);
      } finally {
        if (mounted) setHydrated(true);
      }
    }

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    bookingStorage.saveDraft(draft);
  }, [draft, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    bookingStorage.saveAddresses(savedAddresses);
  }, [hydrated, savedAddresses]);

  useEffect(() => {
    if (!hydrated) return;
    bookingStorage.savePatients(savedPatients);
  }, [hydrated, savedPatients]);

  useEffect(() => {
    if (!bookingSuccessVisible) {
      bookingSuccessAnimation.setValue(0);
      return;
    }

    Animated.spring(bookingSuccessAnimation, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 90,
    }).start();
  }, [bookingSuccessAnimation, bookingSuccessVisible]);

  useEffect(() => {
    return () => {
      if (mapSyncTimeoutRef.current) {
        clearTimeout(mapSyncTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setPackagesLoading(true);
        const response = await bookingApi.searchPackages(draft.searchQuery);
        if (!cancelled) setPackageResults(response.packages || []);
      } catch (error) {
        if (!cancelled) setStatusMessage({ type: 'error', text: cleanMessage(error, 'Could not load packages.') });
      } finally {
        if (!cancelled) setPackagesLoading(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [draft.searchQuery]);

  useEffect(() => {
    if (draft.step !== 'location' || locationQuery.trim().length < 2) {
      setLocationResults([]);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setLocationLoading(true);
        const response = await bookingApi.searchAddresses(locationQuery.trim());
        if (!cancelled) {
          setLocationResults(
            response.map((item) => {
              const address = item.address || {};
              const label =
                address.suburb ||
                address.neighbourhood ||
                address.city_district ||
                address.road ||
                item.name ||
                item.display_name.split(',')[0];

              return {
                eloc: `osm:${item.place_id}`,
                label,
                localityLabel: label,
                addressLine: item.display_name,
                pincode: address.postcode || '',
                city: address.city || address.town || address.village || address.state_district || '',
                state: address.state || '',
                latitude: Number(item.lat),
                longitude: Number(item.lon),
              };
            })
          );
        }
      } catch (error) {
        if (!cancelled) setStatusMessage({ type: 'error', text: cleanMessage(error, 'Could not load address suggestions.') });
      } finally {
        if (!cancelled) setLocationLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [draft.step, locationQuery]);

  useEffect(() => {
    if (!slotDrawerVisible || !selectedAddress?.latitude || !selectedAddress?.longitude || !draft.selectedDate || !draft.slotGender) {
      return undefined;
    }

    let cancelled = false;
    async function loadSlots() {
      try {
        setSlotsLoading(true);
        const response = await bookingApi.getTimeSlots({
          collectionDate: draft.selectedDate,
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude,
          customerGender: draft.slotGender,
        });
        if (!cancelled) {
          const nextSlots = response.slots || [];
          setSlots(nextSlots);
          if (!nextSlots.some((slot) => String(slot.id) === String(draft.selectedSlotId))) {
            setDraft((current) => ({ ...current, selectedSlotId: '' }));
          }
        }
      } catch (error) {
        if (!cancelled) {
          setSlots([]);
          setStatusMessage({ type: 'error', text: cleanMessage(error, 'Could not load time slots.') });
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }

    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [draft.selectedDate, draft.selectedSlotId, draft.slotGender, selectedAddress, slotDrawerVisible]);

  const updateDraft = (updater) => {
    setDraft((current) => (typeof updater === 'function' ? updater(current) : { ...current, ...updater }));
  };

  const buildSyntheticLocation = ({ latitude, longitude, reverseItem, labelHint }) => {
    const reverseAddress = reverseItem?.address || {};
    const localityName =
      reverseAddress.suburb ||
      reverseAddress.neighbourhood ||
      reverseAddress.city_district ||
      reverseAddress.town ||
      reverseAddress.village ||
      reverseItem?.name;
    const localityLabel =
      labelHint ||
      [
        localityName,
        reverseAddress.city || reverseAddress.town || reverseAddress.village || reverseAddress.state_district || reverseItem?.city,
      ]
        .filter(Boolean)
        .join(', ');

    return {
      eloc: `gps:${latitude},${longitude}`,
      label: localityLabel || 'Current location',
      localityLabel: localityLabel || 'Current location',
      addressLine:
        [
          reverseAddress.road || reverseAddress.suburb || reverseItem?.street,
          reverseAddress.city || reverseAddress.town || reverseAddress.village || reverseItem?.city,
          reverseAddress.state || reverseItem?.region,
        ]
          .filter(Boolean)
          .join(', ') || localityLabel || 'Current location',
      areaPincodeId: '',
      pincode: reverseAddress.postcode || reverseItem?.postalCode || '',
      city: reverseAddress.city || reverseAddress.town || reverseAddress.village || reverseItem?.city || reverseItem?.district || '',
      state: reverseAddress.state || reverseItem?.region || '',
      latitude,
      longitude,
    };
  };

  const moveMapToCoordinates = ({ latitude, longitude }) => {
    const nextLatitude = Number(latitude);
    const nextLongitude = Number(longitude);

    if (!Number.isFinite(nextLatitude) || !Number.isFinite(nextLongitude)) {
      return;
    }

    if (mapWebViewRef.current) {
      ignoreNextMapMoveRef.current = true;
      mapWebViewRef.current.injectJavaScript(
        `window.__bookingMap && window.__bookingMap.setCenter(${nextLatitude}, ${nextLongitude}, 16); true;`
      );
    }
  };

  const syncMapCenterToLocation = async ({ latitude, longitude, source }) => {
    try {
      if (source === 'map') {
        setActionLoading('map-location');
      } else {
        setActionLoading('locality');
      }

      const reverseItem = await bookingApi.reverseGeocodeCoordinates({ latitude, longitude });
      const fallbackLocation = buildSyntheticLocation({
        latitude,
        longitude,
        reverseItem,
        labelHint: reverseItem?.display_name,
      });

      await selectLocationOption(fallbackLocation, {
        skipLookup: true,
        preserveCoordinates: true,
      });
    } catch (error) {
      setStatusMessage({ type: 'error', text: cleanMessage(error, 'Could not update the pinned location.') });
    } finally {
      if (source === 'map') {
        setActionLoading('');
      }
    }
  };

  const selectLocationOption = async (item, { skipLookup = false, preserveCoordinates = false } = {}) => {
    try {
      setActionLoading('locality');
      const nextLocation =
        skipLookup || item.eloc?.startsWith('gps:') || item.eloc?.startsWith('osm:')
          ? item
          : {
              ...item,
              ...(await bookingApi.getLocationByEloc(item.eloc)),
            };

      const hydratedLocation = {
        ...item,
        label: item.label,
        localityLabel: item.localityLabel || item.label,
        latitude: preserveCoordinates ? item.latitude ?? nextLocation.latitude ?? '' : nextLocation.latitude ?? item.latitude ?? '',
        longitude: preserveCoordinates ? item.longitude ?? nextLocation.longitude ?? '' : nextLocation.longitude ?? item.longitude ?? '',
        pincode: item.pincode || nextLocation.pincode || '',
        city: item.city || nextLocation.city || '',
        state: item.state || nextLocation.state || '',
      };

      setDeviceLocation({
        latitude: hydratedLocation.latitude,
        longitude: hydratedLocation.longitude,
      });
      setLocationQuery(hydratedLocation.localityLabel || hydratedLocation.label || '');
      updateDraft((current) => ({
        ...current,
        selectedLocality: hydratedLocation,
        currentAddressForm: {
          ...current.currentAddressForm,
          pincode: String(hydratedLocation.pincode || current.currentAddressForm.pincode || ''),
        },
      }));
      moveMapToCoordinates(
        {
          latitude: hydratedLocation.latitude,
          longitude: hydratedLocation.longitude,
        }
      );
    } catch (error) {
      setStatusMessage({ type: 'error', text: cleanMessage(error, 'Could not confirm this locality.') });
    } finally {
      setActionLoading('');
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setActionLoading('current-location');
      const Location = await getLocationModule();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setStatusMessage({ type: 'error', text: 'Location permission is required to use your current location.' });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      setDeviceLocation({ latitude, longitude });
      moveMapToCoordinates({ latitude, longitude });
      await syncMapCenterToLocation({ latitude, longitude, source: 'gps' });
    } catch (error) {
      setStatusMessage({ type: 'error', text: cleanMessage(error, 'Could not fetch your current location.') });
    } finally {
      setActionLoading('');
    }
  };

  const goBack = () => {
    if (draft.step === 'home') {
      router.back();
      return;
    }
    if (draft.step === 'orders') {
      updateDraft({ step: 'home' });
      setStatusMessage(null);
      return;
    }
    const currentIndex = FLOW_INDEX.indexOf(draft.step);
    const previousStep = FLOW_INDEX[Math.max(0, currentIndex - 1)];
    updateDraft({ step: previousStep });
    setStatusMessage(null);
  };

  const loadCustomerBookings = async () => {
    const phone = String(draft.contactInfo.phone || '').trim();
    if (!phone) {
      setStatusMessage({ type: 'error', text: 'Add your phone number to view booked orders.' });
      return;
    }

    try {
      setCustomerBookingsLoading(true);
      setStatusMessage(null);
      const response = await bookingApi.getBookings({ phone });
      setCustomerBookings(Array.isArray(response.bookings) ? response.bookings : []);
      updateDraft({ step: 'orders' });
    } catch (error) {
      setStatusMessage({ type: 'error', text: cleanMessage(error, 'Could not load your bookings.') });
    } finally {
      setCustomerBookingsLoading(false);
    }
  };

  const handlePackageToggle = (pkg) => {
    let shouldOpenPatientDrawer = false;
    updateDraft((current) => {
      const exists = current.selectedPackages.some((item) => item.code === pkg.code);
      const nextSelectedPackages = exists
        ? current.selectedPackages.filter((item) => item.code !== pkg.code)
        : [...current.selectedPackages, pkg];

      shouldOpenPatientDrawer = !exists && nextSelectedPackages.length > 0;

      return {
        ...current,
        selectedPackages: nextSelectedPackages,
      };
    });

    if (shouldOpenPatientDrawer && selectedAddress) {
      setTimeout(() => setPatientDrawerVisible(true), 0);
    } else if (shouldOpenPatientDrawer) {
      setStatusMessage({ type: 'error', text: 'Choose an address before selecting patients.' });
      updateDraft({ step: 'addresses' });
    }
  };

  const removeSelectedPackage = (packageCode) => {
    updateDraft((current) => ({
      ...current,
      selectedPackages: current.selectedPackages.filter((item) => item.code !== packageCode),
    }));
  };

  const handleSelectLocality = async (item) => {
    await selectLocationOption(item);
  };

  const handleMapMessage = (event) => {
    let payload;
    try {
      payload = JSON.parse(event.nativeEvent.data || '{}');
    } catch (_error) {
      return;
    }

    if (payload.type === 'map-error') {
      setStatusMessage({ type: 'error', text: payload.message || 'Could not load the map view.' });
      return;
    }

    const latitude = Number(payload?.latitude);
    const longitude = Number(payload?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    if (payload.type === 'map-ready') {
      moveMapToCoordinates({
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      });
      return;
    }

    if (payload.type !== 'moveend') {
      return;
    }

    if (ignoreNextMapMoveRef.current) {
      ignoreNextMapMoveRef.current = false;
      return;
    }

    setDeviceLocation({ latitude, longitude });
    if (mapSyncTimeoutRef.current) {
      clearTimeout(mapSyncTimeoutRef.current);
    }

    mapSyncTimeoutRef.current = setTimeout(() => {
      syncMapCenterToLocation({ latitude, longitude, source: 'map' });
    }, 450);
  };

  const handleSaveAddress = () => {
    if (!draft.selectedLocality?.eloc) {
      setStatusMessage({ type: 'error', text: 'Choose a location first.' });
      return;
    }
    if (!draft.currentAddressForm.houseFlat.trim()) {
      setStatusMessage({ type: 'error', text: 'Enter house or flat details before saving.' });
      return;
    }

    const id = draft.editingAddressId || createId('address');
    const nextAddress = {
      id,
      tag: draft.currentAddressForm.tag,
      eloc: draft.selectedLocality.eloc,
      localityLabel: draft.selectedLocality.localityLabel || draft.selectedLocality.label,
      addressLine: draft.selectedLocality.addressLine || draft.selectedLocality.label,
      city: draft.selectedLocality.city,
      state: draft.selectedLocality.state,
      areaPincodeId: draft.selectedLocality.areaPincodeId,
      latitude: draft.selectedLocality.latitude,
      longitude: draft.selectedLocality.longitude,
      houseFlat: draft.currentAddressForm.houseFlat,
      apartment: draft.currentAddressForm.apartment,
      landmark: draft.currentAddressForm.landmark,
      pincode: draft.currentAddressForm.pincode || draft.selectedLocality.pincode || '',
    };

    setSavedAddresses((current) => {
      const exists = current.some((item) => item.id === id);
      return exists ? current.map((item) => (item.id === id ? nextAddress : item)) : [nextAddress, ...current];
    });

    updateDraft((current) => ({
      ...current,
      selectedAddressId: id,
      step: 'packages',
      editingAddressId: '',
      currentAddressForm: {
        tag: 'Home',
        houseFlat: '',
        apartment: '',
        landmark: '',
        pincode: '',
      },
    }));
  };

  const handleEditAddress = (address) => {
    setLocationQuery(address.localityLabel || '');
    updateDraft((current) => ({
      ...current,
      step: 'saveAddress',
      editingAddressId: address.id,
      selectedLocality: {
        eloc: address.eloc,
        label: address.localityLabel,
        localityLabel: address.localityLabel,
        addressLine: address.addressLine,
        areaPincodeId: address.areaPincodeId,
        pincode: address.pincode,
        city: address.city,
        state: address.state,
        latitude: address.latitude,
        longitude: address.longitude,
      },
      currentAddressForm: {
        tag: address.tag || 'Home',
        houseFlat: address.houseFlat || '',
        apartment: address.apartment || '',
        landmark: address.landmark || '',
        pincode: String(address.pincode || ''),
      },
    }));
  };

  const handlePatientSave = (patient) => {
    if (!patient.id && savedPatients.length >= 5) {
      setStatusMessage({ type: 'error', text: 'You can add up to 5 patients only.' });
      return;
    }

    const nextPatient = {
      id: patient.id || createId('patient'),
      name: patient.name.trim(),
      age: String(patient.age || ''),
      gender: patient.gender,
      email: String(patient.email || '').trim(),
    };

    setSavedPatients((current) => {
      const nextList = current.some((item) => item.id === nextPatient.id)
        ? current.map((item) => (item.id === nextPatient.id ? nextPatient : item))
        : [nextPatient, ...current];

      if (patient.useSameEmailForOthers && nextPatient.email) {
        return nextList.map((item) => ({ ...item, email: nextPatient.email }));
      }

      return nextList;
    });

    if (nextPatient.email) {
      updateDraft((current) => ({
        ...current,
        contactInfo: {
          ...current.contactInfo,
          email: nextPatient.email,
        },
      }));
    }

    updateDraft((current) => ({
      ...current,
      selectedPatientIds: current.selectedPatientIds.includes(nextPatient.id)
        ? current.selectedPatientIds
        : [nextPatient.id, ...current.selectedPatientIds].slice(0, 5),
      slotGender: current.slotGender || nextPatient.gender,
    }));
    setPatientModalState({ visible: false, patient: null, mode: 'basic' });
    setStatusMessage(null);

  };

  const togglePatientSelection = (patientId) => {
    updateDraft((current) => {
      const selected = current.selectedPatientIds.includes(patientId);
      if (!selected && current.selectedPatientIds.length >= 5) {
        setStatusMessage({ type: 'error', text: 'You can select up to 5 patients only.' });
        return current;
      }

      return {
        ...current,
        selectedPatientIds: selected
          ? current.selectedPatientIds.filter((id) => id !== patientId)
          : [...current.selectedPatientIds, patientId].slice(0, 5),
      };
    });
  };

  const toggleLikedPackage = (packageCode) => {
    if (!packageCode) return;
    setLikedPackageCodes((current) =>
      current.includes(packageCode) ? current.filter((code) => code !== packageCode) : [...current, packageCode]
    );
  };

  const handlePatientDelete = (patientId) => {
    setSavedPatients((current) => current.filter((patient) => patient.id !== patientId));
    updateDraft((current) => ({
      ...current,
      selectedPatientIds: current.selectedPatientIds.filter((id) => id !== patientId),
    }));
  };

  const openSlotDrawerFromPackages = () => {
    if (!draft.selectedPackages.length) {
      return;
    }

    if (!selectedAddress) {
      setStatusMessage({ type: 'error', text: 'Choose an address before selecting a visit slot.' });
      updateDraft({ step: 'addresses' });
      return;
    }

    updateDraft((current) => ({
      ...current,
      slotGender: selectedPatient?.gender || current.slotGender || 'male',
      selectedLabId: 'redcliffe',
      selectedDate: current.selectedDate || slotDateOptions[0]?.value || '',
    }));
    setSlotDrawerVisible(true);
  };

  const continueFromPatientDrawer = () => {
    if (!draft.selectedPatientIds.length) {
      setStatusMessage({ type: 'error', text: 'Choose at least one patient.' });
      return;
    }

    setPatientDrawerVisible(false);
    updateDraft((current) => ({
      ...current,
      slotGender: selectedPatient?.gender || current.slotGender,
      selectedLabId: 'redcliffe',
      selectedDate: current.selectedDate || slotDateOptions[0]?.value || '',
    }));
    setSlotDrawerVisible(true);
  };

  const continueFromSlotDrawer = () => {
    if (!draft.selectedSlotId) {
      setStatusMessage({ type: 'error', text: 'Choose a visit slot.' });
      return;
    }

    setSlotDrawerVisible(false);
    updateDraft({ step: 'review' });
  };

  const openContactModal = ({ resumeBooking = false } = {}) => {
    resumeBookingAfterContactRef.current = resumeBooking;
    setContactModalVisible(true);
  };

  const handleContactSave = (contactInfo) => {
    updateDraft((current) => ({
      ...current,
      contactInfo: {
        ...current.contactInfo,
        ...contactInfo,
      },
    }));
    setContactModalVisible(false);
    setStatusMessage(null);

    if (resumeBookingAfterContactRef.current) {
      resumeBookingAfterContactRef.current = false;
      setTimeout(() => {
        handleBookNow();
      }, 50);
    }
  };

  const buildCheckoutItems = () => {
    const patientCount = Math.max(1, selectedPatients.length || 1);
    const checkoutItemsByVariant = draft.selectedPackages.reduce((accumulator, item) => {
      const variantId = BOOKING_TEST_VARIANT_ID_MAP[normalizePackageNameKey(item.name)];
      if (!variantId) {
        throw new Error(`No checkout product mapped for "${item.name}".`);
      }

      const existing = accumulator.get(variantId);
      if (existing) {
        existing.quantity += patientCount;
        return accumulator;
      }

      accumulator.set(variantId, {
        id: variantId,
        title: item.name,
        description: item.description || '',
        first_variant_id: variantId,
        quantity: patientCount,
      });
      return accumulator;
    }, new Map());

    return Array.from(checkoutItemsByVariant.values());
  };

  const handleBookNow = async () => {
    if (!selectedAddress) {
      setStatusMessage({ type: 'error', text: 'Choose an address first.' });
      updateDraft({ step: 'addresses' });
      return;
    }
    if (!selectedPatients.length) {
      setStatusMessage({ type: 'error', text: 'Choose at least one patient.' });
      setPatientDrawerVisible(true);
      return;
    }
    if (!selectedSlot) {
      setStatusMessage({ type: 'error', text: 'Choose a visit slot.' });
      updateDraft((current) => ({
        ...current,
        selectedDate: current.selectedDate || slotDateOptions[0]?.value || '',
        slotGender: current.slotGender || selectedPatient?.gender || 'male',
      }));
      setSlotDrawerVisible(true);
      return;
    }
    if (!isValidPhoneValue(draft.contactInfo.phone) || !draft.contactInfo.email.trim()) {
      setStatusMessage({ type: 'error', text: 'Add a valid phone number and email before continuing.' });
      openContactModal({ resumeBooking: true });
      return;
    }

    try {
      setActionLoading('booking');
      const checkoutItems = buildCheckoutItems();
      const payload = createBookingPayload({
        draft,
        selectedAddress,
        selectedPatients,
        selectedSlot,
      });
      const created = await bookingApi.createBooking(payload);
      const bookingId = created.booking?.bookingId || created.bookingId;
      const cartResponse = await bookingApi.requestJson('/api/shopify/create-cart', {
        method: 'POST',
        body: JSON.stringify({ items: checkoutItems }),
      });

      updateDraft((current) => ({
        ...current,
        createdBooking: created,
        confirmation: null,
      }));
      setStatusMessage(null);
      const cartToken = String(cartResponse.cartId || '').split('/').pop();
      const productsString = JSON.stringify(
        checkoutItems.map((item) => ({
          id: item.id,
          title: item.title,
          image: '',
          description: item.description,
        }))
      );

      router.push({
        pathname: '/GoKwikCheckout',
        params: {
          cartId: cartToken,
          bookingId: String(bookingId || ''),
          total: String(pricingSummary.payable),
          products: productsString,
        },
      });
    } catch (error) {
      setStatusMessage({ type: 'error', text: cleanMessage(error, 'Could not complete the booking.') });
    } finally {
      setActionLoading('');
    }
  };

  const openAddressFlow = () => {
    updateDraft((current) => ({
      ...current,
      step: 'location',
      selectedLocality: null,
      editingAddressId: '',
      currentAddressForm: {
        tag: 'Home',
        houseFlat: '',
        apartment: '',
        landmark: '',
        pincode: '',
      },
    }));
    setLocationQuery('');
    setLocationResults([]);
  };

  const renderHome = () => (
    <>
      <LinearGradient colors={['#7E22CE', '#A855F7']} style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroTitleRow}>
            <TouchableOpacity onPress={goBack} style={styles.heroRoundButton}>
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.heroTitle, styles.heroTitleInline, { fontSize: heroTitleSize }]}>Lab Tests</Text>
          </View>
          <TouchableOpacity style={styles.heroOrdersButton} onPress={loadCustomerBookings}>
            <Ionicons name="cart-outline" size={14} color="#FFFFFF" />
            <Text style={styles.heroOrdersText}>My Orders</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.heroLocationText}>
          <Ionicons name="location-sharp" size={12} color="#FFFFFF" /> Home: {selectedAddress?.localityLabel || 'Chhatarpur'}
        </Text>
      </LinearGradient>

      <View style={styles.floatingSearchCard}>
        <SearchField
          value={draft.searchQuery}
          onChangeText={(value) => updateDraft({ searchQuery: value })}
          onFocus={() => updateDraft({ step: 'packages' })}
          placeholder="Search & Book 'Vitamin D3'"
        />
      </View>

      <View style={styles.offerStrip}>
        <MaterialCommunityIcons name="brightness-percent" size={22} color="#F5541E" />
        <Text style={styles.offerStripText}>
          Get upto <Text style={styles.offerStripHighlight}>20% OFF</Text> on lab tests
        </Text>
      </View>

      <View style={styles.promoShell}>
        <LinearGradient colors={['#8B1CF3', '#7C3AED']} style={styles.promoCard}>
          <View style={styles.promoTextWrap}>
            <Text style={styles.promoTitle}>20% Off on Full Body Checkups</Text>
            <Text style={styles.promoSubtitle}>Book now and get free home sample collection.</Text>
            <TouchableOpacity style={styles.promoButton} onPress={() => updateDraft({ step: 'packages' })}>
              <Text style={styles.promoButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promoImageCard}>
            <Image
              source={{ uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Image_27.png?v=1779344475' }}
              style={styles.promoImage}
              resizeMode="cover"
            />
          </View>
        </LinearGradient>
      <View style={styles.promoFooter}>
          <Ionicons name="location" size={22} color="#7E22CE" />
          <Text style={styles.promoFooterText}>
            NABL certified diagnostics with home sample collection
          </Text>
        </View>
      </View>

      <View style={styles.iconFeatureRow}>
        {[
          {
            image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Group_27.png?v=1779348551',
            label: 'Fast\nReports',
          },
          {
            image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_29.png?v=1779348613',
            label: 'NABL\nCertified labs',
          },
          {
            image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_30.png?v=1779348551',
            label: 'On-time\nCollection',
          },
        ].map((item) => (
          <View key={item.label} style={styles.iconFeatureCard}>
            <Image source={{ uri: item.image }} style={styles.iconFeatureImage} resizeMode="contain" />
            <Text style={styles.iconFeatureText}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.trustBanner}>
        <Text style={styles.trustBannerText}>
          <Text style={styles.trustBannerStars}>★★★★★</Text> Trusted by 1lakh+ Customers
        </Text>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Popular Packages</Text>
        <TouchableOpacity onPress={() => updateDraft({ step: 'packages' })}>
          <Text style={styles.sectionAction}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularScroller}>
        {packageResults.slice(0, 6).map((item, index) => {
          const isSelected = draft.selectedPackages.some((pkg) => pkg.code === item.code);
          const isLiked = likedPackageCodes.includes(item.code);
          const actualPrice = Number(item?.price || 0);
          const effectivePrice = getPackageEffectivePrice(item) || 0;
          const showStrikePrice = actualPrice > effectivePrice;
          const badgeLabel = index % 2 === 0 ? 'Top Rated' : 'Health Saver';
          const badgeStyle = index % 2 === 0 ? styles.packagePillBadge : styles.packagePillBadgeAlt;
          const badgeTextStyle = index % 2 === 0 ? styles.packagePillBadgeText : styles.packagePillBadgeAltText;

          return (
            <TouchableOpacity
              key={item.code}
              style={[styles.packagePreviewCard, index === Math.min(packageResults.length, 6) - 1 && styles.packagePreviewCardLast]}
              onPress={() => {
                handlePackageToggle(item);
                updateDraft({ step: 'packages' });
              }}
            >
              <View style={styles.packagePreviewTopRow}>
                <View style={badgeStyle}>
                  <Text style={badgeTextStyle}>{badgeLabel}</Text>
                </View>
                <Pressable
                  hitSlop={8}
                  onPress={(event) => {
                    event?.stopPropagation?.();
                    toggleLikedPackage(item.code);
                  }}
                >
                  <Ionicons name="heart" size={28} color={isLiked ? '#DC2626' : '#4B4B63'} />
                </Pressable>
              </View>
              <Text style={styles.packagePreviewName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.packagePreviewMeta}>Includes {item.parameters || 0} important tests</Text>
              <View style={styles.packagePreviewPriceWrap}>
                {showStrikePrice ? <Text style={styles.packagePreviewStrikePrice}>₹{actualPrice}</Text> : null}
                <Text style={styles.packagePreviewPrice}>₹{effectivePrice || '--'}</Text>
              </View>
              <View style={styles.packagePreviewAdd}>
                <Ionicons name={isSelected ? 'checkmark' : 'add'} size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );

  const renderPackages = () => (
    <>
      <ScreenHeader title="Popular Tests" onBack={goBack} />
      <SearchField
        value={draft.searchQuery}
        onChangeText={(value) => updateDraft({ searchQuery: value })}
        placeholder="Search & Book 'Lipid Profile'"
      />
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Popular Tests</Text>
      </View>
      {packagesLoading ? (
        <View style={styles.loaderArea}>
          <ActivityIndicator color="#7E22CE" />
        </View>
      ) : null}
      {!packagesLoading && !packageResults.length ? (
        <EmptyState title="No packages found" subtitle="Try another search term or continue with the default flow." />
      ) : null}
      {packageResults.map((item) => {
        const selected = draft.selectedPackages.some((pkg) => pkg.code === item.code);
        return (
          <View key={item.code} style={styles.packageListCard}>
            <View style={styles.packageListIcon}>
              <MaterialCommunityIcons name="flask-empty-outline" size={18} color="#7E22CE" />
            </View>
            <View style={styles.packageListTextWrap}>
              <View style={styles.packageTagPill}>
                <Text style={styles.packageTagPillText}>Pathology</Text>
              </View>
              <Text style={styles.packageListName}>{item.name}</Text>
              <Text style={styles.packageListMeta}>Reports in {item.tatTime || '24'} hrs</Text>
            </View>
            <TouchableOpacity style={[styles.addButton, selected && styles.removeButton]} onPress={() => handlePackageToggle(item)}>
              <Ionicons name={selected ? 'close' : 'add'} size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        );
      })}
    </>
  );

  const renderAddresses = () => (
    <>
      <ScreenHeader title="Select Address" onBack={goBack} />
      <TouchableOpacity style={styles.currentLocationCard} onPress={openAddressFlow}>
        <View style={styles.currentLocationIcon}>
          <Ionicons name="location-outline" size={18} color="#B17A1C" />
        </View>
        <View style={styles.prescriptionTextWrap}>
          <Text style={styles.currentLocationLabel}>Add as new address</Text>
          <Text style={styles.currentLocationTitle}>Current location</Text>
          <Text style={styles.currentLocationSubtitle}>{draft.selectedLocality?.localityLabel || 'Chhatarpur'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#8D8AA6" />
      </TouchableOpacity>

      <Text style={styles.savedAddressesLabel}>SAVED ADDRESSES</Text>

      {!savedAddresses.length ? <EmptyState title="No saved addresses" subtitle="Add a home collection address to continue." /> : null}
      {savedAddresses.map((address) => {
        const selected = draft.selectedAddressId === address.id;
        return (
          <TouchableOpacity
            key={address.id}
            style={[styles.addressCard, selected && styles.addressCardSelected]}
            onPress={() => updateDraft({ selectedAddressId: address.id })}
          >
            <View style={styles.addressCardIcon}>
              <Ionicons name="home-outline" size={18} color="#7E22CE" />
            </View>
            <View style={styles.addressCardContent}>
              <View style={styles.addressCardTitleRow}>
                <Text style={styles.addressCardTitle}>{address.tag}</Text>
                {selected ? (
                  <View style={styles.selectedChip}>
                    <Text style={styles.selectedChipText}>Selected</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.addressCardText}>{buildAddressLabel(address)}</Text>
              <Text style={styles.addressCardDistance}>{address.localityLabel}</Text>
            </View>
            <TouchableOpacity onPress={() => handleEditAddress(address)} style={styles.miniIconButton}>
              <Ionicons name="pencil-outline" size={16} color="#B05CFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}

    </>
  );

  const renderLocation = () => (
    <>
      <ScreenHeader title="Choose location" onBack={goBack} />
      <SearchField value={locationQuery} onChangeText={setLocationQuery} placeholder="Search" />
      <TouchableOpacity
        style={[styles.currentLocationAction, !locationModuleReady && styles.currentLocationActionDisabled]}
        onPress={handleUseCurrentLocation}
        disabled={!locationModuleReady}
      >
        <View style={styles.currentLocationActionIcon}>
          <Ionicons name="locate" size={16} color="#A13AF4" />
        </View>
        <View style={styles.currentLocationActionTextWrap}>
          <Text style={styles.currentLocationActionTitle}>Use current location</Text>
          <Text style={styles.currentLocationActionSubtitle}>
            {!locationModuleReady
              ? 'Rebuild the app once to enable GPS current location.'
              : actionLoading === 'current-location'
              ? 'Detecting your location...'
              : actionLoading === 'map-location'
                ? 'Updating the pinned address from the map center...'
                : deviceLocation
                  ? 'GPS found. Matching with nearby collection areas.'
                  : 'Detect automatically using GPS'}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.mapStage}>
        <View style={styles.mapStaticTileLayer} pointerEvents="none">
          {mapStreetTiles.map((tile) => (
            <Image
              key={tile.key}
              source={{ uri: tile.url }}
              style={[styles.mapStaticTile, { left: tile.left, top: tile.top }]}
              onError={() => setStatusMessage({ type: 'error', text: 'Street map tiles could not load on this device network.' })}
            />
          ))}
        </View>
        <WebView
          ref={mapWebViewRef}
          source={{ html: mapHtml, baseUrl: 'https://muditam.local/' }}
          style={styles.mapLeafletView}
          backgroundColor="transparent"
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          onMessage={handleMapMessage}
          onError={() => setStatusMessage({ type: 'error', text: 'Could not load the OpenStreetMap view.' })}
          scrollEnabled={false}
          nestedScrollEnabled={false}
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
        <View style={styles.mapPinWrap} pointerEvents="none">
          <Ionicons name="location-sharp" size={118} color="#7E22CE" style={styles.mapPinFront} />
          <View style={styles.mapPinTipShadow} />
        </View>
        <TouchableOpacity
          style={[styles.mapLocateButton, !locationModuleReady && styles.currentLocationActionDisabled]}
          onPress={handleUseCurrentLocation}
          disabled={!locationModuleReady}
        >
          <Ionicons name="locate" size={18} color="#A13AF4" />
        </TouchableOpacity>
      </View>
      <View style={styles.locationSheetCard}>
        <View style={styles.locationHandle} />
        {locationLoading || actionLoading === 'map-location' || actionLoading === 'current-location' ? (
          <View style={styles.loaderArea}>
            <ActivityIndicator color="#7E22CE" />
          </View>
        ) : null}
        {!locationLoading && locationResults.length ? (
          <ScrollView style={styles.locationResultList}>
            {locationResults.map((item) => (
              <TouchableOpacity key={`${item.eloc}-${item.label}`} style={styles.locationResultRow} onPress={() => handleSelectLocality(item)}>
                <Ionicons name="location-outline" size={18} color="#7E22CE" />
                <View style={styles.locationResultTextWrap}>
                  <Text style={styles.locationResultTitle}>{item.label}</Text>
                  <Text style={styles.locationResultSubtitle}>{item.addressLine}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}
        {!locationLoading && !locationResults.length ? (
          <View style={styles.locationEmptyCard}>
            <View style={styles.locationEmptyIcon}>
              <Ionicons name="location-outline" size={18} color="#A13AF4" />
            </View>
            <Text style={styles.locationEmptyTitle}>Move the map or search for a locality</Text>
            <Text style={styles.locationEmptyText}>{"Keep the pin over the pickup point and we'll update the address here."}</Text>
          </View>
        ) : null}
        {draft.selectedLocality ? (
          <View style={styles.selectedLocationPreview}>
            <View style={styles.selectedLocationIcon}>
              <Ionicons name="location-outline" size={18} color="#A13AF4" />
            </View>
            <View style={styles.selectedLocationTextWrap}>
              <Text style={styles.selectedLocationPreviewTitle}>{draft.selectedLocality.label}</Text>
              <Text style={styles.selectedLocationPreviewText}>
                {[draft.selectedLocality.city, draft.selectedLocality.state, draft.selectedLocality.pincode].filter(Boolean).join(', ')}
              </Text>
            </View>
          </View>
        ) : null}
        <TouchableOpacity
          style={[styles.primaryButton, !draft.selectedLocality && styles.primaryButtonDisabled]}
          disabled={!draft.selectedLocality}
          onPress={() => openSaveAddressDrawer()}
        >
          <Text style={styles.primaryButtonText}>{actionLoading === 'locality' ? 'Confirming...' : 'Confirm'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const openSaveAddressDrawer = () => {
    updateDraft((current) => ({
      ...current,
      step: 'saveAddress',
      currentAddressForm: {
        ...current.currentAddressForm,
        houseFlat: current.currentAddressForm.houseFlat || current.selectedLocality?.label || '',
        pincode: current.currentAddressForm.pincode || current.selectedLocality?.pincode || '',
      },
    }));
  };

  const renderSaveAddressDrawer = () => (
    <View style={styles.saveAddressDrawerScreen}>
      <View style={[styles.saveAddressSheet, { height: saveAddressSheetHeight }]}>
        <View style={styles.saveAddressSheetHeader}>
          <Text style={styles.saveAddressSheetTitle}>Save Address</Text>
          <TouchableOpacity style={styles.saveAddressCloseButton} onPress={goBack}>
            <Ionicons name="close" size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.saveAddressSheetScroll}
          contentContainerStyle={styles.saveAddressSheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.locationSummaryCard}>
            <Ionicons name="location-outline" size={18} color="#A100FF" />
            <View style={styles.locationSummaryTextWrap}>
              <Text style={styles.locationSummaryTitle}>Your Current Location</Text>
              <Text style={styles.locationSummaryText} numberOfLines={1}>
                {draft.selectedLocality
                  ? [draft.selectedLocality.label, draft.selectedLocality.city, draft.selectedLocality.state]
                      .filter(Boolean)
                      .join(', ')
                  : 'Select a location first'}
              </Text>
            </View>
            <TouchableOpacity style={styles.locationSummaryEditButton} onPress={() => updateDraft({ step: 'location' })}>
              <Ionicons name="pencil" size={15} color="#B000FF" />
            </TouchableOpacity>
          </View>
          <SectionLabel>Save address as</SectionLabel>
          <View style={styles.tagRow}>
            {ADDRESS_TAGS.map((tag) => {
              const selected = draft.currentAddressForm.tag === tag;
              const iconName = tag === 'Home' ? 'home-outline' : tag === 'Work' ? 'briefcase-outline' : 'location-outline';

              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagCard, selected && styles.tagCardSelected]}
                  onPress={() => updateDraft((current) => ({ ...current, currentAddressForm: { ...current.currentAddressForm, tag } }))}
                >
                  <Ionicons name={iconName} size={22} color={selected ? '#A100FF' : '#9CA3AF'} />
                  <Text style={[styles.tagCardText, selected && styles.tagCardTextSelected]}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <SectionLabel>Address line 1</SectionLabel>
          <TextInput
            value={draft.currentAddressForm.houseFlat}
            onChangeText={(value) =>
              updateDraft((current) => ({
                ...current,
                currentAddressForm: {
                  ...current.currentAddressForm,
                  houseFlat: value,
                  apartment: '',
                  landmark: '',
                },
              }))
            }
            style={styles.textField}
            placeholder="House / flat, apartment, street, landmark"
            placeholderTextColor="#A09BB7"
          />
          <SectionLabel>Pincode</SectionLabel>
          <TextInput
            value={draft.currentAddressForm.pincode}
            onChangeText={(value) => updateDraft((current) => ({ ...current, currentAddressForm: { ...current.currentAddressForm, pincode: value } }))}
            style={styles.textField}
            placeholder="110074"
            keyboardType="number-pad"
            placeholderTextColor="#A09BB7"
          />
          <TouchableOpacity style={styles.saveAddressButton} onPress={handleSaveAddress}>
            <Text style={styles.primaryButtonText}>Save address</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={() => updateDraft({ step: 'patients' })}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const renderSaveAddress = () => (
    <View style={styles.saveAddressOverlayStep}>
      {renderLocation()}
      {renderSaveAddressDrawer()}
    </View>
  );

  const renderPatientDrawer = () => (
    <Modal visible={patientDrawerVisible} animationType="slide" transparent onRequestClose={() => setPatientDrawerVisible(false)}>
      <View style={styles.patientDrawerBackdrop}>
        <View style={[styles.patientDrawerSheet, { maxHeight: Math.round(height * 0.62) }]}>
          <View style={styles.patientDrawerHeader}>
            <Text style={styles.patientDrawerTitle}>Select Patient</Text>
            <TouchableOpacity style={styles.patientDrawerCloseButton} onPress={() => setPatientDrawerVisible(false)}>
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.patientDrawerList} contentContainerStyle={styles.patientDrawerListContent} showsVerticalScrollIndicator={false}>
            {!savedPatients.length ? <EmptyState title="No saved patients" subtitle="Add the patient who will provide the sample." /> : null}
            {savedPatients.map((patient) => {
              const selected = draft.selectedPatientIds.includes(patient.id);

              return (
                <TouchableOpacity key={patient.id} style={[styles.patientDrawerCard, selected && styles.patientDrawerCardSelected]} onPress={() => togglePatientSelection(patient.id)}>
                  <View style={styles.patientAvatar} />
                  <View style={styles.patientTextWrap}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <Text style={styles.patientMeta}>
                      {patient.gender}, {patient.age || '--'} yrs
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      resumeBookingAfterContactRef.current = false;
                      setPatientModalState({ visible: true, patient, mode: 'basic' });
                    }}
                    style={styles.patientDrawerIconButton}
                  >
                    <Ionicons name="pencil-outline" size={15} color="#4B5563" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.patientDrawerIconButton, styles.patientDrawerDeleteButton]} onPress={() => handlePatientDelete(patient.id)}>
                    <Ionicons name="trash-outline" size={15} color="#FF6B7A" />
                  </TouchableOpacity>
                  {selected ? (
                    <View style={styles.patientDrawerSelectedDot}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.addPatientLink, savedPatients.length >= 5 && styles.addPatientLinkDisabled]}
              disabled={savedPatients.length >= 5}
              onPress={() => {
                resumeBookingAfterContactRef.current = false;
                setPatientModalState({ visible: true, patient: null, mode: 'basic' });
              }}
            >
              <Text style={styles.addPatientLinkText}>+ Add New Patient</Text>
            </TouchableOpacity>
          </ScrollView>
          <TouchableOpacity
            style={[styles.patientDrawerContinueButton, !draft.selectedPatientIds.length && styles.bottomBarButtonDisabled]}
            disabled={!draft.selectedPatientIds.length}
            onPress={continueFromPatientDrawer}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSlotDrawer = () => (
    <Modal visible={slotDrawerVisible} animationType="slide" transparent onRequestClose={() => setSlotDrawerVisible(false)}>
      <View style={styles.slotDrawerBackdrop}>
        <View style={[styles.slotDrawerSheet, { maxHeight: Math.round(height * 0.76) }]}>
          <View style={styles.slotDrawerHeader}>
            <Text style={styles.slotDrawerTitle}>Available Slots</Text>
            <TouchableOpacity style={styles.patientDrawerCloseButton} onPress={() => setSlotDrawerVisible(false)}>
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.slotDrawerContent}>
            <SectionLabel>Select Date</SectionLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotDrawerDateRow}>
              {slotDateOptions.map((item) => {
                const selected = draft.selectedDate === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.slotDateCard, selected && styles.slotDateCardSelected]}
                    onPress={() => updateDraft({ selectedDate: item.value })}
                  >
                    <Text style={[styles.slotDateDay, selected && styles.slotDateDaySelected]}>{item.dayLabel}</Text>
                    <Text style={[styles.slotDateNumber, selected && styles.slotDateNumberSelected]}>{item.numberLabel}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <SectionLabel>Select Your Preferred Slot</SectionLabel>
            <View style={styles.slotSegmentControl}>
              {SLOT_PERIODS.map((period, index) => {
                const active = selectedSlotPeriod === period.key || (!selectedSlotPeriod && index === 0);
                return (
                  <TouchableOpacity
                    key={period.key}
                    style={[styles.slotSegmentItem, active && styles.slotSegmentItemActive]}
                    onPress={() => setSelectedSlotPeriod(period.key)}
                  >
                    <Text style={[styles.slotSegmentText, active && styles.slotSegmentTextActive]}>{period.key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {slotsLoading ? (
              <View style={styles.loaderArea}>
                <ActivityIndicator color="#7E22CE" />
              </View>
            ) : null}

            {!slotsLoading ? (
              <View style={styles.slotGrid}>
                {(slotsByPeriod[selectedSlotPeriod] || []).map((slot) => {
                  const selected = String(draft.selectedSlotId) === String(slot.id);
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[styles.slotCard, selected && styles.slotCardSelected, !slot.available && styles.slotCardDisabled]}
                      disabled={!slot.available}
                      onPress={() => updateDraft({ selectedSlotId: slot.id })}
                    >
                      <Text style={[styles.slotCardText, selected && styles.slotCardTextSelected]}>{slot.timeRange12}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {!slotsLoading && !slots.length ? <EmptyState title="No slots available" subtitle="Try another date or change the selected address." /> : null}
          </ScrollView>
          <TouchableOpacity
            style={styles.slotDrawerContinueButton}
            onPress={continueFromSlotDrawer}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPatients = () => (
    <>
      <ScreenHeader title="Select Patient" onBack={goBack} />
      {!savedPatients.length ? <EmptyState title="No saved patients" subtitle="Add the patient who will provide the sample." /> : null}
      {savedPatients.map((patient) => {
        const selectedIndex = draft.selectedPatientIds.indexOf(patient.id);
        const selected = selectedIndex !== -1;
        return (
          <TouchableOpacity key={patient.id} style={styles.patientCard} onPress={() => togglePatientSelection(patient.id)}>
            <View style={styles.patientAvatar} />
            <View style={styles.patientTextWrap}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientMeta}>
                {patient.gender}, {patient.age || '--'} yrs
              </Text>
              {selected ? (
                <Text style={styles.patientSelectedLabel}>{selectedIndex === 0 ? 'Primary patient' : `Additional member ${selectedIndex}`}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => {
                resumeBookingAfterContactRef.current = false;
                setPatientModalState({ visible: true, patient, mode: 'basic' });
              }}
              style={styles.miniIconButton}
            >
              <Ionicons name="pencil-outline" size={16} color="#B05CFF" />
            </TouchableOpacity>
            <View style={[styles.selectionRing, selected && styles.selectionRingActive]}>
              {selected ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.addPatientLink}
        onPress={() => {
          resumeBookingAfterContactRef.current = false;
          setPatientModalState({ visible: true, patient: null, mode: 'basic' });
        }}
      >
        <Text style={styles.addPatientLinkText}>+ Add New Patient</Text>
      </TouchableOpacity>

      <SectionLabel>Phone</SectionLabel>
      <TextInput
        value={draft.contactInfo.phone}
        onChangeText={(value) =>
          updateDraft((current) => ({
            ...current,
            contactInfo: {
              ...current.contactInfo,
              phone: normalizePhoneValue(value),
              whatsappPhone: current.contactInfo.whatsappPhone || normalizePhoneValue(value),
            },
          }))
        }
        style={styles.textField}
        keyboardType="phone-pad"
        placeholder="9876543210"
        placeholderTextColor="#A09BB7"
      />
      <SectionLabel>Alternate Phone</SectionLabel>
      <TextInput
        value={draft.contactInfo.altPhone}
        onChangeText={(value) =>
          updateDraft((current) => ({ ...current, contactInfo: { ...current.contactInfo, altPhone: normalizePhoneValue(value) } }))
        }
        style={styles.textField}
        keyboardType="phone-pad"
        placeholder="9876543210"
        placeholderTextColor="#A09BB7"
      />
      <SectionLabel>WhatsApp Phone</SectionLabel>
      <TextInput
        value={draft.contactInfo.whatsappPhone}
        onChangeText={(value) =>
          updateDraft((current) => ({ ...current, contactInfo: { ...current.contactInfo, whatsappPhone: normalizePhoneValue(value) } }))
        }
        style={styles.textField}
        keyboardType="phone-pad"
        placeholder="9876543210"
        placeholderTextColor="#A09BB7"
      />
      <SectionLabel>Email</SectionLabel>
      <TextInput
        value={draft.contactInfo.email}
        onChangeText={(value) => updateDraft((current) => ({ ...current, contactInfo: { ...current.contactInfo, email: value } }))}
        style={styles.textField}
        autoCapitalize="none"
        placeholder="you@example.com"
        placeholderTextColor="#A09BB7"
      />
    </>
  );

  const renderReview = () => (
    <>
      <ScreenHeader title="Order Review" onBack={goBack} />
      <Text style={styles.reviewSectionTitle}>Patient Name</Text>
      {selectedPatients.map((patient, index) => (
        <View key={patient.id} style={styles.reviewPatientCard}>
          <View style={styles.reviewTextWrap}>
            <Text style={styles.reviewCardLabel}>{index === 0 ? 'Patient Details' : `Member ${index}`}</Text>
            <Text style={styles.reviewCardValue}>{patient.name}</Text>
            {index === 0 ? (
              <>
                <Text style={styles.reviewCardSubValue}>
                  {isValidPhoneValue(draft.contactInfo.phone) ? draft.contactInfo.phone : 'Valid phone required before booking'}
                </Text>
                <Text style={styles.reviewCardSubValue}>{draft.contactInfo.email || 'Email required before booking'}</Text>
              </>
            ) : null}
          </View>
          {index === 0 && (!draft.contactInfo.email || !isValidPhoneValue(draft.contactInfo.phone)) ? (
            <TouchableOpacity
              style={styles.reviewAddButton}
              onPress={() => openContactModal()}
            >
              <Text style={styles.reviewAddButtonText}>+ Add</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.reviewEditButton}
              onPress={() => {
                resumeBookingAfterContactRef.current = false;
                return index === 0 ? openContactModal() : setPatientDrawerVisible(true);
              }}
            >
              <Ionicons name="pencil" size={15} color="#4F46E5" />
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={styles.reviewLabCard}>
        <View style={styles.reviewLabIcon}>
          <View style={styles.reviewLabIconCenter} />
        </View>
        <View style={styles.reviewTextWrap}>
          <Text style={styles.reviewCardValue}>{selectedLab?.name}</Text>
          <Text style={styles.reviewCardSubValue}>{buildAddressLabel(selectedAddress)}</Text>
        </View>
        <TouchableOpacity style={styles.reviewEditButton} onPress={() => setSlotDrawerVisible(true)}>
          <Ionicons name="pencil" size={15} color="#4F46E5" />
        </TouchableOpacity>
        <View style={styles.reviewLabDivider} />
        <View style={styles.reviewSlotRow}>
          <View style={styles.reviewSlotIcon}>
            <Ionicons name="calendar-outline" size={15} color="#16A34A" />
          </View>
          <Text style={styles.reviewSlotText}>
            {formatDateLabel(draft.selectedDate)}, {selectedSlot?.timeRange12}
          </Text>
        </View>
      </View>

      <Text style={styles.reviewSectionTitle}>Selected Tests</Text>
      {draft.selectedPackages.map((item) => (
        <View key={item.code} style={styles.reviewPackageCard}>
          <View style={styles.reviewPackageTextWrap}>
            <Text style={styles.reviewPackageName}>{item.name}</Text>
            <Text style={styles.reviewPackagePrice}>
              <Text style={styles.reviewPackageOldPrice}>₹{item.price || getPackageEffectivePrice(item)} </Text>
              <Text style={styles.reviewPackageEffectivePrice}>₹{getPackageEffectivePrice(item)}</Text>
            </Text>
          </View>
          <TouchableOpacity onPress={() => removeSelectedPackage(item.code)} style={styles.reviewDeleteButton}>
            <Ionicons name="trash" size={15} color="#C81E1E" />
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.billCard}>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Total Cost</Text>
          <Text style={styles.billValue}>₹{pricingSummary.subtotal}</Text>
        </View>
        <View style={styles.billDivider} />
        <View style={styles.billRow}>
          <Text style={styles.billPayLabel}>You Pay</Text>
          <Text style={styles.billPayValue}>₹{pricingSummary.payable}</Text>
        </View>
      </View>

    </>
  );

  const renderOrders = () => (
    <>
      <ScreenHeader title="My Orders" onBack={goBack} />
      {customerBookingsLoading ? (
        <View style={styles.ordersLoadingState}>
          <ActivityIndicator color="#7E22CE" size="large" />
          <Text style={styles.ordersLoadingText}>Loading your bookings...</Text>
        </View>
      ) : customerBookings.length ? (
        customerBookings.map((booking) => {
          const primaryPatient = booking.patients?.[0];
          const packageNames = (booking.packages || []).map((item) => item.name).filter(Boolean);
          return (
            <View key={String(booking.bookingId || `${booking.bookingDate}-${booking.phone}`)} style={styles.orderCard}>
              <View style={styles.orderCardHeader}>
                <View style={styles.orderHeaderTextWrap}>
                  <Text style={styles.orderCardTitle}>Booking #{booking.bookingId || 'Pending'}</Text>
                  <Text style={styles.orderCardMeta}>
                    {formatDateLabel(booking.collectionDate || booking.bookingDate) || 'Date pending'}
                    {booking.collectionTimeLabel ? `, ${booking.collectionTimeLabel}` : ''}
                  </Text>
                </View>
                <View style={styles.orderStatusBadge}>
                  <Text style={styles.orderStatusText}>{booking.status || 'Booked'}</Text>
                </View>
              </View>

              <View style={styles.orderInfoBlock}>
                <Text style={styles.orderInfoLabel}>Patient</Text>
                <Text style={styles.orderInfoValue}>{primaryPatient?.name || 'Customer'}</Text>
                {booking.patients?.length > 1 ? (
                  <Text style={styles.orderInfoSubvalue}>+{booking.patients.length - 1} more member(s)</Text>
                ) : null}
              </View>

              <View style={styles.orderInfoBlock}>
                <Text style={styles.orderInfoLabel}>Tests / Packages</Text>
                <Text style={styles.orderInfoValue}>{packageNames.join(', ') || 'Package details unavailable'}</Text>
              </View>

              <View style={styles.orderSplitRow}>
                <View style={styles.orderSplitItem}>
                  <Text style={styles.orderInfoLabel}>Payment</Text>
                  <Text style={styles.orderInfoValue}>{booking.paymentMode || 'Unknown'}</Text>
                </View>
                <View style={styles.orderSplitItem}>
                  <Text style={styles.orderInfoLabel}>Amount</Text>
                  <Text style={styles.orderInfoValue}>
                    {booking.payableAmount ? `₹${booking.payableAmount}` : 'Pending'}
                  </Text>
                </View>
              </View>

              <View style={styles.orderInfoBlock}>
                <Text style={styles.orderInfoLabel}>Collection Address</Text>
                <Text style={styles.orderInfoValue}>{booking.address || booking.locationLabel || 'Address not available'}</Text>
              </View>
            </View>
          );
        })
      ) : (
        <EmptyState title="No booked orders yet" subtitle="Your confirmed customer bookings will appear here." />
      )}
    </>
  );

  const renderStickyFooter = () => {
    switch (draft.step) {
      case 'packages':
      case 'labs':
      case 'slots':
        return (
          <BottomBar bottomInset={bottomInset} maxWidth={shellWidth} screenPadding={screenPadding} onHeightChange={setStickyFooterHeight}>
            <View style={styles.bottomBarSummary}>
              <Text style={styles.bottomBarLabel}>Test/Packages added</Text>
              <Text style={styles.bottomBarValue}>{draft.selectedPackages.length}</Text>
            </View>
            <TouchableOpacity style={styles.bottomBarButton} onPress={openSlotDrawerFromPackages}>
              <Text style={styles.bottomBarButtonText}>Continue</Text>
            </TouchableOpacity>
          </BottomBar>
        );
      case 'addresses':
        return (
          <BottomBar bottomInset={bottomInset} maxWidth={shellWidth} screenPadding={screenPadding} onHeightChange={setStickyFooterHeight}>
            <TouchableOpacity style={styles.bottomBarButtonOutline} onPress={openAddressFlow}>
              <Text style={styles.bottomBarButtonOutlineText}>Add Address</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomBarButton, !draft.selectedAddressId && styles.bottomBarButtonDisabled]}
              disabled={!draft.selectedAddressId}
              onPress={() => updateDraft({ step: 'patients' })}
            >
              <Text style={styles.bottomBarButtonText}>Continue</Text>
            </TouchableOpacity>
          </BottomBar>
        );
      case 'patients':
        return (
          <BottomBar bottomInset={bottomInset} maxWidth={shellWidth} screenPadding={screenPadding} onHeightChange={setStickyFooterHeight}>
            <View style={styles.bottomBarSummary}>
              <Text style={styles.bottomBarLabel}>Patients selected</Text>
              <Text style={styles.bottomBarValue}>{draft.selectedPatientIds.length}</Text>
            </View>
            <TouchableOpacity
              style={[styles.bottomBarButton, !draft.selectedPatientIds.length && styles.bottomBarButtonDisabled]}
              disabled={!draft.selectedPatientIds.length}
              onPress={() =>
                updateDraft((current) => ({
                  ...current,
                  slotGender: selectedPatient?.gender || current.slotGender,
                  step: 'labs',
                }))
              }
            >
              <Text style={styles.bottomBarButtonText}>Continue</Text>
            </TouchableOpacity>
          </BottomBar>
        );
      case 'review':
        return (
          <BottomBar bottomInset={bottomInset} maxWidth={shellWidth} screenPadding={screenPadding} onHeightChange={setStickyFooterHeight}>
            <View style={styles.bottomBarSummary}>
              <Text style={styles.bottomBarLabel}>Total Amount</Text>
              <Text style={styles.bottomBarValue}>₹{pricingSummary.payable}</Text>
            </View>
            <TouchableOpacity style={styles.bottomBarButton} onPress={handleBookNow} disabled={actionLoading === 'booking'}>
              <Text style={styles.bottomBarButtonText}>{actionLoading === 'booking' ? 'Booking...' : 'Book Now'}</Text>
            </TouchableOpacity>
          </BottomBar>
        );
      default:
        return null;
    }
  };

  const renderCurrentStep = () => {
    switch (draft.step) {
      case 'home':
        return renderHome();
      case 'packages':
        return renderPackages();
      case 'addresses':
        return renderAddresses();
      case 'location':
        return renderLocation();
      case 'saveAddress':
        return renderSaveAddress();
      case 'patients':
        return renderPatients();
      case 'labs':
        return renderPackages();
      case 'slots':
        return renderPackages();
      case 'review':
        return renderReview();
      case 'orders':
        return renderOrders();
      default:
        return renderHome();
    }
  };

  if (!hydrated) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: safeAreaBackground }]} edges={['top', 'left', 'right']}>
        <View style={styles.loaderScreen}>
          <ActivityIndicator color="#7E22CE" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: safeAreaBackground }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.flex}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: screenPadding,
                paddingBottom: scrollBottomPadding,
              },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.contentShell, { maxWidth: shellWidth }]}>
              {renderCurrentStep()}
              <StatusBanner message={statusMessage} />
            </View>
          </ScrollView>
          {renderStickyFooter()}
          {renderSlotDrawer()}
          {renderPatientDrawer()}
          <PatientModal
            visible={patientModalState.visible}
            initialValue={patientModalState.patient}
            mode={patientModalState.mode}
            defaultEmail={draft.contactInfo.email}
            onClose={() => setPatientModalState({ visible: false, patient: null, mode: 'basic' })}
            onSave={handlePatientSave}
          />
          <ContactInfoModal
            visible={contactModalVisible}
            initialValue={draft.contactInfo}
            onClose={() => {
              resumeBookingAfterContactRef.current = false;
              setContactModalVisible(false);
            }}
            onSave={handleContactSave}
          />
          <BookingSuccessOverlay visible={bookingSuccessVisible} animationValue={bookingSuccessAnimation} />
          {showDatePicker ? (
            <DateTimePicker
              value={draft.selectedDate ? new Date(draft.selectedDate) : new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(event, selectedDateValue) => {
                if (Platform.OS !== 'ios') setShowDatePicker(false);
                if (event.type === 'dismissed' || !selectedDateValue) return;
                updateDraft({ selectedDate: formatDateInput(selectedDateValue) });
              }}
            />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  loaderScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  contentShell: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 0,
    flexGrow: 1,
    minHeight: '100%',
  },
  screenHeader: {
    minHeight: 44,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  screenHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  headerIconButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconButtonSpacer: {
    width: 36,
  },
  heroCard: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 34,
    marginHorizontal: -16,
    marginTop: 0,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 12,
  },
  heroRoundButton: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOrdersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 17,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroOrdersText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  ordersLoadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  ordersLoadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEE6FF',
    padding: 16,
    marginBottom: 14,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  orderHeaderTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  orderCardTitle: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '800',
  },
  orderCardMeta: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  orderStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3E8FF',
  },
  orderStatusText: {
    color: '#7E22CE',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  orderInfoBlock: {
    marginBottom: 12,
  },
  orderInfoLabel: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  orderInfoValue: {
    color: '#111111',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  orderInfoSubvalue: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  orderSplitRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  orderSplitItem: {
    flex: 1,
    marginRight: 12,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 6,
  },
  heroTitleInline: {
    marginBottom: 0,
    marginLeft: 12,
    flexShrink: 1,
  },
  heroLocationText: {
    color: '#F3E8FF',
    fontSize: 12,
    fontWeight: '600',
  },
  heroLocationTextDark: {
    color: '#7E22CE',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
  },
  floatingSearchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    marginTop: -16,
    marginBottom: 8,
    marginHorizontal: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9DDFB',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  searchWrap: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 9999,
  },
  searchInput: {
    flex: 1,
    color: '#4B5563',
    fontSize: 14,
    paddingVertical: 0,
    marginLeft: 12,
  },
  offerStrip: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F3D4B5',
    backgroundColor: '#FFFDF9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerStripText: {
    color: '#7E22CE',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  offerStripHighlight: {
    fontWeight: '800',
  },
  promoShell: {
    marginTop: 12,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F4DDC3',
    backgroundColor: '#FFF9F1',
  },
  promoCard: {
    minHeight: 178,
    paddingLeft: 22,
    paddingTop: 22,
    paddingBottom: 22,
    paddingRight: 146,
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  promoTextWrap: {
    width: '100%',
    maxWidth: 228,
    justifyContent: 'center',
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 27,
    letterSpacing: -0.4,
  },
  promoSubtitle: {
    color: '#F6EFFF',
    fontSize: 13,
    marginTop: 12,
    marginBottom: 18,
    lineHeight: 18,
  },
  promoButton: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderRadius: 999,
    minWidth: 130,
    paddingHorizontal: 20,
    paddingVertical: 11,
    alignItems: 'center',
  },
  promoButtonText: {
    color: '#7E22CE',
    fontWeight: '700',
    fontSize: 14,
  },
  promoImageCard: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 152,
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 22,
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },
  promoFooter: {
    backgroundColor: '#FFF9F1',
    paddingTop: 16,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoFooterText: {
    color: '#111111',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    lineHeight: 18,
  },
  promoFooterHighlight: {
    color: '#7E22CE',
    fontWeight: '800',
  },
  prescriptionTextWrap: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 8,
  },
  iconFeatureRow: {
    marginTop: 26,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  iconFeatureCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
  },
  iconFeatureImage: {
    width: 54,
    height: 54,
    marginBottom: 10,
  },
  iconFeatureText: {
    color: '#111111',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  trustBanner: {
    marginTop: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F7F5FF',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  trustBannerText: {
    color: '#222222',
    fontWeight: '800',
    fontSize: 15,
  },
  trustBannerStars: {
    color: '#FDBA21',
    fontSize: 20,
  },
  sectionHeaderRow: {
    marginTop: 20,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
  },
  sectionAction: {
    color: '#7E22CE',
    fontWeight: '700',
    fontSize: 12,
  },
  popularScroller: {
    paddingRight: 0,
  },
  packagePreviewCard: {
    width: 260,
    minHeight: 316,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: '#E7E2EE',
    position: 'relative',
    marginRight: 18,
  },
  packagePreviewCardLast: {
    marginRight: 0,
  },
  packagePreviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packagePillBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F5EB',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  packagePillBadgeText: {
    color: '#0B7D3B',
    fontSize: 12,
    fontWeight: '700',
  },
  packagePillBadgeAlt: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1E6FF',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  packagePillBadgeAltText: {
    color: '#8B3CF6',
    fontSize: 12,
    fontWeight: '700',
  },
  packagePreviewName: {
    marginTop: 18,
    color: '#202128',
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '800',
    minHeight: 64,
  },
  packagePreviewMeta: {
    marginTop: 8,
    color: '#5F6271',
    fontSize: 14,
    lineHeight: 20,
    minHeight: 42,
  },
  packagePreviewPriceWrap: {
    marginTop: 30,
  },
  packagePreviewStrikePrice: {
    color: '#6C6A79',
    fontSize: 16,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  packagePreviewPrice: {
    color: '#111111',
    fontSize: 28,
    fontWeight: '800',
  },
  packagePreviewAdd: {
    position: 'absolute',
    right: 26,
    bottom: 28,
    height: 54,
    width: 54,
    borderRadius: 27,
    backgroundColor: '#7E22CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderArea: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE6FF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageListIcon: {
    height: 34,
    width: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F0FF',
  },
  packageListTextWrap: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  packageTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  packageTagPillText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: '700',
  },
  packageListName: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '700',
  },
  packageListMeta: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 12,
  },
  addButton: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: '#7E22CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    backgroundColor: '#FF5B79',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3ECFF',
    shadowColor: '#1F1147',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 18,
  },
  bottomBarInner: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  reviewFooterPaymentWrap: {
    width: '100%',
    marginBottom: 12,
  },
  reviewFooterPaymentLabel: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  bottomBarSummary: {
    flex: 1,
    marginRight: 10,
    minWidth: 96,
    marginBottom: 0,
    justifyContent: 'flex-end',
  },
  bottomBarLabel: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomBarValue: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  bottomBarButton: {
    minWidth: 118,
    flexGrow: 1,
    borderRadius: 14,
    backgroundColor: '#7E22CE',
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarButtonDisabled: {
    opacity: 0.45,
  },
  bottomBarButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  bottomBarButtonOutline: {
    minWidth: 112,
    flexGrow: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D5C5F5',
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  bottomBarButtonOutlineText: {
    color: '#7E22CE',
    fontWeight: '800',
    fontSize: 14,
  },
  currentLocationCard: {
    backgroundColor: '#FFF6EA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1DFC2',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLocationIcon: {
    height: 34,
    width: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  currentLocationLabel: {
    color: '#9A6B2B',
    fontSize: 12,
    fontWeight: '700',
  },
  currentLocationTitle: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 3,
  },
  currentLocationSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  savedAddressesLabel: {
    marginTop: 18,
    marginBottom: 10,
    color: '#8D8AA6',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEE1FF',
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressCardSelected: {
    borderColor: '#B05CFF',
  },
  addressCardIcon: {
    height: 34,
    width: 34,
    borderRadius: 12,
    backgroundColor: '#F6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  addressCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressCardTitle: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '700',
  },
  selectedChip: {
    backgroundColor: '#DDFBE8',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  selectedChipText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
  },
  addressCardText: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 18,
  },
  addressCardDistance: {
    color: '#7E22CE',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  miniIconButton: {
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStage: {
    height: MAP_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#EEF8EA',
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5F0DD',
  },
  mapLeafletView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  mapStaticTileLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8F1E6',
  },
  mapStaticTile: {
    position: 'absolute',
    width: MAP_TILE_SIZE,
    height: MAP_TILE_SIZE,
  },
  mapGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  mapPinWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 144,
    height: 176,
  },
  mapPinFront: {
    position: 'absolute',
    top: 8,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  mapPinTipShadow: {
    position: 'absolute',
    bottom: 12,
    width: 34,
    height: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(91, 65, 149, 0.15)',
  },
  mapLocateButton: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2937',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  currentLocationAction: {
    marginTop: 14,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE4FF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLocationActionDisabled: {
    opacity: 0.64,
  },
  currentLocationActionIcon: {
    height: 38,
    width: 38,
    borderRadius: 12,
    backgroundColor: '#F6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationActionTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  currentLocationActionTitle: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '800',
  },
  currentLocationActionSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  locationSheetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    marginTop: -48,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F0E8FF',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  locationHandle: {
    height: 4,
    width: 42,
    borderRadius: 999,
    backgroundColor: '#D8D6E3',
    alignSelf: 'center',
    marginBottom: 16,
  },
  locationResultList: {
    maxHeight: 240,
  },
  locationResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationResultTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  locationResultTitle: {
    color: '#111111',
    fontWeight: '800',
    fontSize: 14,
  },
  locationResultSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  locationEmptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEE6FF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationEmptyIcon: {
    height: 40,
    width: 40,
    borderRadius: 14,
    backgroundColor: '#F7F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  locationEmptyTitle: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '800',
  },
  locationEmptyText: {
    color: '#6B7280',
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  selectedLocationPreview: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#FBF7FF',
    borderWidth: 1,
    borderColor: '#F0E8FF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedLocationIcon: {
    height: 36,
    width: 36,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedLocationTextWrap: {
    flex: 1,
  },
  selectedLocationPreviewTitle: {
    color: '#111111',
    fontWeight: '800',
    fontSize: 15,
  },
  selectedLocationPreviewText: {
    color: '#6B7280',
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
  },
  saveAddressDrawerScreen: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    marginHorizontal: -8,
    zIndex: 20,
    elevation: 20,
  },
  saveAddressOverlayStep: {
    flex: 1,
  },
  saveAddressSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 18,
    shadowColor: '#111827',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
    elevation: 8,
    overflow: 'hidden',
  },
  saveAddressSheetHeader: {
    minHeight: 42,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saveAddressSheetTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  saveAddressCloseButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveAddressSheetScroll: {
    flex: 1,
  },
  saveAddressSheetContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
  },
  locationSummaryCard: {
    backgroundColor: '#F8F1FF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationSummaryTextWrap: {
    flex: 1,
    marginLeft: 9,
  },
  locationSummaryTitle: {
    color: '#A100FF',
    fontSize: 12,
    fontWeight: '800',
  },
  locationSummaryText: {
    color: '#4B5563',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 17,
  },
  locationSummaryEditButton: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sectionLabel: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
  },
  textField: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#111111',
    fontSize: 14,
  },
  contactModalErrorText: {
    color: '#C81E1E',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tagCard: {
    width: '30%',
    minHeight: 76,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tagCardSelected: {
    borderColor: '#B05CFF',
    backgroundColor: '#F9F2FF',
  },
  tagCardText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 8,
  },
  tagCardTextSelected: {
    color: '#7E22CE',
  },
  saveAddressButton: {
    marginTop: 22,
    backgroundColor: '#A100FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    shadowColor: '#A100FF',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#7E22CE',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  skipButtonText: {
    color: '#7E22CE',
    fontWeight: '700',
    fontSize: 13,
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0E8FF',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: '#F5EEFF',
  },
  patientAvatarSmall: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: '#F5EEFF',
    marginRight: 12,
  },
  patientTextWrap: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  patientName: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '700',
  },
  patientMeta: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 3,
  },
  patientSelectedLabel: {
    color: '#7E22CE',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  selectionRing: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9C7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionRingActive: {
    backgroundColor: '#7E22CE',
    borderColor: '#7E22CE',
  },
  patientDrawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.12)',
    justifyContent: 'flex-end',
  },
  patientDrawerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 22,
    shadowColor: '#111827',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
    elevation: 10,
  },
  patientDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  patientDrawerTitle: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '800',
  },
  patientDrawerCloseButton: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientDrawerList: {
    flexGrow: 0,
  },
  patientDrawerListContent: {
    paddingBottom: 8,
  },
  patientDrawerCard: {
    minHeight: 58,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientDrawerCardSelected: {
    borderColor: '#D9C7FA',
    backgroundColor: '#FFFFFF',
  },
  patientDrawerIconButton: {
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  patientDrawerDeleteButton: {
    backgroundColor: '#FFF1F3',
  },
  patientDrawerSelectedDot: {
    position: 'absolute',
    left: 42,
    bottom: 9,
    height: 18,
    width: 18,
    borderRadius: 9,
    backgroundColor: '#7E22CE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  patientDrawerContinueButton: {
    marginTop: 6,
    backgroundColor: '#7E22CE',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  slotDrawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.12)',
    justifyContent: 'flex-end',
  },
  slotDrawerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  slotDrawerHeader: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  slotDrawerTitle: {
    color: '#111111',
    fontSize: 17,
    fontWeight: '800',
  },
  slotDrawerContent: {
    paddingBottom: 16,
  },
  slotDrawerDateRow: {
    paddingVertical: 4,
    paddingRight: 12,
  },
  slotSegmentControl: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9EAEE',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginBottom: 14,
  },
  slotSegmentItem: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSegmentItemActive: {
    backgroundColor: '#FFFFFF',
  },
  slotSegmentText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },
  slotSegmentTextActive: {
    color: '#7E22CE',
  },
  slotDrawerContinueButton: {
    backgroundColor: '#A100FF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  addPatientLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  addPatientLinkDisabled: {
    opacity: 0.45,
  },
  addPatientLinkText: {
    color: '#7E22CE',
    fontWeight: '800',
    fontSize: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkboxLabel: {
    marginLeft: 10,
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  filterTab: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7DDF8',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#7E22CE',
    borderColor: '#7E22CE',
  },
  filterTabText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 12,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  labCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0E8FF',
  },
  labCardSelected: {
    borderColor: '#B05CFF',
    backgroundColor: '#FCFAFF',
  },
  labHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labBrandDot: {
    height: 28,
    width: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labBrandDotInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#FF8A00',
  },
  labTextWrap: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  labTitle: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '800',
  },
  labSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 3,
  },
  labCollectionPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E7FFF3',
  },
  labCollectionPillText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  labMetaRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  labMetaPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#F8F6FB',
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 8,
  },
  labInfoLine: {
    color: '#7E22CE',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
  },
  labFooterRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  labOldPrice: {
    color: '#A1A1AA',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  labPrice: {
    color: '#111111',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  bookPill: {
    minWidth: 88,
    borderRadius: 14,
    backgroundColor: '#7E22CE',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bookPillSelected: {
    backgroundColor: '#5B21B6',
  },
  bookPillText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  slotDateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  slotDateCard: {
    width: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7DDF8',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  slotDateCardSelected: {
    backgroundColor: '#7E22CE',
    borderColor: '#7E22CE',
  },
  slotDateDay: {
    color: '#8D8AA6',
    fontSize: 11,
    fontWeight: '700',
  },
  slotDateDaySelected: {
    color: '#FFFFFF',
  },
  slotDateNumber: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
  },
  slotDateNumberSelected: {
    color: '#FFFFFF',
  },
  datePickerInlineButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  datePickerInlineText: {
    color: '#7E22CE',
    fontWeight: '700',
    fontSize: 12,
  },
  slotSection: {
    marginTop: 12,
  },
  slotPeriodPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F3FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  slotPeriodPillText: {
    color: '#7E22CE',
    fontWeight: '700',
    fontSize: 12,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slotCard: {
    width: '47%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E7DDF8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  slotCardSelected: {
    backgroundColor: '#7E22CE',
    borderColor: '#7E22CE',
  },
  slotCardDisabled: {
    opacity: 0.35,
  },
  slotCardText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  slotCardTextSelected: {
    color: '#FFFFFF',
  },
  reviewSectionTitle: {
    color: '#111111',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 12,
  },
  reviewPatientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F1F1F3',
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewLabCard: {
    backgroundColor: '#FFF9F5',
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3E2D5',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  reviewLabIcon: {
    height: 38,
    width: 38,
    borderRadius: 19,
    borderWidth: 5,
    borderColor: '#FF8A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewLabIconCenter: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#FF8A00',
  },
  reviewTextWrap: {
    flex: 1,
  },
  reviewCardLabel: {
    color: '#8D8AA6',
    fontSize: 11,
    fontWeight: '700',
  },
  reviewCardValue: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  reviewCardSubValue: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  reviewEditButton: {
    height: 38,
    width: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  reviewAddButton: {
    minWidth: 72,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 12,
  },
  reviewAddButtonText: {
    color: '#7E22CE',
    fontSize: 13,
    fontWeight: '800',
  },
  reviewLabDivider: {
    height: 1,
    backgroundColor: '#F0DDC9',
    width: '100%',
    marginVertical: 14,
  },
  reviewSlotRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewSlotIcon: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reviewSlotText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 12,
  },
  reviewPackageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F4',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewPackageTextWrap: {
    flex: 1,
  },
  reviewPackageName: {
    color: '#111111',
    fontWeight: '700',
    fontSize: 14,
  },
  reviewPackagePrice: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  reviewPackageOldPrice: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  reviewPackageEffectivePrice: {
    color: '#059669',
    fontWeight: '800',
  },
  reviewDeleteButton: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  billCard: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    marginTop: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  billLabel: {
    color: '#6B7280',
    fontSize: 13,
  },
  billValue: {
    color: '#111111',
    fontWeight: '700',
  },
  billDiscountLabel: {
    color: '#1F7A4E',
    fontSize: 13,
  },
  billDiscountValue: {
    color: '#1F7A4E',
    fontWeight: '700',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 6,
  },
  billPayLabel: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '700',
  },
  billPayValue: {
    color: '#7E22CE',
    fontSize: 20,
    fontWeight: '800',
  },
  successOverlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,17,17,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successOverlayCard: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#111111',
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  successOverlayIcon: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: '#7E22CE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successOverlayTitle: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  statusBanner: {
    marginTop: 18,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusSuccess: {
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusError: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  statusBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginLeft: 8,
  },
  statusBannerSuccessText: {
    color: '#166534',
  },
  statusBannerErrorText: {
    color: '#9F1239',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E8FF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    color: '#111111',
    fontWeight: '800',
    fontSize: 15,
  },
  emptyStateText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,17,17,0.28)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    paddingBottom: 32,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#111111',
    fontWeight: '800',
    fontSize: 18,
  },
  modalCloseButton: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F8',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pillRowCompact: {
    marginBottom: 4,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DDCEF7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  pillCompact: {
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  pillSelected: {
    backgroundColor: '#7E22CE',
    borderColor: '#7E22CE',
  },
  pillText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 12,
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
});
