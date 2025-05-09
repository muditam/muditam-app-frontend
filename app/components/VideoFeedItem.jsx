import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { Video } from 'expo-av';

const { height, width } = Dimensions.get('window');

export default function VideoFeedItem({ video, onBack, isActive }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.playAsync();
    } else {
      videoRef.current?.pauseAsync();
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: video }}
        style={styles.video}
        resizeMode="cover"
        isLooping
        useNativeControls={false}
        shouldPlay={false}
      />

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <Text style={styles.icon}>❤️</Text>
        <Text style={styles.icon}>👎</Text>
        <Text style={styles.icon}>🔁</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height, width, backgroundColor: 'black' },
  video: { position: 'absolute', height, width },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
  },
  backText: { color: 'white', fontSize: 16 },
  actions: {
    position: 'absolute',
    bottom: 130,
    right: 20,
    gap: 14,
    alignItems: 'center',
  },
  icon: { fontSize: 20, color: 'white', marginBottom: 12 },
});
