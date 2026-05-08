import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { getContentWidth, getScreenPadding } from '../../utils/responsive';

const imageUrl = 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/footer.png?v=1750146666';

export default function FooterImageSection() {
  const { width } = useWindowDimensions();
  const [imageHeight, setImageHeight] = useState(0);
  const imageWidth = getContentWidth(width, 980) - getScreenPadding(width) * 2;

  useEffect(() => {
    Image.getSize(
      imageUrl,
      (sourceWidth, sourceHeight) => {
        const calculatedHeight = (sourceHeight / sourceWidth) * imageWidth;
        setImageHeight(calculatedHeight);
      },
      (error) => {
        console.error('Failed to get image size:', error);
      }
    );
  }, [imageWidth]);

  if (!imageHeight) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9D57FF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width }]}>
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: imageWidth, height: imageHeight }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  image: {
    borderRadius: 12,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
