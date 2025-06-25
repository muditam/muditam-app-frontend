import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";


const { width } = Dimensions.get("window");


const icons = [
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Start Seeing Results From 1st Month</Text>
        <View style={styles.timeline}>
          {icons.map((item, index) => (
            <View key={index} style={styles.stepContainer}>
              {index !== 0 && (
                <View style={styles.arrowContainer}>
                  <View style={styles.arrowLine} />
                  <View style={styles.arrowHeadOutline} />
                </View>
              )}


              {/* {index !== 0 && <View style={styles.verticalLine} />} */}


              <View style={styles.circle}>
                <FontAwesome5 name={item.icon} size={24} color="#000"/>
              </View>


              <View style={styles.textContainer}>
                <Text style={styles.month}>{item.month}</Text>
                <Text style={styles.description}>{item.description}</Text>
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
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  heading: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 24,
    color: "#000",
    fontFamily: "Poppins",
  },
  timeline: {
    position: "relative",
    paddingLeft: 16,
  },
  stepContainer: {
    marginBottom: 50,
    position: "relative",
  },
  verticalLine: {
    position: "absolute",
    width: 1.5,
    height: 44,
    backgroundColor: "#000",
    left: 3,
    top: -43,
  },
  arrowContainer: {
    position: "absolute",
    left: -1,
    top: -50,
    alignItems: "center",
  },
  arrowLine: {
    width: 1.5,
    height: 41,
    backgroundColor: "#000",
  },
  arrowHeadOutline: {
    width: 10,
    height: 10,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#000",
    transform: [{ rotate: "312deg" }],
    backgroundColor: "transparent",
    marginTop: -9,
    right: 0.3,
  },


  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: -18,
    top: 4,
    zIndex: 2,
  },
  textContainer: {
    paddingLeft: 40,
  },
  month: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
    marginBottom: 2,
  },
  description: {
    fontSize: 15,
    lineHeight: 20,
  },
});



