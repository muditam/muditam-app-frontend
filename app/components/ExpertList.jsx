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
    name: "Dt. Mansvi Ahuja",
    qualifications: "M.Sc. (Clinical Nutrition & Dietetics), CDE",
    patientsTreated: "Expert in Complex Diabetes Cases, | 2500+ Treated",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mansvi_Ahuja-3.jpg?v=1752234951", 
  },
  {
    name: "Dt. Deepti Gupta",
    qualifications: "M.Sc. (Dietetics & FSM)",
    patientsTreated: "Specialised in Long-Term Diabetes Outcomes | 2500+ Treated",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Deepti_Gupta.jpg?v=1752042232",
  },
  {
    name: "Dt. Asha Kaushik",
    qualifications: "M.Sc. (Food and Nutrition)",
    patientsTreated: "Managed 1500+ Diabetes Cases Successfully",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Asha_Kaushik_dcfbef6c-11ee-4a37-9189-3ea8955171e7.jpg?v=1752234951",
  },
  {
    name: "Dt. Kunal Singh",
    qualifications: "M.Sc. (Nutrition & Dietetics)",
    patientsTreated: "Known for fastest patient outcomes | 2500+ Treated",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Kunal_Choudhary_a718d502-b654-4bff-84d4-cbaee1d01994.jpg?v=1752042232",
  },
  {
    name: "Dt. Devanshi Priyanka",
    qualifications: "B. Tech (Biotechnology)",
    patientsTreated: "Turned around uncontrolled cases in 3 months",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Devanshi_Priyanka_28446acf-4095-44bd-a6ce-f1f12ba0e6b2.jpg?v=1752042233",
  },
  {
    name: "Dt. Sidra Qaseem",
    qualifications: "M.Sc. (Dietetics and FSM)",
    patientsTreated: "Guided 2000+ Patients Toward Sustainable Outcomes",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Sidra_Qaseem.jpg?v=1752042232",
  },
  {
    name: "Dt. Sonal Dubey",
    qualifications: "M.Sc. (Nutrition & Dietetics)",
    patientsTreated: "Expert in Metabolic & Lifestyle Disorders",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Sonal_Dubey_f0292e10-2ac2-4d92-8741-4620f2543ce2.jpg?v=1752042232",
  },
  {
    name: "Dt. Saloni",
    qualifications: "M.Sc (Clinical Nutrition), CDE",
    patientsTreated: "91% success rate in sugar control",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Saloni_Kumari.jpg?v=1752042233",
  },
  {
    name: "Dt. Afrin Rifat",
    qualifications: "M.Sc. (Nutrition & Dietetics)",
    patientsTreated: "Precision plans for lifestyle-linked diabetes",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Afrin_Rifat.jpg?v=1752042232",
  },
  {
    name: "Dt. Diksha Deepak",
    qualifications: "M.Sc. (Food and Nutrition)",
    patientsTreated: "Blends Clinical Knowledge with Real-World Diets",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Diksha_Deepak.jpg?v=1752234952", 
  },
  {
    name: "Dt. Kritika Khatoor",
    qualifications: "PGD (Dietetics and PHN), CNCC",
    patientsTreated: "Expert in herb-food-sugar balance",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Kritika_Khator.jpg?v=1752042232",
  },
  {
    name: "Dt. Sahajpreet",
    qualifications: "PGD (Dietetics and PHN)",
    patientsTreated: "Recommends high-impact home remedies",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Sahajpreet_Kaur.jpg?v=1752042233",
  },
  {
    name: "Dt. Mohini Saini",
    qualifications: "B.Sc. (Clinical Nutrition & Dietetics)",
    patientsTreated: "Helped 570+ patients control sugar",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mohini_Saini.jpg?v=1752042232",
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
              "Every Body is Unique, So Is Our Care"
            </Text>
            <Text style={styles.subHeaderText}>
              Every member of our team is handpicked for their clinical expertise and proven results in managing Diabetes and related conditions. 
              We don’t just give advice — we guide real transformations through personalized, root-cause-based care.
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
    width: 180,
    lineHeight: 20,
  },
  avatar: {
    height: 90,
    width: 90,
    borderRadius: 45,
  },
});
