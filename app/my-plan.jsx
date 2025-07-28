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
          setLoading(false);
          return;
        }

        // Fetch user data including purchasedProducts
        const res = await fetch(`https://muditam-app-backend.onrender.com/api/user/${phone}`);
        const user = await res.json();

        if (!res.ok || !user) {
          console.warn('User not found');
          setLoading(false);
          return;
        }

        // Fetch product details for purchased product IDs
        const productIds = user.purchasedProducts?.map((p) => p.productId) || [];
        if (productIds.length === 0) {
          setLoading(false);
          return;
        }

        const productsRes = await fetch(
          'https://muditam-app-backend.onrender.com/api/shopify/products'
        );
        const allProducts = await productsRes.json();

        // Filter products that match purchased product IDs
        const purchasedProducts = allProducts
          .filter((product) => productIds.includes(String(product.id)))
          .map((product) => ({
            id: product.id,
            title: product.title,
            image: product.image,
            description: product.description,
            dosage: product.title === 'Karela Jamun Fizz'
              ? 'Take 1 tablet on an empty stomach in the morning & 1 tablet 30 minutes before dinner'
              : product.title === 'Sugar Defend Pro'
              ? 'Take 1 tablet after breakfast and 1 tablet after lunch'
              : '', // default dosage if none
          }));

        setProducts(purchasedProducts);
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
                {/* Dosage Info */}
                {item.dosage ? (
                  <Text style={styles.cardDose}>Dosage: {item.dosage}</Text>
                ) : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles remain unchanged
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
});
