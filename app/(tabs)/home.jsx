import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeroVideoList from '../components/HeroVideoList';  
import ChatWithUsSection from '../components/ChatWithUsSection'; 
import ReviewsSection from '../components/ReviewsSection';
import RealJourneysSlider from '../components/RealJourneysSlider';
import FAQ from '../components/FAQ';
import AfterQuizView from '../components/AfterQuizView';
import { checkQuizStatus } from '../utils/checkQuizFromServer';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const isCompleted = await checkQuizStatus(); // ✅ centralized server check
      setQuizCompleted(isCompleted);
      setLoading(false);
    };
    fetchStatus();
  }, []);



  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#9D57FF" />
      </View>
    );
  }

  if (quizCompleted) {
    return <AfterQuizView />;
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Top Image */}
      <Image
        source={{
          uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/banner_1.png?v=1747042914',
        }}
        style={{
          width: '100%',
          height: 420,
        }}
        resizeMode="cover"
      />

      {/* Headline Texts */}
      <View style={{ paddingTop: 0, paddingBottom: 16, paddingHorizontal: 16, alignItems: 'flex-start' }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: '600',
            fontFamily: 'Poppins',
            textAlign: 'left',
            color: '#000',
            marginTop: -20,
          }}
        >
          Smarter Diabetes Care Starts Here
        </Text>

        <Text
          style={{
            fontSize: 16,
            fontWeight: '400',
            fontFamily: 'Poppins',
            textAlign: 'left',
            color: '#666',
            marginTop: 8,
          }}
        >
          Your journey to better sugar control begins with a 2-minute quiz.
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/test')}
          style={{
            marginTop: 20,
            backgroundColor: '#9D57FF',
            paddingVertical: 12,
            borderRadius: 10,
            width: '100%',
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontWeight: '600',
              fontSize: 16,
              fontFamily: 'Poppins',
              textAlign: 'center',
            }}
          >
            Take the Diabetes Quiz
          </Text>
        </TouchableOpacity>
      </View>

      {/* Other Sections */}
      <HeroVideoList />
      <RealJourneysSlider />
      <ChatWithUsSection /> 
      <ReviewsSection />
      <FAQ />
    </ScrollView>
  );
}
