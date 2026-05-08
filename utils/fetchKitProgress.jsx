import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchKitProgress = async () => {
  try {
    const userData = await AsyncStorage.getItem('userDetails');
    const phone = JSON.parse(userData || '{}')?.phone;
    if (!phone) return { currentKit: 1, completedKits: [] };

    const res = await fetch(`https://muditam-app-backend-ca1c8b03db09.herokuapp.com/api/user/kit-progress/${phone}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching kit progress:', err);
    return { currentKit: 1, completedKits: [] };
  }
};
