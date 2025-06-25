import React from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";


const features = [
  "Triwellness Approach",
  "Root-Cause Healing",
  "Natural & Safe Supplements",
  "Personalization Solution",
  "Constant Expert Support",
  "Focus on Long - Term Solution",
  "Safe for Long - Term Use",
  "No Side Effects",
  "Regular Follow Ups",
];


export default function FeaturesComparison() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.column}>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Feature</Text>
          </View>
          {features.map((feature, idx) => (
            <View key={idx} style={styles.cell}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>


        <View style={[styles.column, styles.highlightedColumn]}>
          <View style={[styles.headerCell, styles.highlightedHeader]}>
            <Text style={[styles.headerText, styles.highlightedHeaderText]}>
              Diabetes Management with Muditam
            </Text>
          </View>
          {features.map((_, idx) => (
            <View key={idx} style={styles.cell}>
              <Image
                source={{
                  uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Checkmark_1.png?v=1747293655",
                }}
                style={{ width: 30, height: 30 }}
              />
            </View>
          ))}
        </View>


        <View style={styles.column}>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Other Solutions</Text>
          </View>
          {features.map((_, idx) => (
            <View key={idx} style={styles.cell}>
              <Image
                source={{
                  uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Unavailable.png?v=1747293655",
                }}
                style={{ width: 30, height: 30 }}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
  },
  column: {
    flex: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  highlightedColumn: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
      borderTopLeftRadius: 22,
  borderTopRightRadius: 22,
  overflow: "hidden",
  },


  headerCell: {
    height: 60,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },


  headerText: {
    fontWeight: "700",
    fontSize: 13,
    color: "#3A3A3A",
    textAlign: "center",
  },
  highlightedHeader: {
    backgroundColor: "#fff",
  },
  highlightedHeaderText: {
    textAlign: "center",
  },
  cell: {
    height: 50,
    paddingHorizontal:10,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  featureText: {
    fontSize: 13,
    color: "#626262",
    lineHeight:20
  },
});



