import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";


export default function RetakeQuizBox() {
  const router = useRouter();


  const handleRetakeQuiz = async () => {
    try {
      const userDetails = await AsyncStorage.getItem("userDetails");
      const phone = JSON.parse(userDetails || "{}")?.phone;


      if (!phone) {
        alert("User not logged in.");
        return;
      }


      router.push("/test");
    } catch (error) {
      console.error("Error starting quiz again:", error);
      alert("Something went wrong. Please try again.");
    }
  };


  return (
    <LinearGradient colors={["#9D57FF", "#543087"]} style={styles.container}>
      <View style={styles.contentRow}>
        {/* Left Content */}
        <View style={styles.textContainer}>
          <Text style={styles.heading}>Not completely sure?</Text>
          <Text style={styles.subtext}>
            If you’ve left something or want{"\n"}to update a response on the
            {"\n"}diabetes test, simply re-take it.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleRetakeQuiz}>
            <Text style={styles.buttonText}>Take The Diabetes Quiz Again</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{
                    uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/2_7.png?v=1752647932",
                  }}
          style={styles.image} 
          resizeMode="cover"
        />
      </View>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 20,
    elevation: 3,
    fontFamily: Platform.OS === "ios" ? "Poppins" : "System",
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    paddingLeft: 12,
  },
  heading: {
    color: "white",
    fontSize: Platform.OS === "ios" ? 20 : 18,
    fontWeight: "600",
    textAlign: "left",
    marginTop: 10,
  },
  subtext: {
    color: "white",
    // fontSize: 13,
    fontSize: Platform.OS === "ios" ? 13 : 12,
    lineHeight: 16,
    marginBottom: 12,
    textAlign: "left",
  },
  button: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  buttonText: {
    color: "#543287",
    fontSize: Platform.OS === "ios" ? 14 : 13,
    fontWeight: "500",
  },
  image: {
    width: 90,
    height: Platform.OS === "android" ? "90%" : "100%",
    bottom: 0,
    right: Platform.OS === "ios" ? 16 : 12,
    paddingTop: 16,
    bottom: Platform.OS === "ios" ? 0 : -14,
  },
});



