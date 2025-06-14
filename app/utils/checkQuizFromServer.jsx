import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkQuizStatus = async () => {
  try {
    const storedUser = await AsyncStorage.getItem('userDetails');
    const phone = JSON.parse(storedUser || '{}')?.phone;

    if (!phone) return false;

    const res = await fetch(`http://192.168.1.15:3001/api/quiz/${phone}`);
    if (res.ok) {
      await AsyncStorage.setItem(`quizCompleted_${phone}`, 'true'); // optional
      return true;
    }

    return false;
  } catch (e) {
    console.error('Error checking quiz status:', e);
    return false;
  }
};
