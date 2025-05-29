import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function PlansInclude() {
  const [imageHeight, setImageHeight] = useState(0);
  const imageUrl = 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Group_1110.png?v=1748254342';

  useEffect(() => {
    Image.getSize(
      imageUrl,
      (width, height) => {
        const calculatedHeight = (height / width) * screenWidth;
        setImageHeight(calculatedHeight);
      },
      (error) => {
        console.error('Failed to get image size:', error);
      }
    );
  }, []);

  if (!imageHeight) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#543287" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={{ width: screenWidth, height: imageHeight }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
