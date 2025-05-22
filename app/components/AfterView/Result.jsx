import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";


const icons = [
  {
    name: "rocket",
    month: "Month 1",
    description: "Get instant\naccess to get\nthe",
  },
  {
    name: "heartbeat",
    month: "Month 2",
    description: "Track sugar\nlevels & improve",
  },
  {
    name: "apple-alt",
    month: "Month 3",
    description: "Diet & lifestyle\nrefinements",
  },
  {
    name: "smile",
    month: "Month 4",
    description: "Feel more\nenergized daily",
  },
  { name: "leaf", month: "Month 5", description: "Herbs show\nvisible impact" },
  {
    name: "check-circle",
    month: "Month 6",
    description: "Long-term\nstability achieved",
  },
];


const ITEM_WIDTH = 130;
const DOT_SIZE = 10;


export default function Result() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Start seeing results from 1st month</Text>


      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.timelineContainer}>
          <View style={styles.iconRow}>
            {icons.map((item, index) => (
              <View key={index} style={styles.iconWrapper}>
                <View style={styles.circle}>
                  <FontAwesome5 name={item.name} size={20} color="#000" />
                </View>
              </View>
            ))}
          </View>


          <View style={styles.lineContainer}>
            <View
              style={[
                styles.line,
                {
                  width: ITEM_WIDTH * (icons.length - 1),
                  left: ITEM_WIDTH / 2,
                },
              ]}
            />
            {icons.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { left: index * ITEM_WIDTH + ITEM_WIDTH / 2 - DOT_SIZE / 2 },
                ]}
              />
            ))}
          </View>


          <View style={{ flexDirection: "start" }}>
            <View style={styles.labelRow}>
              {icons.map((item, index) => (
                <View key={index} style={styles.labelWrapper}>
                  <Text style={styles.monthText}>{item.month}</Text>
                  <Text style={styles.descriptionText}>{item.description}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAF6FF",
    paddingTop: 30,
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 20,
    paddingLeft: 16,
    color: "#000",
  },
  timelineContainer: {
    position: "relative",
    flexDirection: "column",
    width: ITEM_WIDTH * icons.length,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iconWrapper: {
    alignItems: "center",
    width: ITEM_WIDTH,
  },
  circle: {
    width: 47,
    height: 47,
    borderRadius: 47 / 2,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "black",
    borderWidth: 1,
  },
  lineContainer: {
    position: "relative",
    height: 20,
    marginBottom: 20,
    width: "100%",
    justifyContent: "center",
  },
  line: {
    height: 1,
    backgroundColor: "#543087",
    position: "absolute",
    top: 14,
  },
  dot: {
    position: "absolute",
    top: 10,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: "#543087",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labelWrapper: {
    width: ITEM_WIDTH,
    paddingLeft: 40,
  },
  monthText: {
    fontWeight: "500",
    fontSize: 16,
    color: "#000",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    color: "#000000",
    lineHeight: 16,
    marginBottom: 20,
  },
});



