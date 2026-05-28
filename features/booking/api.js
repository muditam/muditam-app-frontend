const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://muditam-app-backend-ca1c8b03db09.herokuapp.com';

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }

  return data;
}

export const bookingApi = {
  requestJson,
  async searchAddresses(query) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&q=${encodeURIComponent(query)}`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'muditam-booking-app/1.0',
        },
      }
    );

    const data = await response.json().catch(() => []);

    if (!response.ok) {
      throw new Error('Could not search addresses');
    }

    return Array.isArray(data) ? data : [];
  },
  async reverseGeocodeCoordinates({ latitude, longitude }) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${encodeURIComponent(
        String(latitude)
      )}&lon=${encodeURIComponent(String(longitude))}`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'muditam-booking-app/1.0',
        },
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Could not resolve the map location');
    }

    return data;
  },
  async searchLocalities(query) {
    return requestJson(`/api/redcliffe/location-search?place_query=${encodeURIComponent(query)}`);
  },
  async getLocationByEloc(eloc) {
    return requestJson(`/api/redcliffe/location-by-eloc?eloc=${encodeURIComponent(eloc)}`);
  },
  async searchPackages(search) {
    return requestJson(`/api/redcliffe/packages?search=${encodeURIComponent(search || '')}`);
  },
  async getPackageDetails(code) {
    return requestJson(`/api/redcliffe/packages/${encodeURIComponent(code)}/details`);
  },
  async getTimeSlots({ collectionDate, latitude, longitude, customerGender }) {
    return requestJson(
      `/api/redcliffe/time-slots?collection_date=${encodeURIComponent(collectionDate)}&latitude=${encodeURIComponent(
        String(latitude)
      )}&longitude=${encodeURIComponent(String(longitude))}&customer_gender=${encodeURIComponent(customerGender || '')}`
    );
  },
  async createBooking(payload) {
    return requestJson('/api/redcliffe/bookings/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async confirmBooking({ bookingId, isConfirmed }) {
    return requestJson('/api/redcliffe/bookings/confirm', {
      method: 'POST',
      body: JSON.stringify({
        bookingId,
        isConfirmed,
      }),
    });
  },
  async getBookings({ phone }) {
    return requestJson(`/api/redcliffe/bookings?phone=${encodeURIComponent(String(phone || '').trim())}`);
  },
};
