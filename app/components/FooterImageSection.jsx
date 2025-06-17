import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const imageUrl = 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/footer.png?v=1750146666';

export default function FooterImageSection() {
  const [imageHeight, setImageHeight] = useState(0);

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
        <ActivityIndicator size="large" color="#9D57FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { height: imageHeight }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  image: {
    width: screenWidth - 32,
    borderRadius: 12,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
