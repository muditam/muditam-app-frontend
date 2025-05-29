import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";




const BOXES = [
  { title: "FAQs", icon: <MaterialIcons name="help-outline" size={24} /> },
  { title: "Diabetes Test", icon: <FontAwesome5 name="vial" size={22} /> },
  {
    title: "Diabetes Expert",
    icon: <Ionicons name="person-circle-outline" size={24} />,
  },
  {
    title: "Diet Plan",
    icon: <MaterialIcons name="restaurant-menu" size={24} />,
  },
  {
    title: "Payment Queries",
    icon: <MaterialIcons name="payment" size={24} />,
  },
  {
    title: "Moneyback Guarantee",
    icon: <FontAwesome5 name="hand-holding-usd" size={20} />,
  },
];


export default function NeedHelp() {




const navigation = useNavigation()


const handleBoxPress = (title) => {
    navigation.navigate("needHelpContent/NeedHelpFullScreen", { title });
  };


  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Need Help?</Text>


      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {BOXES.map((item, index) => (
          <Pressable
            key={index}
            style={styles.helpBox}
            onPress={() => handleBoxPress(item.title)}
          >
            <View style={styles.iconLeft}>{item.icon}</View>


            <View style={styles.content}>
              <Text style={styles.boxText}>{item.title}</Text>
            </View>


            <View style={styles.iconRight}>
              <Feather name="chevron-right" size={28} color="black" />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 20,
    backgroundColor: "#fff",
    paddingLeft: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom:20,
  },
  helpBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E4D0FF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginRight: 12,
    width: 158,
  },
  iconLeft: {
    marginRight: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  boxText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "left",
    flexWrap: "wrap",
  },
  iconRight: {
    marginLeft: 10,
    alignSelf: "center",
  },
});



