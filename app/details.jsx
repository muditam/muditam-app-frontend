import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserProfileForm() {
  const router = useRouter();
  const { phone: phoneParam } = useLocalSearchParams();
  const [phone, setPhone] = useState(phoneParam || "");
  const [loadingPhone, setLoadingPhone] = useState(!phoneParam); 
  const [name, setName] = useState("");
  const [yearOfBirth, setYearOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [email, setEmail] = useState(""); 
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [yearModalVisible, setYearModalVisible] = useState(false);
  const yearList = Array.from({ length: 2011 - 1960 }, (_, i) => `${1960 + i}`);

  useEffect(() => {
    if (!phoneParam) {
      const loadPhone = async () => {
        try {
          const storedPhone = await AsyncStorage.getItem("userPhone");
          if (storedPhone) {
            setPhone(storedPhone);
          }
        } catch (e) {
          console.error("Failed to load phone from storage", e);
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
    if (!name || !yearOfBirth || !gender || !preferredLanguage || !phone) {
      Alert.alert("Missing Fields", "Please fill all required fields.");
      return;
    }

    if (email && !/^[\w.-]+@(?:gmail\.com|yahoo\.com|new\.com)$/i.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoadingSubmit(true);
      const res = await fetch("https://muditam-app-backend.onrender.com/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, yearOfBirth, gender, email, preferredLanguage }),
      });

      if (res.ok) {
        const userData = await res.json();
        await AsyncStorage.setItem("userDetails", JSON.stringify(userData));
        router.replace("/home");
      } else {
        Alert.alert("Error", "Could not save your details.");
      }
    } catch (err) {
      Alert.alert("Network Error", "Please try again later.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingPhone) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#A855F7" />
        <Text style={{ marginTop: 12, fontSize: 16 }}>Loading your phone number...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <TouchableOpacity onPress={() => router.back()} style={{ paddingTop: 5, marginLeft: -5, marginBottom: -9 }}>
              <Image
                source={{ uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Group_23.png?v=1747130916" }}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text style={styles.label}>What’s your Name?</Text>
            <TextInput
              placeholderTextColor="#B5B5B5"
              style={styles.input}
              placeholder="Enter your Name"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>What’s your Year of Birth?</Text>
            <TouchableOpacity
              onPress={() => setYearModalVisible(true)}
              style={styles.customPicker}
            >
              <Text style={yearOfBirth ? styles.customPickerText : styles.placeholderText}>
                {yearOfBirth || "Select your year of birth"}
              </Text>
            </TouchableOpacity>

            <Modal
              animationType="slide"
              transparent={true}
              visible={yearModalVisible}
              onRequestClose={() => setYearModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Year of Birth</Text>
                  <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {yearList.map((year) => (
                      <TouchableOpacity
                        key={year}
                        onPress={() => {
                          setYearOfBirth(year);
                          setYearModalVisible(false);
                        }}
                        style={styles.modalItem}
                      >
                        <Text style={styles.modalItemText}>{year}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity onPress={() => setYearModalVisible(false)} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Text style={styles.label}>What’s your Gender?</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderButton, gender === "Male" && styles.genderSelected]}
                onPress={() => setGender("Male")}
              >
                <Text style={styles.genderIcon}>♂</Text>
                <Text style={styles.genderText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, gender === "Female" && styles.genderSelected]}
                onPress={() => setGender("Female")}
              >
                <Text style={styles.genderIcon}>♀</Text>
                <Text style={styles.genderText}>Female</Text>
              </TouchableOpacity>
            </View>

            {/* Preferred Language */}
            <Text style={styles.label}>Preferred Language</Text>
            <View style={styles.languageRow}>
              <TouchableOpacity
                style={[styles.languageButton, preferredLanguage === "English" && styles.languageSelected]}
                onPress={() => setPreferredLanguage("English")}
              >
                <Text style={styles.languageText}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.languageButton, preferredLanguage === "Hindi" && styles.languageSelected]}
                onPress={() => setPreferredLanguage("Hindi")}
              >
                <Text style={styles.languageText}>Hindi</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>What’s your Email? (optional)</Text>
            <TextInput
              placeholderTextColor="#B5B5B5"
              style={styles.input}
              placeholder="Enter your email address"
              value={email}
              keyboardType="email-address"
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <Text style={styles.infoText}>
              We keep your personal data safe and secure.
            </Text>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loadingSubmit}
            >
              <Text style={styles.submitText}>
                {loadingSubmit ? "Submitting..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 0,
  },
  card: {
    borderRadius: 12,
    flex: 1,
  },
  label: {
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 16,
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#F6F6F6",
    fontSize: 16,
  },
  customPicker: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    backgroundColor: "#F6F6F6",
    marginBottom: 20,
  },
  customPickerText: {
    fontSize: 16,
    color: "#000",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
  },
  closeButton: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#9D57FF",
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 15,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    fontSize: 16,
    paddingVertical: 10,
  },
  genderSelected: {
    backgroundColor: "#e9d5ff",
    borderColor: "#9D57FF",
    borderWidth: 2,
  },
  genderIcon: {
    fontSize: 34,
    fontWeight: "bold",
    marginRight: 6,
  },
  genderText: {
    color: "#B5B5B5",
    fontSize: 16,
  },
  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  languageButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 16,
    backgroundColor: "#F6F6F6",
    paddingVertical: 10,
    alignItems: "center",
  },
  languageSelected: {
    backgroundColor: "#e9d5ff",
    borderColor: "#9D57FF",
    borderWidth: 2,
  },
  languageText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
  },
  infoText: {
    fontSize: 17,
    marginTop: 30,
    textAlign: "center",
    color: "#222222",
  },
  submitButton: {
    backgroundColor: "#9D57FF",
    marginTop: 30,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 20,
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18, 
  },
});
