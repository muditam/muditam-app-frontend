import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Feather } from "@expo/vector-icons";
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
  const [email, setEmail] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);


  const years = Array.from(
    { length: 80 },
    (_, i) => `${new Date().getFullYear() - i}`
  );


  useEffect(() => {
    // Load phone from AsyncStorage only if no param provided
    if (!phoneParam) {
      const loadPhone = async () => {
        try {
          const storedPhone = await AsyncStorage.getItem("userPhone");
          console.log("Loaded phone from AsyncStorage:", storedPhone);
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
    if (!name || !yearOfBirth || !gender || !phone) {
      Alert.alert("Missing Fields", "Please fill all required fields.");
      return;
    }
    try {
      setLoadingSubmit(true);
      const res = await fetch("http://192.168.1.32:3001/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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


  // Show loading indicator until phone is loaded from storage
  if (loadingPhone) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#A855F7" />
        <Text style={{ marginTop: 12, fontSize: 16 }}>
          Loading your phone number...
        </Text>
      </View>
    );
  }


  return (
    <SafeAreaView style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ paddingTop: 5, marginLeft: -5, marginBottom: -9, }}
        >
          <Image
            source={{
              uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Group_23.png?v=1747130916",
            }}
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
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={yearOfBirth}
            onValueChange={(itemValue) => setYearOfBirth(itemValue)}
          >
            <Picker.Item
              label="Drop down selection of year/ Calender"
              value=""
              color="#B5B5B5"
            />
            {years.map((year) => (
              <Picker.Item key={year} label={year} value={year} />
            ))}
          </Picker>
        </View>


        <Text style={styles.label}>What’s your Gender?</Text>
        <View style={styles.genderRow}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "Male" && styles.genderSelected,
            ]}
            onPress={() => setGender("Male")}
          >
            <Text style={styles.genderIcon}>♂</Text>
            <Text style={styles.genderText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "Female" && styles.genderSelected,
            ]}
            onPress={() => setGender("Female")}
          >
            <Text style={styles.genderIcon}>♀</Text>
            <Text style={styles.genderText}>Female</Text>
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
  backArrow: {
    fontSize: 24,
    marginBottom: 0,
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#F6F6F6",
    fontSize: 16,
    justifyContent: "center",
    height: 45,
  },
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    fontSize: 16,
  },
  genderSelected: {
    backgroundColor: "#e9d5ff",
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



