import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LegalModal from '../../components/LegalModal';

export default function LoginScreen() {
  const router = useRouter();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetOtp = async () => {
  if (phoneNumber.length !== 10) {
    return Alert.alert('Invalid Number', 'Please enter a 10-digit mobile number.');
  }

  setLoading(true);
  try {
    await AsyncStorage.setItem('userPhone', phoneNumber);

    // You can keep your API call for user existence check here or inside OTP screen
    // But better to do this only once in OTP screen to simplify flow.

    // Just navigate to OTP and pass phone param always
    router.push({ pathname: '/otp', params: { phone: phoneNumber } });
  } catch (err) {
    Alert.alert('Error', 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};


  const privacyContent = `Welcome to our website/mobile site...`;
  const termsContent = `These Terms of Service (“Terms”)...`;

  return (
    <View className="flex-1 bg-white">
      {/* Header Image */}
      <Image
        source={{
          uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/ChatGPT_Image_Apr_16_2025_11_24_23_AM.png?v=1747119091',
        }}
        style={{ width: '100%', height: 450 }}
        resizeMode="cover"
      />

      {/* Content Card */}
      <View
        style={{
          position: 'absolute',
          top: 284,
          left: 24,
          right: 24,
          backgroundColor: 'white',
          paddingTop: 40,
          paddingBottom: 24,
          paddingHorizontal: 24,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        {/* Heading */}
        <Text
          style={{
            fontFamily: 'Poppins',
            fontWeight: 'bold',
            fontSize: 22,
            textAlign: 'left',
            marginBottom: 20,
          }}
        >
          Kindly fill in the details:
        </Text>

        {/* Phone Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'black',
            borderRadius: 15,
            paddingHorizontal: 12,
            paddingVertical: 3,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: 'gray', marginRight: 8 }}>+91</Text>
          <TextInput
            style={{ flex: 1, fontSize: 16 }}
            keyboardType="phone-pad"
            placeholder="Enter your number"
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        {/* Get OTP Button */}
        <TouchableOpacity
          style={{
            backgroundColor: phoneNumber.length === 10 ? '#A855F7' : '#D1D5DB',
            paddingVertical: 14,
            borderRadius: 15,
            alignItems: 'center',
          }}
          onPress={handleGetOtp}
          disabled={loading}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>
            {loading ? 'Please wait...' : 'Get OTP'}
          </Text>
        </TouchableOpacity>

        {/* Gradient Line */}
        <View
          style={{
            flexDirection: 'row',
            height: 1,
            marginTop: 50,
            marginBottom: 50,
            borderRadius: 1,
          }}
        >
          <View style={{ flex: 1, backgroundColor: '#ffffff' }} />
          <View style={{ flex: 1, backgroundColor: '#b5b5b5' }} />
          <View style={{ flex: 1, backgroundColor: '#ffffff' }} />
        </View>

        {/* Terms Text */}
        <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center' }}>
          By Signing in, I accept the
        </Text>
        <Text style={{ fontSize: 15, textAlign: 'center', marginTop: 2, marginBottom: 40 }}>
          <Text
            style={{ fontWeight: 'bold', color: '#000000' }}
            onPress={() => setShowTerms(true)}
          >
            Terms & Conditions
          </Text>{' '}
          and{' '}
          <Text
            style={{ fontWeight: 'bold', color: '#000000' }}
            onPress={() => setShowPrivacy(true)}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>

      {/* Modals */}
      <LegalModal
        visible={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        title="Privacy Policy"
        lastUpdated="August 18, 2023"
        content={privacyContent}
      />
      <LegalModal
        visible={showTerms}
        onClose={() => setShowTerms(false)}
        title="Terms of Service"
        lastUpdated="August 18, 2023"
        content={termsContent}
      />
    </View>
  );
}
