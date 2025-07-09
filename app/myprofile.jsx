import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function MyProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState("diabetes");
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("userDetails");
        if (stored) {
          const userObj = JSON.parse(stored);
          setUser(userObj);

          // Fetch quiz data
          if (userObj?.phone) {
            fetchQuiz(userObj.phone);
          }
        }
      } catch (e) {
        console.error("Failed to load user details", e);
      }
    };
    loadUser();
  }, []);

  const fetchQuiz = async (phone) => {
    setQuizLoading(true);
    try {
      // Replace with your API base URL
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL || "https://your.api.url"}/quiz/${phone}`
      );
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      } else {
        setQuiz(null); // quiz not found
      }
    } catch (e) {
      setQuiz(null);
    }
    setQuizLoading(false);
  };

  // Calculate age if available
  const age =
    user?.yearOfBirth && !isNaN(user.yearOfBirth)
      ? new Date().getFullYear() - user.yearOfBirth
      : "";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/me")}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* Avatar + Edit Icon */}
        <View style={styles.avatarWrapper}>
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => router.push("/editprofile")}
          >
            <Feather name="edit" size={22} color="black" />
          </TouchableOpacity>

          <View style={styles.avatarSection}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.profileImage}
                onError={() => console.warn("Failed to load avatar:", user.avatar)}
              />
            ) : (
              <Image
                source={{
                  uri:
                    user?.gender === "Male"
                      ? "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Male.png?v=1750153759"
                      : "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Female_8b0512eb-3582-4d53-9609-4924bd169c3a.png?v=1750153759",
                }}
                style={styles.profileImage}
              />
            )}
            <Text style={styles.name}>{user?.name || "Guest"}</Text>
            <Text style={styles.ageGender}>
              {user?.yearOfBirth
                ? `${new Date().getFullYear() - user.yearOfBirth}, ${user?.gender}`
                : ""}
            </Text>
          </View>
        </View>

        {/* Info Boxes */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email ID</Text>
            <Text style={styles.infoValue}>{user?.email || "-"}</Text>
          </View>
        </View>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone No.</Text>
            <Text style={styles.infoValue}>+91{user?.phone || "-"}</Text>
          </View>
        </View>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Preferred Language</Text>
            <Text style={styles.infoValue}>English</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={selectedTab === "diabetes" ? styles.activeTab : styles.inactiveTab}
            onPress={() => setSelectedTab("diabetes")}
          >
            <Text
              style={selectedTab === "diabetes" ? styles.activeTabText : styles.inactiveTabText}
            >
              My Diabetes Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={selectedTab === "diet" ? styles.activeTab : styles.inactiveTab}
            onPress={() => setSelectedTab("diet")}
          >
            <Text
              style={selectedTab === "diet" ? styles.activeTabText : styles.inactiveTabText}
            >
              My Diet Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {selectedTab === "diabetes" ? (
          <View style={styles.diagnosisSection}>
            {quizLoading ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : quiz ? (
              // Quiz found: show HBA1c etc.
              <View style={{ marginVertical: 6 }}>
                <View style={styles.diagnosisHeader}>
                  <View style={styles.diagnosisLabel}>
                    <Text style={styles.diagnosisLabelText}>
                      Your HBA1c Level
                    </Text>
                  </View>
                </View>
                <View style={styles.diagnosisCard}>
                  <Text style={styles.diagnosisText}>
                    {quiz.hba1c ? `HBA1c: ${quiz.hba1c}` : "Not Available"}
                  </Text>
                  {/* You can add more quiz details here */}
                </View>
              </View>
            ) : (
              // Quiz not found: show "Take Diabetic Quiz" button
              <TouchableOpacity
                style={{
                  marginVertical: 16,
                  padding: 16,
                  backgroundColor: "#9D57FF",
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={() => router.push("/test")}
              >
                <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                  Take Diabetic Quiz
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.dietProfileBox}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#111827", marginBottom: 18 }}>
              Connect with your health Expert
            </Text>
            <TouchableOpacity
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 6,
                backgroundColor: "#4F46E5",
              }}
              onPress={() => {
                // open support chat, call, etc.
                router.push("/connect-expert");
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                Connect Now
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginLeft: 8,
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: "center",
    position: "relative",
  },
  avatarPlaceholder: {
    width: 125,
    height: 125,
    borderRadius: 999,
    backgroundColor: "#D9D9D9",
  },
  profileImage: {
    width: 125,
    height: 125,
    borderRadius: 999,
    marginRight: 12,
    backgroundColor: "#fff",
  },
  editIcon: {
    position: "absolute",
    top: 0,
    right: -10,
    padding: 6,
    zIndex: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 8,
  },
  ageGender: {
    fontSize: 20,
  },
  infoBox: {
    backgroundColor: "#F4F4F4",
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabsRow: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "#F4F4F4",
    borderRadius: 50,
  },
  activeTab: {
    flex: 1,
    backgroundColor: "#252525",
    paddingVertical: 11,
    borderRadius: 50,
    marginRight: 8,
  },
  activeTabText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
  inactiveTab: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 50,
    marginRight: 8,
  },
  inactiveTabText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  diagnosisCard: {
    borderWidth: 0.5,
    borderColor: "#747474",
    borderRadius: 8,
    paddingLeft: 20,
    padding: 14,
    marginVertical: 8,
    backgroundColor: "#fff",
  },
  diagnosisHeader: {
    position: "absolute",
    top: -8,
    left: 20,
    zIndex: 1,
  },
  diagnosisLabel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    paddingRight: 10,
    paddingLeft: 2,
    borderRadius: 50,
  },
  diagnosisLabelText: {
    fontSize: 16,
    marginLeft: 3,
  },
  diagnosisText: {
    fontSize: 16,
    lineHeight: 30,
  },
  dietProfileBox: {
    marginVertical: 24,
    padding: 18,
    borderRadius: 8,
    backgroundColor: "#F9F9F9",
    alignItems: "center",
  },
  deleteAccount: {
    alignSelf: "flex-start",  
    marginTop: 16,
    marginBottom: 24,
    paddingLeft: 2,
  },
  deleteText: {
    color: "#FF5E5E",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
