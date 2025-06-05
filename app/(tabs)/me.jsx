import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, FontAwesome5, Entypo } from '@expo/vector-icons';

export default function MeScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleLogoutConfirm = async () => {
    try {
      await AsyncStorage.removeItem('userDetails');
      setShowLogoutModal(false);
      router.replace('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Profile block */}
        <TouchableOpacity
          style={styles.profileBlock}
          onPress={() => router.push('/myprofile')}
        >
          <View style={styles.profileAvatar} />
          <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
          <Entypo name="chevron-right" size={22} color="black" />
        </TouchableOpacity>

        {/* Buy Kit Box */}
        <View style={styles.buyKitBox}>
          <Ionicons name="cart-outline" size={28} color="white" style={{ marginBottom: 8 }} />
          <Text style={styles.buyKitHeaderText}>Once you buy your kit</Text>
          <Text style={styles.buyKitDescription}>
            Muditam Exerts will approve your plan and build a detailed prescription.
          </Text>
          <TouchableOpacity
            style={styles.buyNowButton}
            onPress={() => console.log("Buy Now clicked")}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons Row */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.buttonItem}
            onPress={() => router.push('/sugardrop')} // navigate to Sugar Drop page
          >
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
            <Entypo name="chevron-right" size={20} color="black" />
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <TouchableOpacity onPress={() => setShowLogoutModal(true)} style={styles.linkRow}>
          <Text style={styles.linkText}>Logout</Text>
          <Entypo name="chevron-right" size={20} color="black" />
        </TouchableOpacity>

        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                style={styles.modalClose}
              >
                <Entypo name="cross" size={22} color="gray" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Logout?</Text>
              <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalLogoutButton}
                  onPress={handleLogoutConfirm}
                >
                  <Text style={styles.modalLogoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? 25 : 0, // handle Android status bar
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  profileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F0FF',
    padding: 16,
    marginBottom: 24,
    marginHorizontal: -16,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#A78BFA',
    borderRadius: 20,
    marginRight: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  buyKitBox: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  buyKitHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  buyKitDescription: {
    color: 'white',
    fontSize: 12,
    textAlign: 'left',
    marginBottom: 12,
  },
  buyNowButton: {
    backgroundColor: '#DDD6FE',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  buyNowText: {
    color: '#5B21B6',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  buttonItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#E4D0FF',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  buttonText: {
    marginTop: 6,
    fontSize: 12,
    color: '#543087',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  linkText: {
    fontSize: 14,
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  modalMessage: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#A78BFA',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  modalCancelText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '600',
  },
  modalLogoutButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#A78BFA',
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalLogoutText: {
    textAlign: 'center',
    color: '#A78BFA',
    fontWeight: '600',
  },
});
