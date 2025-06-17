import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function EditProfileScreen() {

  const [language, setLanguage] = useState("English");
  const [alternateEmail, setAlternateEmail] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const router = useRouter();

   const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    yearOfBirth: '',
    gender: '', 
    language: 'English',
  });

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
    const response = await fetch('http://192.168.1.32:3001/api/user/update', {
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/myprofile")}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person-outline" size={60} color="#D3D3D3" />
          <TouchableOpacity style={styles.cameraIcon}>
            <Feather name="camera" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        <Label text="Name" />
        <TextInput style={styles.input} value={user.name}
        onChangeText={(text) => setUser({ ...user, name: text })} />

        <Label text="Email Address" />
        <TextInput
          style={styles.input}
          
        value={user.email}
        onChangeText={(text) => setUser({ ...user, email: text })}
          keyboardType="email-address"
        />

        <Label text="Primary Phone Number" />
        <TextInput
          style={[styles.input, { color: "#8D8D8D" }]}
          value={`+91${user.phone}`}
        editable={false}
          keyboardType="phone-pad"
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Label text="Age" />
            <TextInput
              style={styles.input}
              value={user.yearOfBirth ? String(new Date().getFullYear() - user.yearOfBirth) : ''}
            editable={false}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Label text="Gender" />
            <View >
              <TextInput
            style={[styles.input, { color: "#8D8D8D" }]}
          value={user.gender}
        editable={false}
          keyboardType="gender"
        />
              
            </View>
          </View>
        </View>

        <Label text="Preferred Language"/>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={language}
            onValueChange={(val) => setLanguage(val)}
            style={styles.picker}
            dropdownIconColor="#999"
          >
            <Picker.Item label="English" value="English" />
            <Picker.Item label="Hindi" value="Hindi" />
            <Picker.Item label="Tamil" value="Tamil" />
          </Picker>
          
        </View>

        <Label text="Alternate Contact Information" />
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
          keyboardType="phone-pad"
        />
      </View>

      {/* Update Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Text style={styles.updateButtonText}>Update</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Label({ text }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
     paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    paddingLeft:16,
  },
  
  avatarContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical:16,
},

avatarPlaceholder: {
  width: 80,
  height: 80,
  borderRadius: 50, 
  borderWidth: 4,
  borderColor: '#D3D3D3',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
},
  cameraIcon: {
    position: "absolute",
    bottom: -3,
    right: -3,
    backgroundColor: "#E4D0FF",
    borderRadius: 16,
    padding: 4,
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
  paddingTop:10,
    
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#9C9C9C",
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginVertical:5,
  },
  pickerWrapper: {
    borderWidth: 0.5,
    borderColor: "#9C9C9C",
    borderRadius: 4,
    marginBottom: 14,
    marginTop:5,
    position: "relative",
    justifyContent: "center",
    height: 45,
  },
  picker: {
    height: 55,
    width: "100%",
    paddingLeft: 12,
    color: "#000",
  },
  pickerIcon: {
    position: "absolute",
    right: 12,
    top: 16,
    pointerEvents: "none",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  updateButton: {
    backgroundColor: "#E4D0FF",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonText: {
    fontSize: 18,
    fontFamily: "poppins",
    fontWeight: "700",
  },
});


