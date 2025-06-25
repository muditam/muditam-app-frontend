import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyPlanScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchasedProducts = async () => {
      try {
        const userData = await AsyncStorage.getItem('userDetails');
        const phone = JSON.parse(userData || '{}')?.phone;

        if (!phone) {
          console.warn('No phone found in storage');
          return;
        }

        const res = await fetch(`https://muditam-app-backend.onrender.com/api/shopify/purchased-products/${phone}`);
        const data = await res.json();
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching purchased products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedProducts();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#9D57FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Digital Prescription */}
        <Text style={styles.sectionTitle}>Your Digital Prescription</Text>
        <View style={styles.prescriptionBox}>
          <Text style={styles.expiredLabel}>Expired</Text>
          <Text style={styles.prescriptionText}>
            Your doctor recommended treatment plan
          </Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>View Prescription</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Slider */}
        {products.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>How To Use My Kit</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {products.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.sliderItem}>
                  <Image source={{ uri: item.image }} style={styles.sliderImage} />
                  <Text style={styles.sliderLabel}>{item.title}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Treatment Plan */}
        <Text style={styles.sectionTitle}>Your Treatment Plan</Text>
        {products.length === 0 ? (
          <Text style={{ fontSize: 14, color: '#999' }}>No purchased products found.</Text>
        ) : (
          products.map((item, idx) => (
            <View key={idx} style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>
                  {item.description?.replace(/<[^>]+>/g, '')}
                </Text>
                <Text style={styles.cardDose}>Dosage info not available</Text>

                <View style={styles.progressRow}>
                  <Text style={styles.cardProgress}>Progress tracking coming soon</Text>
                  <View style={styles.courseBadge}>
                    <Text style={styles.courseBadgeText}>Course Completed</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
    marginBottom: 8,
    color: '#000',
  },
  prescriptionBox: {
    backgroundColor: '#F6F0FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    position: 'relative',
  },
  expiredLabel: {
    position: 'absolute',
    top: 8,
    right: 12,
    fontSize: 10,
    color: '#fff',
    backgroundColor: '#FFA726',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontFamily: 'Poppins',
  },
  prescriptionText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#333',
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#543287',
    textDecorationLine: 'underline',
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  sliderItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  sliderImage: {
    width: 70,
    height: 100,
    resizeMode: 'contain',
  },
  sliderLabel: {
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'Poppins',
    textAlign: 'center',
    width: 80,
  },
  card: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  cardImage: {
    width: 60,
    height: 80,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: '#666',
    marginTop: 2,
  },
  cardDose: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: '#333',
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardProgress: {
    fontSize: 11,
    fontFamily: 'Poppins',
    color: '#888',
  },
  courseBadge: {
    backgroundColor: '#E8DBFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,   
  },
  courseBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6C2DBD',
    fontFamily: 'Poppins',
  },
});
