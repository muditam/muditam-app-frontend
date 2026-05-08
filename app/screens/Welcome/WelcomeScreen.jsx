import React, { useRef } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen() {
  const router = useRouter();
  const videoRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const videoSize = Math.min(width - 32, height - 120, 350);

  // Called when the video finishes playing
  const handlePlaybackStatusUpdate = async (status) => {
    if (status.didJustFinish && status.positionMillis > 0) {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (userDetails) { 
          router.replace('/home');  
        } else { 
          router.replace('/login');
        }
      } catch (_e) {
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
        style={[styles.video, { width: videoSize, height: videoSize }]}
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
  },
});
