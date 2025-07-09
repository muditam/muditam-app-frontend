import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Text,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

const features = [
  {
    title: 'Customized Diet Plan',
    image:
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Customized_Diet_Plan.png?v=1751969141',
  },
  {
    title: 'Doctor Prescription', 
    image:
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Doctor_Prescription.png?v=1751969140',
  },
  {
    title: 'Supplements Kit',
    image:
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Supplements_Kit.png?v=1751969140',
  },
  {
    title: 'Expert Guidance',
    image:
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Expert_Guidance.png?v=1751969140',
  },
  {
    title: 'Health Coach',
    image:
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Health_Coach.png?v=1751969140',
  },
];

export default function PlansInclude() {
  const [imageHeight, setImageHeight] = useState(0);
  const mainImageUrl =
    'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/2_icon_36d455a0-f347-4ae4-90d2-5de41b50841d.png?v=1750145142';

  useEffect(() => {
    Image.getSize(
      mainImageUrl,
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
      {/* Horizontal Scroll Feature Section */}

      <Text style={styles.heading}>Muditam Plan Includes</Text>

      <FlatList
        data={features}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featureSlider}
        renderItem={({ item }) => (
          <View style={styles.featureBlock}>
            <Image
              source={{ uri: item.image }}
              style={styles.featureImage}
              resizeMode="cover"
            />
            <Text style={styles.featureText}>{item.title}</Text>
          </View>
        )}
      />

      {/* Main Image Section */}
      <Image
        source={{ uri: mainImageUrl }}
        style={{ width: screenWidth, height: imageHeight }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
  fontSize: 21,
  fontWeight: '700', 
  textAlign: 'left',
  width: '100%',
  paddingHorizontal: 16,
  marginBottom: 16,
  marginTop: 6,
},
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureSlider: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  featureBlock: {
    width: 155,
    marginRight: 12,
    alignItems: 'center',
  },
  featureImage: {
    width: 160,
    height: 100,
    borderRadius: 8,
  },
  featureText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});
