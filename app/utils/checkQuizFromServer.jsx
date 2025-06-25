import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkQuizStatus = async () => {
  try {
    const storedUser = await AsyncStorage.getItem('userDetails');
    const phone = JSON.parse(storedUser || '{}')?.phone;

    if (!phone) return false;

    const res = await fetch(`https://muditam-app-backend.onrender.com/api/quiz/${phone}`);
    if (res.ok) {
      await AsyncStorage.setItem(`quizCompleted_${phone}`, 'true');  
      return true;
    }

    return false;
  } catch (e) {
    console.error('Error checking quiz status:', e);
    return false;
  }
};
