import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkPurchaseStatus = async () => {
  try {
    const userData = await AsyncStorage.getItem('userDetails');
    const phone = JSON.parse(userData || '{}')?.phone;

    if (!phone) return false;

    const response = await fetch(`https://muditam-app-backend-6a867f82b8dc.herokuapp.com/api/user/purchase-status/${phone}`);

    if (!response.ok) {
      console.warn(`Server responded with status: ${response.status}`);
      return false;
    }

    const data = await response.json();

    const hasPurchased = data?.hasPurchased === true;

    // Optional: cache updated status
    await AsyncStorage.setItem('hasPurchased', hasPurchased ? 'true' : 'false');

    return hasPurchased;
  } catch (err) {
    console.error('Error checking purchase status:', err);
    return false;
  }
};
