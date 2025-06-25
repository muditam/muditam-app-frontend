import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const [language, setLanguage] = useState("English");
  const [alternateEmail, setAlternateEmail] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [image, setImage] = useState(null);
  const router = useRouter();

  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    yearOfBirth: '',
    gender: '',
    language: 'English',
    avatar: '',
  });
  const [originalUser, setOriginalUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem('userDetails');
      if (stored) {
        const userData = JSON.parse(stored);
        setUser(userData);
        setOriginalUser(userData); // snapshot for comparison
        setLanguage(userData.language || "English");
      }
    };
    loadUser();
  }, []);

  // Track if anything changed (image or profile fields)
  const hasChanges = useMemo(() => {
    if (!originalUser) return false;
    const { avatar: origAvatar, language: origLang, name: origName, email: origEmail } = originalUser;
    return (
      image !== null ||
      user.avatar !== origAvatar ||
      language !== origLang ||
      user.name !== origName ||
      user.email !== origEmail ||
      alternateEmail.length > 0 ||
      alternatePhone.length > 0
    );
  }, [image, user, language, alternateEmail, alternatePhone, originalUser]);

  const pickImage = () => {
    Alert.alert('Upload Photo', 'Choose an option', [
      { text: 'Camera', onPress: () => launchCamera() },
      { text: 'Gallery', onPress: () => launchGallery() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return alert('Camera access needed');
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      setImage(pickedUri);
      setUser((prev) => ({ ...prev, avatar: pickedUri }));
    }
  };

  const launchGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      setImage(pickedUri);
      setUser((prev) => ({ ...prev, avatar: pickedUri }));
    }
  };

  const handleUpdate = async () => {
    if (!hasChanges) return;
    try {
      const formData = new FormData();
      formData.append('phone', user.phone);
      formData.append('name', user.name);
      formData.append('email', user.email);
      formData.append('yearOfBirth', user.yearOfBirth);
      formData.append('gender', user.gender);
      formData.append('language', language);

      if (image && !image.startsWith('https://')) {
        const fileName = image.split('/').pop();
        const fileType = fileName.split('.').pop();
        formData.append('avatar', {
          uri: image,
          name: fileName,
          type: `image/${fileType}`,
        });
      }

      const response = await fetch('https://muditam-app-backend.onrender.com/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        await AsyncStorage.setItem('userDetails', JSON.stringify(result.user));
        setOriginalUser(result.user); // reset snapshot after save
        setUser(result.user);
        setImage(null);
        router.replace('/myprofile');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      alert('An error occurred while updating profile');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/myprofile")}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage}>
            {image || user.avatar ? (
              <Image
                source={{ uri: image || user.avatar }}
                style={styles.avatarImage}
                onError={() => {
                  setImage(null);
                  setUser((prev) => ({ ...prev, avatar: '' }));
                }}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-outline" size={60} color="#D3D3D3" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Feather name="camera" size={20} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Label text="Name" />
          <TextInput style={styles.input} value={user.name} onChangeText={(text) => setUser({ ...user, name: text })} />

          <Label text="Email Address" />
          <TextInput style={styles.input} value={user.email} onChangeText={(text) => setUser({ ...user, email: text })} keyboardType="email-address" />

          <Label text="Primary Phone Number" />
          <TextInput style={[styles.input, { color: "#8D8D8D" }]} value={`+91${user.phone}`} editable={false} keyboardType="phone-pad" />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Label text="Age" />
              <TextInput
                style={styles.input}
                value={user.yearOfBirth ? String(new Date().getFullYear() - user.yearOfBirth) : ""}
                editable={false}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Label text="Gender" />
              <TextInput style={[styles.input, { color: "#8D8D8D" }]} value={user.gender} editable={false} />
            </View>
          </View>

          <Label text="Preferred Language" />
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={language} onValueChange={(val) => {
              setLanguage(val);
              setUser({ ...user, language: val });
            }} style={styles.picker} dropdownIconColor="#999">
              <Picker.Item label="English" value="English" />
              <Picker.Item label="Hindi" value="Hindi" />
              <Picker.Item label="Tamil" value="Tamil" />
            </Picker>
          </View>

          <Label text="Alternate Contact Information" />
          <TextInput style={styles.input} placeholder="example@gmail.com" value={alternateEmail} onChangeText={setAlternateEmail} />
          <TextInput style={styles.input} placeholder="Enter phone number without country code" value={alternatePhone} onChangeText={setAlternatePhone} keyboardType="phone-pad" />
        </View>

        <TouchableOpacity
          style={[
            styles.updateButton,
            hasChanges ? styles.updateButtonActive : null
          ]}
          onPress={handleUpdate}
          disabled={!hasChanges}
        >
          <Text style={[
            styles.updateButtonText,
            hasChanges ? null : { opacity: 0.5 }
          ]}>
            Update
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ text }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    paddingLeft: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
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
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
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
    paddingTop: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#9C9C9C",
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginVertical: 5,
  },
  pickerWrapper: {
    borderWidth: 0.5,
    borderColor: "#9C9C9C",
    borderRadius: 4,
    marginBottom: 14,
    marginTop: 5,
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  updateButton: {
    backgroundColor: "#E4D0FF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  updateButtonActive: {
    backgroundColor: "#B67CFF",
  },
  updateButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
});
