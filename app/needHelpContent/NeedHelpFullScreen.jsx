

import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import faqData from "./Questions/Questions";

export default function NeedHelpFullScreen() {
  const route = useRoute();
  const navigation = useNavigation();


  const { title: initialTitle } = route.params || {};


  const BOXES = [
    { title: "FAQs", iconType: MaterialIcons, iconName: "help-outline" },
    { title: "Diabetes Test", iconType: FontAwesome5, iconName: "vial" },
    { title: "Diabetes Expert", iconType: Ionicons, iconName: "person-circle-outline" },
    { title: "Diet Plan", iconType: MaterialIcons, iconName: "restaurant-menu" },
    { title: "Payment Queries", iconType: MaterialIcons, iconName: "payment" },
    { title: "Moneyback Guarantee", iconType: FontAwesome5, iconName: "hand-holding-usd" },
  ];


  const [selectedTitle, setSelectedTitle] = useState(initialTitle);


  const scrollViewRef = useRef(null);


  useEffect(() => {
    const index = BOXES.findIndex((item) => item.title === selectedTitle);
    const tabWidth = 105;
    if (scrollViewRef.current && index !== -1) {
      scrollViewRef.current.scrollTo({ x: index * tabWidth, animated: true });
    }
  }, [selectedTitle]);


  const faqs = faqData[selectedTitle] || null;


  const handleBackPress = () => {
    navigation.goBack();
  };


  const renderFAQs = () => (
    <View>
      <Text style={styles.heading}>{selectedTitle} Questions</Text>
      {faqs.map((item, index) => (
        <View key={index} style={styles.faqItem}>
          <Pressable
            onPress={() =>
              navigation.navigate("needHelpContent/Answers/Answer", {
                question: item.question,
                answer: item.answer,
              })
            }
            style={styles.questionContainer}
          >
            <View style={styles.questionTextWrapper}>
              <Text style={styles.question}>{item.question}</Text>
            </View>
            <FontAwesome name="angle-right" size={20} style={styles.arrow} />
          </Pressable>
        </View>
      ))}
    </View>
  );


  // Render other content for tabs without FAQ
  const renderContent = () => {
    if (faqs) return renderFAQs();


    switch (selectedTitle) {
      case "Diabetes Test":
        return (
          <Text style={styles.contentText}>
            Information about Diabetes Tests...
          </Text>
        );
      case "Diabetes Expert":
        return (
          <Text style={styles.contentText}>
            Contact or details about Diabetes Experts...
          </Text>
        );
      case "Diet Plan":
        return (
          <Text style={styles.contentText}>
            Diet plans for diabetes management...
          </Text>
        );
      case "Payment Queries":
        return (
          <Text style={styles.contentText}>
            Details on payment queries and support...
          </Text>
        );
      case "Moneyback Guarantee":
        return (
          <Text style={styles.contentText}>
            Information on moneyback guarantees...
          </Text>
        );
      default:
        return <Text style={styles.contentText}>Content not found.</Text>;
    }
  };


  return (
    <View style={styles.container}>
      {/* Navbar with Back Button */}
      <Pressable onPress={handleBackPress} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color="black" />
        <Text style={styles.backText}>Questions</Text>
      </Pressable>


      {/* Tabs ScrollView */}
      <View style={styles.tabsWrapper}>
        <View style={styles.grayLine} />
        <ScrollView
          horizontal
          ref={scrollViewRef}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.iconContainer}
        >
          {BOXES.map((item, index) => {
            const isActive = item.title === selectedTitle;
            const IconComponent = item.iconType;
            return (
              <Pressable
                key={index}
                style={styles.iconItem}
                onPress={() => setSelectedTitle(item.title)}
              >
                <View style={styles.iconInner}>
                  <IconComponent
                    name={item.iconName}
                    size={24}
                    color={isActive ? "#9D57FF" : "#333"}
                  />
                  <Text style={[styles.iconLabel, isActive && styles.activeText]}>
                    {item.title}
                  </Text>
                  {isActive && <View style={styles.activeLine} />}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>


      {/* Content Section */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
  },


  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginLeft: 16,
  },


  backText: {
    fontSize: 24,
    fontWeight: "500",
    marginLeft: 10,
  },


  tabsWrapper: {
    position: "relative",
  },


  iconContainer: {
    flexDirection: "row",
    paddingBottom: 10,
  },


  iconItem: {
    alignItems: "center",
    marginRight: 38,
    height: 80,
  },


  iconInner: {
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
    height: "100%",
  },


  iconLabel: {
    fontSize: 16,
    color: "#4E4E4E",
    marginTop: 4,
    textAlign: "center",
    width: 85,
  },
  activeText: {
    color: "#9D57FF",
  },
 
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  faqItem: {
    marginBottom: 12,
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F4F4F4",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  questionTextWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  question: {
    fontSize: 15,
    color: "#222",
  },
  arrow: {
    marginLeft: 8,
    color: "#999",
  },


   activeText: {
    color: "#9D57FF",
  },


  //1.


  activeLine: {
    position: "absolute",
    bottom: -10,
    width: 50,
    height: 5,
    backgroundColor: "#9D57FF",
    borderRadius: 20,
  },
  grayLine: {
    position: "absolute",
    width: "100%",
    height: 0.5,
    backgroundColor: "#CFCFCF",
    marginTop: 87,
  },


  contentContainer: {
    paddingBottom: 100,
    paddingHorizontal: 16,
    paddingVertical:20
  },
});



