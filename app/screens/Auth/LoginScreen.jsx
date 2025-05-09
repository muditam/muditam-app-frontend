import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import LegalModal from '../../components/LegalModal';

export default function LoginScreen() {
  const router = useRouter();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleGetOtp = () => {
    if (phoneNumber.length === 10) {
      router.replace('/home'); // Navigate to Home
    } else {
      Alert.alert('Invalid Number', 'Please enter a 10-digit mobile number.');
    }
  };

  const privacyContent = `Welcome to our website/mobile site...`;
  const termsContent = `These Terms of Service (“Terms”)...`;

  return (
    <View className="flex-1 bg-white">
      <Image
        source={{
          uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Smiles_in_the_Park.png?v=1746440710',
        }}
        className="w-full h-60"
        resizeMode="cover"
      />

      <View className="p-6">
        <Text className="text-xl font-semibold text-center mb-2">
          Diabetes Solution Backed by Science
        </Text>
        <Text className="text-center text-gray-500 mb-6">Log in or Sign up</Text>

        <View className="flex-row items-center border border-gray-300 rounded-md px-3 py-2 mb-4">
          <Text className="text-gray-600 mr-2">+91</Text>
          <TextInput
            className="flex-1 text-base"
            keyboardType="phone-pad"
            placeholder="Mobile number"
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <TouchableOpacity
          className={`py-3 rounded-md ${
            phoneNumber.length === 10 ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          onPress={handleGetOtp}
        >
          <Text className="text-center text-white font-semibold">Get OTP</Text>
        </TouchableOpacity>

        <Text className="text-xs text-center text-gray-400 mt-4">
          By proceeding, you consent to share your information with Muditam and agree to Muditam’s{' '}
          <Text className="underline text-blue-600" onPress={() => setShowPrivacy(true)}>Privacy Policy</Text> and{' '}
          <Text className="underline text-blue-600" onPress={() => setShowTerms(true)}>Terms of Service</Text>.
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
