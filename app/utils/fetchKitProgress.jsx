import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchKitProgress = async () => {
  try {
    const userData = await AsyncStorage.getItem('userDetails');
    const phone = JSON.parse(userData || '{}')?.phone;
    if (!phone) return { currentKit: 1, completedKits: [] };

    const res = await fetch(`http://192.168.1.32:3001/api/user/kit-progress/${phone}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching kit progress:', err);
    return { currentKit: 1, completedKits: [] };
  }
};
