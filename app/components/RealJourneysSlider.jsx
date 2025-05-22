import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const testimonials = [
  {
    image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_2025_05_01T06_36_10_887Z.png?v=1746081456',
    name: 'Rajesh Verma',
    city: 'Lucknow',
    avatar: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Contemplative_Gaze_Against_Red_Brick_Wall.png?v=1746525897',
    description:
      'I had been struggling with high sugar levels and fatigue for over 5 years. After following the Muditam plan, my sugar is under control and my energy levels are back. I feel like myself again.',
    symptoms: ['Fatigue', 'Frequent urination', 'Sugar spikes'],
  },
  {
    image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/IMG_2294.heic?v=1746076533',
    name: 'Anita Nair',
    city: 'Kochi',
    avatar: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Smiling_Outdoors_with_Greenery_Background.png?v=1746516563',
    description:
      'Muditam’s approach felt very natural and easy to follow. My sugar levels have improved and so has my digestion. I no longer get acidity after meals!',
    symptoms: ['Acidity', 'Bloating', 'High post-meal sugars'],
  },
  {
    image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_2025_05_01T06_36_10_887Z.png?v=1746081456',
    name: 'Deepak Sharma',
    city: 'Jaipur',
    avatar: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Contemplative_Gaze_Against_Red_Brick_Wall.png?v=1746525897',
    description:
      'I never believed natural supplements could help until I tried Muditam. With small lifestyle changes and the kit, my sugar dropped and I lost weight too.',
    symptoms: ['Weight Loss', 'High HbA1c', 'Sugar cravings'],
  },
  {
    image: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_2025_04_30T13_40_02_784Z.png?v=1746076534',
    name: 'Meena Gupta',
    city: 'Delhi',
    avatar: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Smiling_Outdoors_with_Greenery_Background.png?v=1746516563',
    description:
      'The team guided me really well. The kit is simple, and the diet tips actually helped. My sugar is stable now and I sleep better too.',
    symptoms: ['Poor sleep', 'Mood swings', 'High fasting sugar'],
  },
];

const TestimonialCard = ({ item }) => (
  <View style={styles.card}>
    <Image source={{ uri: item.image }} style={styles.mainImage} />
    <View style={styles.profileContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.nameCityContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.city}>{item.city}</Text>
      </View>
    </View>
    <Text style={styles.description}>{item.description}</Text>
    <Text style={styles.improvedSymptomsLabel}>Improved Symptoms</Text>
    <View style={styles.symptomsContainer}>
      {item.symptoms.map((symptom, idx) => (
        <Text key={idx} style={styles.symptomTag}>
          {symptom}
        </Text>
      ))}
    </View>
  </View>
);

export default function RealJourneysSlider() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>Real Journeys. Real Results.</Text>
      <FlatList
        data={testimonials}
        renderItem={({ item }) => <TestimonialCard item={item} />}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToAlignment="center"
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    width: screenWidth * 0.8,
    marginHorizontal: screenWidth * 0.1 / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    marginTop: 4,
    marginBottom: 8,
  },
  mainImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameCityContainer: {
    marginLeft: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  city: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins',
  },
  description: {
    fontSize: 13,
    color: '#333',
    marginTop: 10,
    fontFamily: 'Poppins',
  },
  improvedSymptomsLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    fontFamily: 'Poppins',
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  symptomTag: {
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontFamily: 'Poppins',
    marginRight: 6,
    marginBottom: 6,
  },
});
