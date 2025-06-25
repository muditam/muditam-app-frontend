import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';

const SupportCard = () => {
  const handleWhatsApp = () => {
    const phoneNumber = '8989174741';
    const url = `https://wa.me/91${phoneNumber}`;
    Linking.openURL(url).catch(err => console.error("Couldn't open WhatsApp", err));
  };

  const handleCall = () => {
    const phoneNumber = 'tel:8989174741';
    Linking.openURL(phoneNumber).catch(err => console.error("Couldn't make call", err));
  };

  return (
    <>
    <View style={styles.line2} />
    <View style={styles.card}>
      {/* Top Content */}
      
      <View style={styles.topRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>We are here for you,{'\n'}always.</Text>
          <Text style={styles.subtitle}>Talk to your diabetic coach for free.</Text>
        </View>
        <Image
          source={{ uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_3.png?v=1747143071' }}
          style={styles.image}
        />
      </View>

      {/* Bottom Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.chatButton} onPress={handleWhatsApp}>
          <FontAwesome name="whatsapp" size={18} color="#000" />
          <Text style={styles.chatButtonText}>Chat With Us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Feather name="phone" size={18} color="#000" />
          <Text style={styles.callButtonText}>Book A Call</Text>
        </TouchableOpacity>
      </View>
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00000020',
    padding: 20,
    marginHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9D5FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  chatButtonText: {
    marginLeft: 8,
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  line2: {
    height: 4,
    backgroundColor: '#E9E9E9',
    marginVertical: 20,
    width: '100%',
  },
  callButtonText: {
    marginLeft: 8,
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default SupportCard;
