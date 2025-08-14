import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
  Platform,
  Share,
  Alert,
} from "react-native";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const { height, width } = Dimensions.get("window");

export default function VideoFeedItem({ video, isActive }) {
  const videoRef = useRef(null);
  const [userPhone, setUserPhone] = useState(null);
  const [likedStatus, setLikedStatus] = useState(null);
  const router = useRouter();
  const [backingOut, setBackingOut] = useState(false); // Prevent double back

  // Unmount-safe flag
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    // Guard all video API calls with try/catch and isMounted
    if (isActive && videoRef.current) {
      videoRef.current.playAsync?.().catch(() => { });
    } else if (videoRef.current) {
      videoRef.current.pauseAsync?.().catch(() => { });
    }
    return () => {
      videoRef.current?.stopAsync?.().catch(() => { });
    };
  }, [isActive]);

  useEffect(() => {
    let canceled = false;
    const fetchUserPhoneAndFeedback = async () => {
      try {
        const phone = await AsyncStorage.getItem("userPhone");
        if (phone && !canceled && isMounted.current) {
          setUserPhone(phone);
          const res = await axios.get(
            `https://muditam-app-backend-6a867f82b8dc.herokuapp.com/api/user/video-feedback/${phone}`
          );
          if (!canceled && isMounted.current) {
            const existing = res.data.likedVideos.find((v) => v.videoId === video);
            setLikedStatus(existing?.status || null);
          }
        }
      } catch (err) {
        if (__DEV__) console.error("Failed to fetch feedback", err);
      }
    };
    fetchUserPhoneAndFeedback();
    return () => { canceled = true; };
  }, [video]);

  const handleFeedback = async (action) => {
    if (!userPhone) return Alert.alert("Error", "User not logged in");
    try {
      await axios.post(
        "https://muditam-app-backend-6a867f82b8dc.herokuapp.com/api/user/video-feedback",
        {
          phone: userPhone,
          videoId: video,
          action,
        }
      );
      if (isMounted.current) setLikedStatus(action);
    } catch (err) {
      Alert.alert("Error", "Failed to update feedback");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out this video: ${video}` });
    } catch (error) {
      if (__DEV__) console.error("Error sharing", error);
    }
  };

  const handleBack = async () => {
    if (backingOut) return;
    setBackingOut(true);

    try {
      await videoRef.current?.pauseAsync?.();
      await videoRef.current?.stopAsync?.();
    } catch (e) { }

    setTimeout(() => {
      try {
        router.back();
      } catch (err) { 
        router.replace("/");
      }
      setBackingOut(false);
    }, 120);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: video }}
        style={styles.video}
        resizeMode="cover"
        isLooping
        removeClippedSubviews
        useNativeControls={false}
        shouldPlay={false}
      />

      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleFeedback("like")}
        >
          <Ionicons
            name={likedStatus === "like" ? "thumbs-up" : "thumbs-up-outline"}
            size={34}
            color="#fff"
          />
          <Text style={styles.iconLabel}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={34} color="#fff" />
          <Text style={styles.iconLabel}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height, width, backgroundColor: "black", paddingVertical: 25 },
  video: { position: "absolute", height: height, width },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 6,
    zIndex: 20,
  },
  iconContainer: {
    position: "absolute",
    right: 16,
    bottom: Platform.OS === "android" ? 150 : 98,
    alignItems: "center",
  },
  iconButton: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 2,
  },
});
