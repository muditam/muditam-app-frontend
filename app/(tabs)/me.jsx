import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, FontAwesome5, Entypo } from '@expo/vector-icons';

export default function MeScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('userDetails');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load user details", e);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem('userDetails');
    // If you want to preserve quiz status, DO NOT remove 'quizCompleted'
    router.replace('/login');
  } catch (error) {
    console.error("Logout failed", error);
  }
};


  return (
    <ScrollView style={styles.container}>
      {/* Top: Profile */}
      <TouchableOpacity style={styles.profileRow}>
        <View style={styles.profileAvatar} />
        <Text style={styles.profileName}>
          {user?.name || 'Guest'}
        </Text>
      </TouchableOpacity>

      {/* Box: Buy Kit */}
      <View style={styles.buyKitBox}>
        <View style={styles.buyKitHeader}>
          <Ionicons name="cart-outline" size={24} color="white" />
          <Text style={styles.buyKitHeaderText}>Once you buy your kit</Text>
        </View>
        <Text style={styles.buyKitDescription}>
          Muditam Experts will approve your plan and build a detailed prescription.
        </Text>
        <TouchableOpacity
          style={styles.buyNowButton}
          onPress={() => Alert.alert("Buy Now clicked")}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons Row */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.buttonItem}>
          <FontAwesome5 name="tint" size={20} color="#543087" />
          <Text style={styles.buttonText}>Sugar Drop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonItem}>
          <Ionicons name="help-circle-outline" size={22} color="#543087" />
          <Text style={styles.buttonText}>Help & Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonItem}>
          <FontAwesome5 name="whatsapp" size={20} color="#543087" />
          <Text style={styles.buttonText}>Chat With Us</Text>
        </TouchableOpacity>
      </View>

      {/* Links */}
      {[
        { title: 'All Products', route: '/products' },
        { title: 'Terms & Policies', route: '/terms' },
        { title: 'Read More', route: '/read-more' },
      ].map((item, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => router.push(item.route)}
          style={styles.linkRow}
        >
          <Text style={styles.linkText}>{item.title}</Text>
          <Entypo name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
      ))}

      {/* Logout */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutRow}>
        <Text style={styles.logoutText}>Logout</Text>
        <Entypo name="chevron-right" size={20} color="gray" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#A78BFA', // purple-300
    borderRadius: 24,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  buyKitBox: {
    backgroundColor: '#6B21A8', // purple-700
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  buyKitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  buyKitHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buyKitDescription: {
    color: 'white',
    fontSize: 14,
    marginBottom: 12,
  },
  buyNowButton: {
    backgroundColor: '#DDD6FE', // purple-200
    borderRadius: 8,
    paddingVertical: 8,
  },
  buyNowText: {
    color: '#5B21B6', // purple-900
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  buttonItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#EDE9FE', // purple-100
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  buttonText: {
    marginTop: 6,
    fontSize: 14,
    color: '#543087',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#E5E7EB', // gray-200
    borderBottomWidth: 1,
  },
  linkText: {
    fontSize: 16,
  },
  logoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#DC2626',  
  },
});