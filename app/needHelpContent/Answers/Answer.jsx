import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';


const Answer = () => {
  const route = useRoute();
  const navigation = useNavigation();


  const { question, answer } = route.params || {};


  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color="black" />
        <Text style={styles.headerText}>Need Help</Text>
      </Pressable>


      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
    backgroundColor: '#fff',
        paddingHorizontal: 16,


  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
   
  },
  headerText: {
    fontSize: 24,
    fontWeight: '500',
    marginLeft: 10,
    lineHeight:30
  },
  question: {
    fontSize: 14,
    color: 'black',
    lineHeight: 20,
    fontWeight:'400',
    marginBottom: 20,
    paddingLeft:35,
  },
  answer: {
    fontSize: 14,
    color: 'black',
    lineHeight: 20,
    fontWeight:'400',
    lineHeight:20
  },
});


export default Answer;

