import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const expertImages = [
  'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_3.png?v=1747143071',
  'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_4.png?v=1747143072',
  'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_3.png?v=1747143071',
  'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_4.png?v=1747143072',
  'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_3.png?v=1747143071',
  'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_4.png?v=1747143072',
  'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_3.png?v=1747143071',
  'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_4.png?v=1747143072',
  'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_3.png?v=1747143071',
  'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_4.png?v=1747143072',
];

export default function ExpertsPanelCard() {
  return (
    <View style={styles.shadowWrapper}>
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Meet Muditam</Text>
          <Text style={styles.subtitle}>Experts Panel</Text>
        </View>
        <TouchableOpacity>
          <Image
            source={{
              uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Next_page_7d5f8d57-b726-4b52-aeec-018b37d14684.png?v=1747143071',
            }}
            style={styles.arrow}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Avatars */}
      <View style={styles.avatarGrid}>
        {expertImages.map((url, index) => (
          <Image key={index} source={{ uri: url }} style={styles.avatar} />
        ))}
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
shadowWrapper: {
    margin: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden', 
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#000',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  arrow: {
    width: 40,
    height: 40,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 6,
  },
});
