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
    <ScrollView vertical showsVerticalScrollIndicator={false}>
      <View style={{ padding: 16 }}>
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


      <View style={{ height: 16, backgroundColor: "black" }}></View>
      <View style={styles.container}>
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
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F6F6F6",
    height: "100%",
  },
  header: {
    marginBottom: 20,
    width: 300,
  },
  backButton: {
    top: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "600",
    marginTop: 40,
  },
  subHeaderText: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 8,
    lineHeight: 20,
  },
  dietitianInfo: {
    marginTop: 20,
    lineHeight: 20,
  },
  dietitianName: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 20,
  },
  dietitianTitle: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 40,
    lineHeight: 20,
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
    height: 120,
    width: 120,
    borderRadius: 69,
  },
});



