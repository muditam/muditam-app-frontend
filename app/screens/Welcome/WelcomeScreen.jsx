import React, { useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen() {
  const router = useRouter();
  const videoRef = useRef(null);

  // Called when the video finishes playing
  const handlePlaybackStatusUpdate = async (status) => {
    if (status.didJustFinish) {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (userDetails) {
          // User is logged in, go to home/tabs
          router.replace('/home'); // Change '/home' to your actual Tabs or Home route
        } else {
          // Not logged in, go to login
          router.replace('/login');
        }
      } catch (e) {
        // On error, fallback to login
        router.replace('/login');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{
          uri: 'https://cdn.shopify.com/videos/c/o/v/ac87e294ab7c4fa8ac33e36c4fee2b27.mp4',
        }}
        style={styles.video}
        resizeMode="contain"
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        useNativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: 350,
    height: 350,
  },
});

