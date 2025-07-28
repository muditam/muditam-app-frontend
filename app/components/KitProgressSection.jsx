import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";


const TOTAL_KITS = 5;

 
const kitDescriptions = {
  1: {
    title: "Start Your Journey",
    desc: "Cleanse and prepare your body with herbs that support insulin sensitivity.",
  },
  2: {
    title: "Improving blood sugar level, Control HbA1c",
    desc: "Using ingredients like karela, jamun, neem we will control high sugar level and prevent...",
  },
  3: {
    title: "Reverse Symptoms",
    desc: "Improve pancreas function and reduce dependence on medication.",
  },
  4: {
    title: "Stabilize & Prevent Relapse",
    desc: "Continue progress and stabilize sugar levels long-term.",
  },
  5: {
    title: "Maintain Good Health",
    desc: "Support healthy lifestyle and long-term diabetes control.",
  },
};


export default function KitProgressSection({
  currentKit = 2,
  completedKits = [],
}) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={[styles.header, { color: "#000" }]}>
        Visible Results Will Take {TOTAL_KITS} Kits
      </Text>
      <Text style={[styles.subtext, { color: "#4E4E4E" }]}>
        You are on kit number {currentKit}.
      </Text>
      <Text style={[styles.subtext, { color: "#4E4E4E", marginBottom: 8 }]}>
        Use complete recommended kit for best results.
      </Text>
      <LinearGradient
        colors={["#9D57FF", "#543087"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientContainer}
      >
        <Text style={styles.header}>
          Visible Results Will Take {TOTAL_KITS} Kits
        </Text>
        <Text style={styles.subtext}>You are on kit number {currentKit}.</Text>
        <Text style={styles.subtext}>
          Use complete recommended kit for best results.
        </Text>


        {/* Current Kit */}
        <View style={[styles.kitCard, styles.currentKit]}>
          <View style={styles.cardHeader}>
            <Text style={styles.kitTitle}>Kit {currentKit}</Text>
            <View style={styles.currentBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.currentText}>CURRENT</Text>
            </View>
          </View>
          <Text style={styles.kitDescTitle}>
            {kitDescriptions[currentKit]?.title}
          </Text>
          <Text style={styles.kitDesc}>
            {kitDescriptions[currentKit]?.desc}
          </Text>
        </View>


        {/* All Kits Scrollable */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kitsRow}
        >
          {Array.from({ length: TOTAL_KITS }, (_, i) => {
            const kitNum = i + 1;
            if (kitNum === currentKit) return null;


            const isCompleted = completedKits.includes(kitNum) || kitNum < currentKit;
            return (
              <View key={kitNum} style={styles.kitMiniCard}>
                <View style={styles.kitMiniHeader}>
                  <Text style={styles.kitMiniTitle}>Kit {kitNum}</Text>
                  {isCompleted && (
                    <Ionicons name="checkmark-circle" size={18} color="green" />
                  )}
                </View>
                <Text style={styles.kitMiniDesc}>
                  {kitDescriptions[kitNum]?.title}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  gradientContainer: {
    paddingVertical: 16,
    marginTop: 15,
    paddingTop: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "500",
    color: "white",
    marginBottom: 8,
    lineHeight: 30,
    paddingHorizontal: 16,
  },
  subtext: {
    fontSize: 14,
    color: "white",
    marginBottom: 2,
    lineHeight: 20,
    marginHorizontal: 16,
  },
  subHeader: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
  currentKit: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginBottom: 20,
    paddingRight: 30,
    marginHorizontal: 16,
  },
  kitCard: {
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kitTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#000",
  },
  kitDescTitle: {
    fontSize: 16,
    color: "#2B2B2B",
    marginTop: 6,
  },
  kitDesc: {
    fontSize: 14,
    color: "#6D6D6D",
    marginTop: 4,
    lineHeight: 25,
  },
  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  greenDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#03AD31",
    marginRight: 4,
  },
  currentText: {
    color: "#03AD31",
    fontSize: 14,
    fontWeight: "500",
  },
  kitsRow: {
    paddingRight: 8,
    paddingHorizontal: 16,
  },
  kitMiniCard: {
    width: 150,
    height: 160,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kitMiniHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kitMiniTitle: {
    fontSize: 19,
    fontWeight: "500",
    color: "#000",
  },
  kitMiniDesc: {
    fontSize: 16,
    marginTop: 8,
    lineHeight: 20,
    color: "#2B2B2B",
    width: 100,
  },
});

