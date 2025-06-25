import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const expertsData = [
  {
    name: "Dr. John Doe",
    qualifications: "MBBS, MD (Endocrinology)",
    patientsTreated: "Has treated 5000 diabetic patients",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_3.png?v=1747143071",
  },
  {
    name: "Dr. Jane Smith",
    qualifications: "MBBS, PhD (Nutrition)",
    patientsTreated: "Has treated 6000 diabetic patients",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_4.png?v=1747143072",
  },
  {
    name: "Dr. John Doe",
    qualifications: "MBBS, MD (Endocrinology)",
    patientsTreated: "Has treated 5000 diabetic patients",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_3.png?v=1747143071",
  },
  {
    name: "Dr. Jane Smith",
    qualifications: "MBBS, PhD (Nutrition)",
    patientsTreated: "Has treated 6000 diabetic patients",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_4.png?v=1747143072",
  },
];
const dietitianTitle = `Head of Dietitian - \nMuditam Ayurveda`;

export default function ExpertList() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={26} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerText}>
              "Every body is different, so is our care"
            </Text>
            <Text style={styles.subHeaderText}>
              My team of experienced diabetologists and advisors guide you through
              every step of your sugar control journey, and support your progress.
            </Text>
          </View>

          <View style={styles.dietitianInfo}>
            <Text style={styles.dietitianName}>Dt. Mansvi Ahuja</Text>
            <Text style={styles.dietitianTitle}>{dietitianTitle}</Text>
          </View>
        </View>

        {/* Divider outside the padding */}
        <View style={styles.divider} />

        <View style={styles.content}>
          <View style={styles.expertList}>
            {expertsData.map((expert, index) => (
              <View key={index} style={styles.expertCard}>
                <View style={styles.expertInfo}>
                  <View style={styles.expertText}>
                    <Text style={styles.expertName}>{expert.name}</Text>
                    <Text style={styles.expertQualifications}>
                      {expert.qualifications}
                    </Text>
                    <Text style={styles.expertPatients}>
                      {expert.patientsTreated}
                    </Text>
                  </View>
                  <Image source={{ uri: expert.avatar }} style={styles.avatar} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    backgroundColor: "#F6F6F6",
  },
  header: {
    marginBottom: 20,
    width: "100%",
  },
  backButton: {
    marginTop: 8,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  headerText: {
    fontSize: 26,
    fontWeight: "600",
    marginTop: 24,
  },
  subHeaderText: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 8,
    lineHeight: 20,
  },
  dietitianInfo: {
    marginTop: 20,
    marginBottom: 8,
  },
  dietitianName: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  dietitianTitle: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 40,
    lineHeight: 20,
  },
  divider: {
    height: 16,
    backgroundColor: "black",
    width: "100%",
    marginVertical: 8,
  },
  expertList: {
    width: "100%",
  },
  expertCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#ccc",
    borderRadius: 13,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  expertInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  expertText: {
    flex: 1,
    justifyContent: "center",
    marginRight: 10,
  },
  expertName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  expertQualifications: {
    fontSize: 14,
    fontWeight: "400",
    color: "#9E9E9E",
    marginTop: 2,
    marginBottom: 20,
  },
  expertPatients: {
    fontSize: 14,
    fontWeight: "400",
    width: 150,
    lineHeight: 20,
  },
  avatar: {
    height: 90,
    width: 90,
    borderRadius: 45,
  },
});
