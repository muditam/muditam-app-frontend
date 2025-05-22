import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons"; 


const faqs = [
  {
    question: "How do I get started with Muditam?",
    answer:
      "To get started, simply take the Diabetes Quiz in the app. Based on your answers, we’ll suggest a personalized plan and recommend the most suitable supplements.",
  },
  {
    question: "What is included in the personalized plan?",
    answer:
      "Your personalized plan includes diet recommendations, natural supplements, lifestyle modifications, and daily tracking to help you manage your blood sugar levels.",
  },
  {
    question: "Can I use Muditam with my current medication?",
    answer:
      "Muditam's supplements are natural and safe. However, we always recommend consulting with your healthcare provider before adding any new supplements to your routine, especially if you’re on medication.",
  },
  {
    question: "Do I get professional support?",
    answer:"Yes, you have access to real human support from Ayurvedic doctors, clinical nutritionists, and health coaches who are available to guide you via the app and WhatsApp."
  },
  {
    question: "Can I follow Muditam if I have dietary restrictions?",
    answer:"Yes! Muditam offers flexible and customizable plans. Whether you follow a specific diet or have dietary restrictions, your plan will be tailored to fit your needs."
  },
  {
    question: "How long will it take to see results?",
    answer:"Results vary from person to person depending on lifestyle, commitment, and consistency. We recommend following your plan consistently for the best long-term outcomes."
  },
  {
    question: "Who can benefit from using Muditam?",
    answer:"Muditam is suitable for anyone looking to manage Type 2 Diabetes or Prediabetes with a holistic, natural approach. Whether you’re new to diabetes management or looking for better ways to control it, Muditam can help."
  },
];


export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState(null);


  const toggleAnswer = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);  
    } else {
      setExpandedIndex(index);  
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Frequently Asked Questions</Text>


      {faqs.map((item, index) => (
        <View key={index} style={styles.faqItem}>
          <Pressable
            onPress={() => toggleAnswer(index)}
            style={styles.questionContainer}
          >
            <View style={styles.questionTextWrapper}>
              <Text style={styles.question}>{item.question}</Text>
            </View>
            <FontAwesome
              name={expandedIndex === index ? "angle-up" : "angle-down"}
              size={20}
              style={styles.arrow}
            />
          </Pressable>
          {expandedIndex === index ? (
            <View style={styles.answerContainer}>
              <Text style={styles.answer}>{item.answer}</Text>
              <View style={styles.horizontalLine} />
            </View>
          ) : (
            <View style={styles.horizontalLine} />
          )}
        </View>
      ))}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 16,
   
  },
  heading: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight:500
  },
  faqItem: {
    marginBottom: 10,
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },


  questionTextWrapper: {
    flex: 1,
    paddingRight: 10,
  },


  question: {
    fontSize: 16,
    fontWeight: "500",
  },
  arrow: {
    fontSize: 26,
    fontStyle: "bold",
    marginRight: 2,
  },
  answerContainer: {
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  answer: {
    fontSize: 14,
    color: "#626262",
    lineHeight:20
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "#ddd",
    marginTop: 5,
    width: "100%",
  },
});



