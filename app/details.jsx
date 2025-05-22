import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DetailsScreen() {
  const router = useRouter();
  const { phone: phoneParam } = useLocalSearchParams();
  const [phone, setPhone] = useState(phoneParam || '');
  const [loadingPhone, setLoadingPhone] = useState(!phoneParam); // loading if no param
  const [name, setName] = useState('');
  const [yearOfBirth, setYearOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const years = Array.from({ length: 80 }, (_, i) => `${new Date().getFullYear() - i}`);

  useEffect(() => {
    // Load phone from AsyncStorage only if no param provided
    if (!phoneParam) {
      const loadPhone = async () => {
        try {
          const storedPhone = await AsyncStorage.getItem('userPhone');
          console.log('Loaded phone from AsyncStorage:', storedPhone);
          if (storedPhone) {
            setPhone(storedPhone);
          }
        } catch (e) {
          console.error('Failed to load phone from storage', e);
        } finally {
          setLoadingPhone(false);
        }
      };
      loadPhone();
    } else {
      setLoadingPhone(false);
    }
  }, [phoneParam]);

  const handleSubmit = async () => {
  if (!name || !yearOfBirth || !gender || !phone) {
    Alert.alert('Missing Fields', 'Please fill all required fields.');
    return;
  }
  try {
    setLoadingSubmit(true);
    const res = await fetch('http://192.168.1.9:3001/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        name,
        yearOfBirth,
        gender,
        email,
      }),
    });

    if (res.ok) {
      const userData = await res.json();
      await AsyncStorage.setItem('userDetails', JSON.stringify(userData));  
      router.replace('/home');
    } else {
      Alert.alert('Error', 'Could not save your details.');
    }
  } catch (err) {
    Alert.alert('Network Error', 'Please try again later.');
  } finally {
    setLoadingSubmit(false);
  }
};


  // Show loading indicator until phone is loaded from storage
  if (loadingPhone) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#A855F7" />
        <Text style={{ marginTop: 12, fontSize: 16 }}>Loading your phone number...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20, marginLeft: -5 }}>
        <Image
          source={{
            uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Group_23.png?v=1747130916',
          }}
          style={{ width: 28, height: 28 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Name */}
      <Text style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 18 }}>What’s your Name?</Text>
      <TextInput
        placeholder="Enter your Name"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 6,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginBottom: 20,
        }}
      />

      {/* Year of Birth */}
      <Text style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 18 }}>What’s your Year of Birth?</Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 6,
          marginBottom: 20,
        }}
      >
        <Picker
          selectedValue={yearOfBirth}
          onValueChange={(itemValue) => setYearOfBirth(itemValue)}
        >
          <Picker.Item label="Drop down selection of year/ Calendar" value="" />
          {years.map((year) => (
            <Picker.Item key={year} label={year} value={year} />
          ))}
        </Picker>
      </View>

      {/* Gender */}
      <Text style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 18 }}>What’s your Gender?</Text>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <Pressable
          onPress={() => setGender('Male')}
          style={{
            flex: 1,
            padding: 10,
            borderWidth: 1,
            borderColor: gender === 'Male' ? '#A855F7' : '#ccc',
            borderRadius: 6,
            marginRight: 10,
            alignItems: 'center',
          }}
        >
          <Text>♂️ Male</Text>
        </Pressable>
        <Pressable
          onPress={() => setGender('Female')}
          style={{
            flex: 1,
            padding: 10,
            borderWidth: 1,
            borderColor: gender === 'Female' ? '#A855F7' : '#ccc',
            borderRadius: 6,
            alignItems: 'center',
          }}
        >
          <Text>♀️ Female</Text>
        </Pressable>
      </View>

      {/* Email */}
      <Text style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 18 }}>What’s your Email? (optional)</Text>
      <TextInput
        placeholder="Enter your email address"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 6,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginBottom: 20,
        }}
        keyboardType="email-address"
      />

      {/* Privacy Text */}
      <Text style={{ textAlign: 'center', fontSize: 15, marginBottom: 20 }}>
        We keep your personal data safe and secure.
      </Text>

      {/* Submit Button */}
      <TouchableOpacity
        style={{
          backgroundColor: '#A855F7',
          paddingVertical: 14,
          borderRadius: 15,
          alignItems: 'center',
        }}
        onPress={handleSubmit}
        disabled={loadingSubmit}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          {loadingSubmit ? 'Submitting...' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
