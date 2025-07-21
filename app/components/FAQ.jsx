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
    question: "What exactly does Muditam do?",
    answer:
      "Muditam helps you manage Type 2 Diabetes and Prediabetes using a holistic approach rooted in Ayurveda. This includes expert consultations, natural supplements, lifestyle changes, and regular progress tracking – all in one app.",
  },
  {
    question: "Do I have to follow a strict diet?",
    answer:
      "Not at all. Muditam promotes realistic and easy-to-follow eating habits. While supplements alone can help, following the dietary suggestions provided by our experts leads to far better outcomes. We offer food swaps, portion tips, and meal timings that work with your lifestyle and cultural preferences.",
  },
  {
    question: "How is the plan customized for me?",
    answer:
      "After you complete a short quiz in the app, our system carefully evaluates your responses - including your symptoms, daily routine, and health preferences. Based on this input, we create a personalized plan that includes the right Ayurvedic supplements, targeted food suggestions, and lifestyle practices designed to support your specific diabetes journey.",
  },
  {
    question: "How soon can I expect to see results?",
    answer:"Most users begin to notice improvements such as better fasting sugar levels, reduced fatigue, and more stable blood sugar patterns within 3–6 weeks. With consistent effort and adherence to the plan, long-term results typically become visible in 2–3 months."
  },
  {
    question: "Can I use Muditam if I’m already on diabetes medication?",
    answer:"Yes. Most of our users take Muditam supplements alongside their regular medication. Our formulations are natural, gentle, and designed to complement your current treatment. However, if you have multiple health conditions or take several medications, we recommend consulting our experts for personalized guidance before starting your plan."
  },
  {
    question: "What kind of support will I receive?",
    answer:"You’ll be supported by our team of experts throughout your journey. You can ask questions, get advice, or modify your plan at any time via WhatsApp or scheduled calls."
  },
  {
    question: "Are there any side effects of the supplements?",
    answer:"Our supplements are made from well-researched Ayurvedic ingredients and are generally well-tolerated. If you have specific allergies or sensitivities, please inform our team so we can customize your plan accordingly."
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



