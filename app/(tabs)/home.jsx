import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { checkQuizStatus } from '../../utils/checkQuizFromServer';
import { getBannerHeight, getContentWidth, getScreenPadding, getFluidValue, useResponsive } from '../../utils/responsive';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const { width } = useResponsive();
  const horizontalPadding = getScreenPadding(width);
  const contentWidth = getContentWidth(width, 980);
  const bannerHeight = getBannerHeight(width);
  const headlineSize = Math.round(getFluidValue(width, 320, 1024, 17, 24));
  const buttonTextSize = Math.round(getFluidValue(width, 320, 1024, 16, 18));
  const sections = useMemo(
    () => ['heroVideos', 'plansInclude', 'journeys', 'faq', 'experts', 'footer'],
    []
  );

  const renderHeader = useCallback(
    () => (
      <>
        <View style={{ alignItems: 'center', backgroundColor: '#F3F4F6' }}>
          <Image
            source={{
              uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/1ST_HOMESCREEN_BANNER_2.png?v=1752044383',
            }}
            style={{
              width: '100%',
              maxWidth: contentWidth,
              height: bannerHeight,
            }}
          />
        </View>

        <View
          style={{
            backgroundColor: '#fff',
            padding: horizontalPadding,
            borderRadius: 25,
            marginTop: -25,
            marginBottom: 24,
            alignSelf: 'center',
            width: '100%',
            maxWidth: contentWidth,
          }}
        >
          <Text
            style={{
              fontSize: headlineSize,
              fontWeight: '600',
              fontFamily: 'Poppins',
              marginBottom: 16,
            }}
          >
            Your journey to better sugar control begins with a 2-minute quiz
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
                fontSize: buttonTextSize,
                fontFamily: 'Poppins',
                textAlign: 'center',
              }}
            >
              Take the Diabetes Quiz
            </Text>
          </TouchableOpacity>
        </View>
      </>
    ),
    [bannerHeight, buttonTextSize, contentWidth, headlineSize, horizontalPadding, router]
  );

  const renderSection = useCallback(({ item }) => {
    switch (item) {
      case 'heroVideos':
        return <HeroVideoList />;
      case 'plansInclude':
        return <PlansInclude />;
      case 'journeys':
        return <RealJourneysSlider />;
      case 'faq':
        return <FAQ />;
      case 'experts':
        return <ExpertsPanelCard />;
      case 'footer':
        return <FooterImageSection />;
      default:
        return null;
    }
  }, []);

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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff' }}
      edges={['top', 'left', 'right']} // Prevents bottom padding!
    >
      <FlatList
        data={sections}
        keyExtractor={(item) => item}
        renderItem={renderSection}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 24 }}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </SafeAreaView>
  );
}
