import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";


const BOXES = [
  {
    title: "Doctor Related",
    icon: <FontAwesome5 name="stethoscope" size={20} />,
  },
  {
    title: "Expert Related",
    icon: <Ionicons name="people-circle-outline" size={24} />, 
  },
  {
    title: "Diet & Lifestyle",
    icon: <MaterialIcons name="fitness-center" size={24} />,
  },
  {
    title: "App",
     icon: <FontAwesome5 name="mobile-alt" size={20} />,
  },
  {
    title: "Delivery & Support",
    icon: <FontAwesome5 name="truck" size={20} />,
  },
];


export default function NeedHelp() {
  const navigation = useNavigation();


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
              <Feather name="chevron-right" size={26} color="black" />
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
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    paddingLeft: 16,
  },
  scrollContent:{
    paddingLeft:16,
  },
  helpBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E4D0FF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingVertical:Platform.OS=="ios"?10:6,
    paddingHorizontal: 4,
    marginRight: 12,
    width:Platform.OS==="ios"?158:145,
  },
  iconLeft: {
    marginLeft:Platform.OS==="ios"?8:4,
    marginRight:Platform.OS==="ios"?8:4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  boxText: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "left",
    flexWrap: "wrap",
  },
  iconRight: {
    marginLeft: 10,
    alignSelf: "center",
    size:Platform.OS==="ios"?24:20,
  },
});



