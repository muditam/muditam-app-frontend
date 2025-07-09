import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LegalModal from "../../components/LegalModal";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

export default function LoginScreen() {
  const router = useRouter();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetOtp = async () => {
    if (phoneNumber.length !== 10) {
      return Alert.alert(
        "Invalid Number",
        "Please enter a 10-digit mobile number."
      );
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem("userPhone", phoneNumber);
      router.push({ pathname: "/otp", params: { phone: phoneNumber } });
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const privacyContent = `Welcome to our website/mobile site...`;
  const termsContent = `These Terms of Service (“Terms”)...`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header Image */}
          <Image
            source={{
              uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/1_5b6c94fe-8228-4d5c-934d-62dde3ab6f26.png?v=1751977906",
            }}
            style={{ width: "100%", height: 430 }}
            resizeMode="cover"
          />

          {/* Content Card */}
          <View
            style={{
              marginTop: -180,
              marginHorizontal: 16,
              backgroundColor: "white",
              paddingTop: 40,
              paddingHorizontal: 16,
              borderRadius: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 1.3,
              paddingBottom: 90,
            }}
          >
            {/* Heading */}
            <Text
              style={{
                fontFamily: "Poppins",
                fontWeight: "bold",
                fontSize: 26,
                textAlign: "left",
                marginBottom: 30,
              }}
            >
              Kindly fill in the details:
            </Text>

            {/* Phone Input */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "black",
                borderRadius: 10,
                paddingHorizontal: 12,
                height: 53,
                marginBottom: 20,
              }}
            >
              <Text style={{ marginRight: 10, fontSize: 17 }}>+91</Text>
              <TextInput
                style={{ flex: 1, fontSize: 17, color: "#000" }}
                keyboardType="number-pad"
                placeholder="Enter your number"
                maxLength={10}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholderTextColor="#666" // iOS-specific dull text fix
              />
            </View>

            {/* Get OTP Button */}
            <TouchableOpacity
              style={{
                backgroundColor:
                  phoneNumber.length === 10 ? "#9D57FF" : "#D1D5DB",
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
              onPress={handleGetOtp}
              disabled={loading}
            >
              <Text
                style={{ color: "white", fontWeight: "600", fontSize: 18 }}
              >
                {loading ? "Please wait..." : "Get OTP"}
              </Text>
            </TouchableOpacity>

            {/* Gradient Line */}
            <View
              style={{
                flexDirection: "row",
                height: 1,
                marginTop: 60,
                marginBottom: 50,
                borderRadius: 1,
              }}
            >
              <LinearGradient
                colors={["transparent", "#666666", "transparent"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                  width: "95%",
                  height: 0.5,
                }}
              />
            </View>

            {/* Legal Text */}
            <View
              style={{
                borderTopColor: "#eee",
                marginBottom: 10,
                paddingTop: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 16, color: "#B5B5B5", textAlign: "center" }}
              >
                By Signing in, I accept the
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  textAlign: "center",
                  color: "#B5B5B5",
                  marginTop: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    textDecorationLine: "underline",
                    textDecorationColor: "#000000",
                    color: "#000000",
                  }}
                  onPress={() => setShowTerms(true)}
                >
                  Terms & Conditions
                </Text>{" "}
                and{" "}
                <Text
                  style={{
                    fontSize: 17,
                    color: "#000000",
                    textDecorationLine: "underline",
                    textDecorationColor: "#000000",
                  }}
                  onPress={() => setShowPrivacy(true)}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Modals */}
        <LegalModal
          visible={showPrivacy}
          onClose={() => setShowPrivacy(false)}
          title="Privacy Policy"
          lastUpdated="August 18, 2023"
          content={privacyContent}
          animationType="slide"
          transparent={true}
        />
        <LegalModal
          visible={showTerms}
          onClose={() => setShowTerms(false)}
          title="Terms of Service"
          lastUpdated="August 18, 2023"
          content={termsContent}
          animationType="slide"
          transparent={true}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
