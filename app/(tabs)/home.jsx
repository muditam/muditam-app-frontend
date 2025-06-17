import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HeroVideoList from '../components/HeroVideoList';
import RealJourneysSlider from '../components/RealJourneysSlider';
import ExpertsPanelCard from '../components/ExpertsPanelCard';
import PlansInclude from '../components/AfterView/PlansInclude';
import FooterImageSection from '../components/FooterImageSection';
import FAQ from '../components/FAQ';
import AfterQuizView from '../components/AfterQuizView';
import AfterPurchase from '../components/AfterPurchase';

import { checkQuizStatus } from '../utils/checkQuizFromServer';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const isCompleted = await checkQuizStatus();
        const purchased = await AsyncStorage.getItem('hasPurchased');
        setQuizCompleted(isCompleted);
        setHasPurchased(purchased === 'true');
      } catch (error) {
        console.error('Status check error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#9D57FF" />
      </View>
    );
  }

  if (hasPurchased) {
    return <AfterPurchase />;
  }

  if (quizCompleted) {
    return <AfterQuizView />;
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 25 : 0, backgroundColor: '#fff' }}>
      <FlatList
        data={[]} // just to enable scrolling
        keyExtractor={(item, index) => index.toString()}
        renderItem={null}
        ListHeaderComponent={
          <>
            {/* Top Image Section */}
            <View style={{ alignItems: 'center', backgroundColor: '#F3F4F6', }}>
              <Image
                source={{
                  uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/2ND_PAGE_TOP_BANNER.png?v=1750145299',
                }}
                style={{
                  width: '100%',
                  height: 280, 
                }}
              />
            </View>

            {/* White Card Section with Text and Button */}
            <View
              style={{
                backgroundColor: '#fff', 
                padding: 20,
                borderRadius: 25,  
                marginTop: -15,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '600',
                  fontFamily: 'Poppins', 
                  marginBottom: 16,
                }}
              >
                Your journey to better sugar control begins with a 2-minute quiz.
              </Text>

              <TouchableOpacity
                onPress={() => router.push('/test')}
                style={{
                  backgroundColor: '#9D57FF',
                  paddingVertical: 14,
                  borderRadius: 10,
                  marginBottom: -30,
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

            {/* Content Sections */}
            <HeroVideoList />
            <PlansInclude />
            <RealJourneysSlider />
            <FAQ />
            <ExpertsPanelCard />
            <FooterImageSection />
          </>
        }
      />
    </SafeAreaView>
  );
}
