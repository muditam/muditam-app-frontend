import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useVideoPlayer, VideoView } from 'expo-video';

export default function WelcomeScreen() {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);
  const { width, height } = useWindowDimensions();
  const videoSize = Math.min(width - 32, height - 120, 350);
  const videoSource = {
    uri: 'https://cdn.shopify.com/videos/c/o/v/ac87e294ab7c4fa8ac33e36c4fee2b27.mp4',
    useCaching: true,
  };

  const navigateNext = useCallback(async () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      if (userDetails) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    } catch (_error) {
      router.replace('/login');
    }
  }, [router]);

  const player = useVideoPlayer(videoSource, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  useEffect(() => {
    const endSubscription = player.addListener('playToEnd', () => {
      navigateNext().catch(() => {});
    });

    const statusSubscription = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'error') {
        console.error('Welcome video failed to load:', error);
        navigateNext().catch(() => {});
      }
    });

    // Startup should not get stuck if the remote video is slow or fails on device.
    const fallbackTimer = setTimeout(() => {
      navigateNext().catch(() => {});
    }, 8000);

    return () => {
      clearTimeout(fallbackTimer);
      endSubscription.remove();
      statusSubscription.remove();
    };
  }, [navigateNext, player]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={[styles.video, { width: videoSize, height: videoSize }]}
        contentFit="contain"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
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
