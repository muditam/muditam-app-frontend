import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"; // You can change to other icon packs

const data = [
  {
    month: "Month 1",
    description: "Improve digestion & cleanse body",
    icon: "leaf",
  },
  {
    month: "Month 2",
    description: "Boost energy & control sugar dips",
    icon: "bolt",
  },
  {
    month: "Month 3",
    description: "Begin sugar control & insulin support",
    icon: "medkit",
  },
  {
    month: "Month 4",
    description: "Support liver & enhance insulin function",
    icon: "flask",
  },
  {
    month: "Month 5",
    description: "Improve HbA1c & repair internally",
    icon: "heartbeat",
  },
  {
    month: "Month 6",
    description: "Maintain sugar balance & protect organs",
    icon: "shield-alt",
  },
];

export default function Result() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Start Seeing Results From 1st Month</Text>
      <View style={styles.timeline}>
        {data.map((item, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.circle}>
              <FontAwesome5 name={item.icon} size={12} color="#000" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.month}>{item.month}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            {index !== data.length - 1 && <View style={styles.arrowLine} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#000",
    fontFamily: "Poppins",
  },
  timeline: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 30,
    position: "relative",
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
  },
  month: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
    fontFamily: "Poppins",
  },
  description: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
    fontFamily: "Poppins",
  },
  arrowLine: {
    position: "absolute",
    top: 32,
    left: 13,
    width: 2,
    height: 30,
    backgroundColor: "#000",
  },
});
