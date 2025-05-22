



import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";


const RATINGS_DATA = [
  {
    brand: "Google",
    logo: "https://www.citypng.com/public/uploads/preview/google-logo-icon-gsuite-hd-701751694791470gzbayltphh.png",
    rating: 4.9,
  },
  {
    brand: "Muditam",
    logo: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Muditam.webp?v=1744890066",
    rating: 4.9,
  },
  {
    brand: "Amazon",
    logo: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Amazon_46a9086d-3c17-4de5-8583-c6076b7cac6a.webp?v=1744890090",
    rating: 4.8,
  },
];


export default function ReviewsRatings() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Reviews & ratings</Text>
      <View style={styles.row}>
        {RATINGS_DATA.map((item, index) => (
          <View
            key={index}
            style={[
              styles.card,
              index === 0 && { marginLeft: 16 },
              index === RATINGS_DATA.length - 1 && { marginRight: 16 },
            ]}
          >
            <View style={styles.logoWrapper}>
              <Image source={{ uri: item.logo }} style={styles.logo} />
            </View>
            <Text style={styles.brandTitle}>{item.brand}</Text>
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.ratingLabel}>Star Rating</Text>
          </View>
        ))}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 30,
    paddingLeft: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  card: {
    width: 115,
    height: 110,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "flex-start",
    marginHorizontal: 8,


      shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
  },
  logoWrapper: {
    position: "absolute",
    top: -15,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 2,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  brandTitle: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#202020",
  },
  rating: {
    fontSize: 18,
    fontWeight: "600",
    color: "#202020",
    marginTop: 2,
  },
  ratingLabel: {
    fontSize: 12,
    color: "#7E7E7E",
    marginTop: 2,
  },
});





