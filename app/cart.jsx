import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from './contexts/CartContext';

const { width } = Dimensions.get('window');

export default function Cart() {
  const router = useRouter();
  const { cartItems, incrementItem, decrementItem } = useCart();

  const handleDecrement = (item) => {
    if (item.quantity === 1) {
      Alert.alert(
        'Remove from Cart',
        `Are you sure you want to remove "${item.title}" from your cart?`,
        [
          { text: 'Keep in cart', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => decrementItem(item.id, true),
          },
        ]
      );
    } else {
      decrementItem(item.id);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <View style={styles.container}>
      {/* Header with Back Button and Title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#543287" />
        </TouchableOpacity>
        <Text style={styles.heading}>Your Products</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.infoSection}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.price}>₹{item.price * item.quantity}</Text>
              <Text style={styles.tax}>Inclusive of all taxes</Text>
            </View>
            <View style={styles.qtySection}>
              <TouchableOpacity onPress={() => handleDecrement(item)} style={styles.qtyBtn}>
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyCount}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => incrementItem(item.id)} style={styles.qtyBtn}>
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Bottom Total and Pay */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.total}>₹{total}</Text>
          <Text style={styles.tax}>Inclusive of all taxes</Text>
        </View>
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payText}>Proceed To Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 16,
  },
  backBtn: {
    marginRight: 12,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#543287',
  },
  listContainer: {
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  infoSection: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#543287',
  },
  tax: {
    fontSize: 12,
    color: '#666',
  },
  qtySection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyCount: {
    marginVertical: 6,
    fontSize: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#543287',
  },
  payButton: {
    backgroundColor: '#543287',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  payText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
