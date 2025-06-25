// VideoFeedItem.js (Updated Frontend Component)
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

const { height, width } = Dimensions.get("window");

export default function VideoFeedItem({ video, onBack, isActive }) {
  const videoRef = useRef(null);
  const [userPhone, setUserPhone] = useState(null);
  const [likedStatus, setLikedStatus] = useState(null); 

  useEffect(() => {
    if (isActive) {
      videoRef.current?.playAsync();
    } else {
      videoRef.current?.pauseAsync();
    }
  }, [isActive]);

  useEffect(() => {
    const fetchUserPhoneAndFeedback = async () => {
      try {
        const phone = await AsyncStorage.getItem("userPhone");
        if (phone) {
          setUserPhone(phone);
          const res = await axios.get(`https://muditam-app-backend.onrender.com/api/user/video-feedback/${phone}`);
          const existing = res.data.likedVideos.find((v) => v.videoId === video);
          setLikedStatus(existing?.status || null);
        }
      } catch (err) {
        console.error("Failed to fetch feedback", err);
      }
    };

    fetchUserPhoneAndFeedback();
  }, [video]);

  const handleFeedback = async (action) => {
    if (!userPhone) return Alert.alert("Error", "User not logged in");

    try {
      await axios.post("https://muditam-app-backend.onrender.com/api/user/video-feedback", {
        phone: userPhone,
        videoId: video,
        action,
      });
      setLikedStatus(action);
    } catch (err) {
      Alert.alert("Error", "Failed to update feedback");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out this video: ${video}` });
    } catch (error) {
      console.error("Error sharing", error);
    }
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

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleFeedback('like')}>
          <Ionicons
            name={likedStatus === 'like' ? 'thumbs-up' : 'thumbs-up-outline'}
            size={34}
            color="#fff"
          />
          <Text style={styles.iconLabel}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => handleFeedback('dislike')}>
          <Ionicons
            name={likedStatus === 'dislike' ? 'thumbs-down' : 'thumbs-down-outline'}
            size={34}
            color="#fff"
          />
          <Text style={styles.iconLabel}>Dislike</Text>
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
