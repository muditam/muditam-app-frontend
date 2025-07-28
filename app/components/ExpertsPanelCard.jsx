import { router, useNavigation } from "expo-router";
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from "react-native";

const expertImages = [
  "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Deepti_Gupta.jpg?v=1752042232",
  "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mansvi_Ahuja-3.jpg?v=1752234951",
  "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Asha_Kaushik_dcfbef6c-11ee-4a37-9189-3ea8955171e7.jpg?v=1752234951",
  "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Kunal_Choudhary_a718d502-b654-4bff-84d4-cbaee1d01994.jpg?v=1752042232",
  "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Devanshi_Priyanka_28446acf-4095-44bd-a6ce-f1f12ba0e6b2.jpg?v=1752042233",
  "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Sonal_Dubey_f0292e10-2ac2-4d92-8741-4620f2543ce2.jpg?v=1752042232",
  "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Sidra_Qaseem.jpg?v=1752042232",
  "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Saloni_Kumari.jpg?v=1752042233", 
  "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Kritika_Khator.jpg?v=1752042232",
  "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Sahajpreet_Kaur.jpg?v=1752042233",  
];

export default function ExpertsPanel() {
  const navigation = useNavigation();
  return (
    <View style={{ backgroundColor: "#F4F4F4F4" }}>
      <View style={styles.shadowWrapper}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Meet Muditam</Text>
              <Text style={styles.subtitle}>Experts Panel</Text>
            </View>
            <Pressable onPress={() => router.push("/components/ExpertList")}>
              <Image
                source={{
                  uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Next_page_7d5f8d57-b726-4b52-aeec-018b37d14684.png?v=1747143071",
                }}
                style={styles.arrow}
              />
            </Pressable>
          </View>

          <View style={styles.avatarGrid}>
            {expertImages.map((url, index) => (
              <Image key={index} source={{ uri: url }} style={styles.avatar} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  shadowWrapper: {
    marginHorizontal: 16,
    marginVertical:24,
    borderRadius: 20,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  card: {
    padding:14,
    borderRadius: 24,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal:16,
    marginTop:6
  },
  title: {
    fontSize: 24,
    fontWeight: "300",
    color: "#000",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "500",
    color: "#000",
  },
  arrow: {
    width: 50,
    height: 50,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    justifyContent: "space-between",
  },
  avatar: {
    width: 49,
    height: 49,
    borderRadius: 24,
    margin: 5,
  },
});



