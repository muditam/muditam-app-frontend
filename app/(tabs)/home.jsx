import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import HeroVideoList from '../components/HeroVideoList';
import CausesSection from '../components/CausesSection';
import HowItWorksSlider from '../components/HowItWorksSlider'; 
import ChatWithUsSection from '../components/ChatWithUsSection'; 
import DoctorsSection from '../components/DoctorsSection'; 
import ReviewsSection from '../components/ReviewsSection'; 

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Top Image */}
      <Image
        source={{
          uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Smiling_Outdoors_with_Greenery_Background.png?v=1746516563',
        }}
        className="w-full h-64"
        resizeMode="cover"
      />

      {/* Headline Texts */}
      <View className="px-6 py-4 items-center">
        <Text className="text-xl font-semibold text-center">Know the root cause of Diabetes</Text>
        <Text className="text-sm text-gray-500 mt-1 text-center">93% saw results* in 1 Month</Text>

        <TouchableOpacity
          onPress={() => router.push('/test')}
          className="mt-6 bg-[#543287] px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold text-base">Take the Quiz</Text>
        </TouchableOpacity>
      </View>

      {/* Muditam Heroes Video List */}
      <HeroVideoList />

      <CausesSection />

      <HowItWorksSlider />

      <ChatWithUsSection />

      <DoctorsSection />

      <ReviewsSection />
    </ScrollView>
  );
}
