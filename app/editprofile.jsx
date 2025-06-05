import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfile() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    yearOfBirth: '',
    gender: '',
    language: 'English',
  });
  const [alternateEmail, setAlternateEmail] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem('userDetails');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    };
    loadUser();
  }, []);

  const handleUpdate = async () => {
  try {
    const response = await fetch('http://192.168.1.15:3001/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    const result = await response.json();
    if (result.success) {
      await AsyncStorage.setItem('userDetails', JSON.stringify(user));
      router.replace('/myprofile');
    } else {
      alert('Failed to update profile');
    }
  } catch (error) {
    console.error('Update failed:', error);
    alert('An error occurred while updating profile');
  }
};


  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/myprofile')}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Avatar with image */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarPlaceholder}>
          <Image
            source={{ uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Vector_1_e7acc257-dd81-4e5f-8ca1-346f88204606.png?v=1748439473' }}
            style={{ width: 100, height: 100, tintColor: '#9CA3AF' }}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.cameraIcon}>
            <Feather name="camera" size={16} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={user.name}
        onChangeText={(text) => setUser({ ...user, name: text })}
      />

      {/* Email */}
      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        value={user.email}
        onChangeText={(text) => setUser({ ...user, email: text })}
      />

      {/* Phone */}
      <Text style={styles.label}>Primary Phone Number</Text>
      <TextInput
        style={styles.input}
        value={user.phone}
        editable={false}
      />

      {/* Age + Gender */}
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={user.yearOfBirth ? String(new Date().getFullYear() - user.yearOfBirth) : ''}
            editable={false}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            value={user.gender}
            editable={false}
          />
        </View>
      </View>

      {/* Preferred Language */}
      <Text style={styles.label}>Preferred Language</Text>
      <View style={styles.input}>
        <Text style={{ fontSize: 14 }}>{user.language}</Text>
      </View>

      {/* Alternate Contact */}
      <Text style={styles.label}>Alternate Contact Information</Text>
      <TextInput
        style={styles.input}
        placeholder="example@gmail.com"
        value={alternateEmail}
        onChangeText={setAlternateEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter phone number without country code"
        value={alternatePhone}
        onChangeText={setAlternatePhone}
      />

      {/* Update Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Text style={styles.updateText}>Update</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 25,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  avatarSection: { alignItems: 'center', marginVertical: 16 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#EDE9FE',
    padding: 6,
    borderRadius: 20,
  },
  label: { fontSize: 14, fontWeight: '500', marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: 'white',
    marginTop: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  updateButton: {
    backgroundColor: '#E9D5FF',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  updateText: {
    textAlign: 'center',
    color: '#7C3AED',
    fontWeight: '600',
    fontSize: 16,
  },
});
