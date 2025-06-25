import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputs = useRef([]);
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  const isOtpComplete = otp.every((digit) => digit !== "");

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
      Alert.alert("Incomplete OTP", "Please enter all 6 digits.");
      return;
    }
    try {
      const response = await fetch(`https://muditam-app-backend.onrender.com/api/user/${phone}`);
      console.log("Fetch status:", response.status);
      const text = await response.text();
      console.log("Response text:", text);

      if (response.status === 200) {
        const userData = JSON.parse(text);
        await AsyncStorage.setItem("userDetails", JSON.stringify(userData));
        router.replace("/home");
      } else if (response.status === 404) {
        router.replace({ pathname: "/details", params: { phone } });
      } else {
        Alert.alert("Error", "Unexpected response from server.");
      }
    } catch (error) {
      console.error("Verify user failed:", error);
      Alert.alert("Error", "Failed to verify user. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Background Image */}
          <Image
            source={{
              uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/d1a366891736a5373bf01cd3edc35f9703dc4ae5.png?v=1747125024",
            }}
            style={{ width: "100%", height: 460 }}
            resizeMode="cover"
          />

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.replace("/login")}
            style={{
              position: "absolute",
              top: 10,
              left: 16,
              backgroundColor: "white",
              borderRadius: 999, // perfect circle
              padding: 6,
              zIndex: 10,
            }}
          >
            <Image
              source={{
                uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Group_23.png?v=1747130916",
              }}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Card */}
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
            }}
          >
            {/* Title */}
            <Text
              style={{
                fontFamily: "Poppins",
                fontWeight: "bold",
                fontSize: 26,
                textAlign: "left",
                marginBottom: 30,
              }}
            >
              Enter OTP
            </Text>

            {/* OTP Boxes */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputs.current[index] = ref)}
                  style={{
                    width: 49,
                    height: 47,
                    borderWidth: 0.9,
                    textAlign: "center",
                    fontSize: 18,
                    borderRadius: 6,
                  }}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                />
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              disabled={!isOtpComplete}
              style={{
                backgroundColor: isOtpComplete ? "#9D57FF" : "#D1D5DB",
                paddingVertical: 14,
                marginTop: 20,
                borderRadius: 10,
                alignItems: "center",
              }}
              onPress={handleSubmitOtp}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>
                Submit
              </Text>
            </TouchableOpacity>

            {/* Resend Section */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 25,
              }}
            >
              <Text style={{ color: "#9CA3AF", fontSize: 16 }}>
                Resend OTP in{" "}
                <Text style={{ color: "#9CA3AF", fontWeight: "bold" }}>
                  {timer > 0 ? `${timer} sec` : "0 sec"}
                </Text>
              </Text>
              <TouchableOpacity
                disabled={timer > 0}
                onPress={() => setTimer(10)}
              >
                <Text
                  style={{
                    fontSize: 16,
                    textDecorationLine: "underline",
                    textDecorationColor: "#A855F7",
                    fontWeight: "bold",
                    color: timer === 0 ? "#A855F7" : "#ccc",
                    marginLeft: 8,
                  }}
                >
                  Resend
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider Line */}
            <View
              style={{
                flexDirection: "row",
                height: 1,
                marginTop: 40,
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

            {/* Trusted Line */}
            <View
              style={{
                borderTopColor: "#eee",
                marginBottom: 40,
                paddingTop: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="people-outline"
                  size={23}
                  color="black"
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontSize: 16 }}>
                  Trusted by 50,000+ Happy Users
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
