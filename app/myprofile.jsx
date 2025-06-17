import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function MyProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState("diabetes");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("userDetails");
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load user details", e);
      }
    };
    loadUser();
  }, []);

  const diagnoses = [
    "Male Pattern Hair Loss, Stage-2",
    "Male Pattern Hair Loss, Stage-2",
    "Male Pattern Hair Loss, Stage-2",
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/me")}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Avatar + User Info */}

      <View style={styles.avatarWrapper}>
        <TouchableOpacity
          style={styles.editIcon}
          onPress={() => router.push("/editprofile")}
        >
          <Feather name="edit" size={20} color="black" />
        </TouchableOpacity>

        <View style={styles.avatarSection}>
          <View style={styles.avatarPlaceholder} />
          <Text style={styles.name}>{user?.name || "Guest"}</Text>
          <Text style={styles.ageGender}>
            {user?.yearOfBirth
              ? `${new Date().getFullYear() - user.yearOfBirth}, ${
                  user?.gender
                }`
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
          style={
            selectedTab === "diabetes" ? styles.activeTab : styles.inactiveTab
          }
          onPress={() => setSelectedTab("diabetes")}
        >
          <Text
            style={
              selectedTab === "diabetes"
                ? styles.activeTabText
                : styles.inactiveTabText
            }
          >
            My Diabetes Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={selectedTab === "diet" ? styles.activeTab : styles.inactiveTab}
          onPress={() => setSelectedTab("diet")}
        >
          <Text
            style={
              selectedTab === "diet"
                ? styles.activeTabText
                : styles.inactiveTabText
            }
          >
            My Diet Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {selectedTab === "diabetes" ? (
        <View style={styles.diagnosisSection}>
          {diagnoses.map((diag, index) => (
            <View key={index} style={{ marginVertical: 6 }}>
              <View style={styles.diagnosisHeader}>
                <View style={styles.diagnosisLabel}>
                  <Ionicons name="add-circle" size={26} color="#9D57FF" />
                  <Text style={styles.diagnosisLabelText}>
                    Current Diagnosis
                  </Text>
                </View>
              </View>
              <View style={styles.diagnosisCard}>
                <Text style={styles.diagnosisText}>{diag}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.dietProfileBox}>
          <Text style={{ fontSize: 14, fontWeight: "500", color: "#111827" }}>
            This is your diet profile.
          </Text>
        </View>
      )}

      {/* Delete Account */}
      <TouchableOpacity style={styles.deleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginLeft: 16,
  },

  avatarWrapper: {
    position: "relative",
    alignItems: "center",
    marginBottom: 24,
  },

  editIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 8,
    zIndex: 1,
  },

  avatarSection: {
    alignItems: "center",
  },

  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: "#D9D9D9",
    marginBottom: 10,
  },

  name: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
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
    marginVertical: 30,
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
    fontWeight: 500,
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

  deleteAccount: {
    alignSelf: "left",
    marginTop: 16,
  },
  deleteText: {
    color: "#FF5E5E",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});


