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
        If you’ve left something or want{'\n'}to update a response on the{'\n'}diabetes test, simply re-take it.
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
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  subtext: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    width: "80%",
  },
  buttonText: {
    color: '#543287',
    fontSize: 16,
    fontWeight: '600',
  },
});
