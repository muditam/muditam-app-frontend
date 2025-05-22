import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState(Array(6).fill(''));
  const inputs = useRef([]);
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  const isOtpComplete = otp.every((digit) => digit !== '');

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleSubmitOtp = async () => {
    if (!isOtpComplete) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits.');
      return;
    }
    try {
      const response = await fetch(`http://192.168.1.9:3001/api/user/${phone}`);
      console.log('Fetch status:', response.status);
      const text = await response.text();
      console.log('Response text:', text);

      if (response.status === 200) {
        const userData = JSON.parse(text);
        await AsyncStorage.setItem('userDetails', JSON.stringify(userData));
        router.replace('/home');
      } else if (response.status === 404) {
        router.replace({ pathname: '/details', params: { phone } });
      } else {
        Alert.alert('Error', 'Unexpected response from server.');
      }
    } catch (error) {
      console.error('Verify user failed:', error);
      Alert.alert('Error', 'Failed to verify user. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Background Image */}
      <Image
        source={{
          uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/d1a366891736a5373bf01cd3edc35f9703dc4ae5.png?v=1747125024',
        }}
        style={{ width: '100%', height: 420 }}
        resizeMode="cover"
      />

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.replace('/login')}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 6,
          zIndex: 10,
        }}
      >
        <Image
          source={{
            uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Group_23.png?v=1747130916',
          }}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Card */}
      <View
        style={{
          position: 'absolute',
          top: 240,
          left: 20,
          right: 20,
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        {/* Title */}
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
          Enter OTP
        </Text>

        {/* OTP Boxes */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={{
                width: 45,
                height: 45,
                borderWidth: 1,
                borderColor: '#ccc',
                textAlign: 'center',
                fontSize: 18,
                borderRadius: 8,
              }}
              maxLength={1}
              keyboardType="numeric"
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
            />
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          disabled={!isOtpComplete}
          style={{
            backgroundColor: isOtpComplete ? '#A855F7' : '#D1D5DB',
            paddingVertical: 14,
            marginTop: 24,
            borderRadius: 15,
            alignItems: 'center',
          }}
          onPress={handleSubmitOtp}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Submit</Text>
        </TouchableOpacity>

        {/* Resend Section */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 14,
            marginTop: 16,
          }}
        >
          <Text style={{ color: '#9CA3AF' }}>
            Resend OTP in{' '}
            <Text style={{ color: '#9CA3AF', fontWeight: 'bold' }}>
              {timer > 0 ? `${timer} sec` : '0 sec'}
            </Text>
          </Text>
          <TouchableOpacity disabled={timer > 0} onPress={() => setTimer(10)}>
            <Text
              style={{
                color: timer === 0 ? '#A855F7' : '#ccc',
                marginLeft: 8,
              }}
            >
              Resend
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trusted Line */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#eee',
            marginTop: 40,
            marginBottom: 40,
            paddingTop: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 10 }}>
            👥 Trusted by 50,000+ Happy Users
          </Text>
        </View>
      </View>
    </View>
  );
}
