import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function History() {
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (userDetails) {
          const { phone } = JSON.parse(userDetails);
          const response = await fetch(`https://muditam-app-backend-6a867f82b8dc.herokuapp.com/api/shopify/customer-history/${phone}`);

          if (response.ok) {
            const data = await response.json();
            setPurchaseHistory(data);
          } else {
            console.error('Failed to fetch purchase history:', response.status, response.statusText);
          }
        }
      } catch (error) {
        console.error('Error fetching purchase history:', error);
      }
    };

    fetchPurchaseHistory();
  }, []); 

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Purchase History</Text>

        {purchaseHistory.length === 0 ? (
          <Text style={styles.emptyText}>You have no purchase history yet.</Text>
        ) : (
          purchaseHistory.map((item, index) => (
            <View key={index} style={styles.purchaseCard}>
              <View style={styles.purchaseInfo}>
                <Text style={styles.purchaseTitle}>{item.productName}</Text>
                <Text style={styles.purchaseOrderName}>Order Name: {item.orderName}</Text>
                <Text style={styles.purchaseDate}>Date: {item.purchaseDate}</Text>
                <Text style={styles.purchasePrice}>Price: ₹{item.price}</Text>
                <Text style={styles.purchaseQuantity}>Quantity: {item.quantity}</Text>
                <Text style={styles.purchaseTotal}>Total: ₹{item.totalAmount}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4', // Light background to make the content pop
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#543287',
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Poppins',
    marginTop: 20,
  },
  purchaseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 5, // Shadow effect for card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#543287',
    marginBottom: 10,
    fontFamily: 'Poppins',
  },
  purchaseOrderName: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
    fontFamily: 'Poppins',
  },
  purchaseDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontFamily: 'Poppins',
  },
  purchasePrice: {
    fontSize: 14,
    color: '#543287',
    marginBottom: 6,
    fontFamily: 'Poppins',
  },
  purchaseQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontFamily: 'Poppins',
  },
  purchaseTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#543287',
    fontFamily: 'Poppins',
  },
});
