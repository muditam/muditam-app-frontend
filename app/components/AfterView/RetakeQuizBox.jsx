import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RetakeQuizBox() {
  const router = useRouter();

  const handleRetakeQuiz = async () => {
    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      const phone = JSON.parse(userDetails || '{}')?.phone;

      if (!phone) {
        alert('User not logged in.');
        return;
      }

      // Navigate to /test route
      router.push('/test');
    } catch (error) {
      console.error('Error starting quiz again:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Not completely sure?</Text>
      <Text style={styles.subtext}>
        If you’ve left something or want to update a response on the diabetes test, simply re-take it.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleRetakeQuiz}>
        <Text style={styles.buttonText}>Take The Diabetes Quiz Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'linear-gradient(90deg, #A067FF, #543287)',
    backgroundColor: '#A067FF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    elevation: 3,
  },
  heading: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtext: {
    color: 'white',
    fontSize: 14,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#543287',
    fontSize: 16,
    fontWeight: '600',
  },
});
