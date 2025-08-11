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
  Keyboard,
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
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

  const fullOtp = otp.join("");

  // Handle test number override
  if (phone === "1234567890" && fullOtp === "098765") {
    const userRes = await fetch(`https://muditam-app-backend.onrender.com/api/user/${phone}`); 
    const userText = await userRes.text();

    if (userRes.status === 200) {
      const userData = JSON.parse(userText);
      await AsyncStorage.setItem("userDetails", JSON.stringify(userData));
      router.replace("/home");
    } else if (userRes.status === 404) {
      router.replace({ pathname: "/details", params: { phone } });
    } else {
      Alert.alert("Error", "Unexpected server response.");
    }
    return;
  }

  // Regular verification
  try {
    const response = await fetch(`https://control.msg91.com/api/v5/otp/verify?otp=${fullOtp}&mobile=91${phone}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authkey: "451604A8TTLksfVyk06825bdc5P1",
      },
    });

    const data = await response.json();
    console.log("OTP verify response:", data);

    if (data.type === "success") {
      const userRes = await fetch(`https://muditam-app-backend.onrender.com/api/user/${phone}`);
      const userText = await userRes.text();

      if (userRes.status === 200) {
        const userData = JSON.parse(userText);
        await AsyncStorage.setItem("userDetails", JSON.stringify(userData));
        router.replace("/home");
      } else if (userRes.status === 404) {
        router.replace({ pathname: "/details", params: { phone } });
      } else {
        Alert.alert("Error", "Unexpected server response.");
      }
    } else {
      Alert.alert("Invalid OTP", data.message || "Please try again.");
    }
  } catch (error) {
    console.error("OTP verification failed:", error);
    Alert.alert("Error", "Verification failed. Please try again.");
  }
};


  const handleResend = async () => {
  setOtp(Array(6).fill(""));
  inputs.current[0].focus();
  setTimer(10);

  try {
    const response = await fetch("https://control.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: "451604A8TTLksfVyk06825bdc5P1",
      },
      body: JSON.stringify({
        mobile: `91${phone}`,
        sender: "MUDITM",
        template_id: "6883510ad6fc0533183824b2",
        otp_length: "6",
        otp_expiry: "10"
      }),
    });

    const data = await response.json();
    if (data.type !== "success") {
      Alert.alert("Failed to resend OTP");
    }
  } catch (err) {
    console.error("Resend OTP error:", err);
    Alert.alert("Error", "Couldn't resend OTP");
  }
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} 
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-start",
          }}
          keyboardShouldPersistTaps="handled" 
        >
          <Image
            source={{
              uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/2_1_eb3f1b3c-1df9-4942-99b2-f001de984ddb.png?v=1751978207",
            }}
            style={{ width: "100%", height: 430 }}
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
              borderRadius: 999,
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
              marginTop: isKeyboardVisible ? -260 : -180,
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
                    width: 47,
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
                  onFocus={() => setKeyboardVisible(true)}
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
              <Text
                style={{ color: "white", fontWeight: "600", fontSize: 18 }}
              >
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
                <Text style={{ fontWeight: "bold" }}>
                  {timer > 0 ? `${timer} sec` : "0 sec"}
                </Text>
              </Text>
              <TouchableOpacity disabled={timer > 0} onPress={handleResend}>
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
 