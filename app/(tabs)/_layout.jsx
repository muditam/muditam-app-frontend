import { Tabs, useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import '../../global.css';

import { checkQuizStatus } from '../utils/checkQuizFromServer';
import { checkPurchaseStatus } from '../utils/checkPurchaseStatus';

export default function Layout() {
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userReady, setUserReady] = useState(false);

  const router = useRouter();

  // 1. Check if user is logged in before showing Tabs!
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (!userDetails) {
          router.replace('/login');
        } else {
          setUserReady(true);
        }
      } catch (err) {
        setUserReady(true); // fail-safe
      }
    };
    checkUser();
  }, []);

  // 2. Fetch quiz/purchase status (as before)
  useEffect(() => {
    if (!userReady) return;
    const fetchStatus = async () => {
      try {
        const isCompleted = await checkQuizStatus();
        const purchased = await checkPurchaseStatus();

        setQuizCompleted(isCompleted);
        setHasPurchased(purchased);

        await AsyncStorage.setItem('hasPurchased', purchased ? 'true' : 'false');
      } catch (err) {
        console.error('Tab logic load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [userReady]);

  if (!userReady || loading) return null; // Avoid flash or UI until ready

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'left', 'right']}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            height: 60,
            backgroundColor: '#fff',
            borderTopWidth: 0.5,
            borderTopColor: '#e0e0e0',
            paddingTop: 10,
          },
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => {
            const iconColor = focused ? '#543287' : '#666';
            let icon, label;

            switch (route.name) {
              case 'home':
                icon = <Ionicons name="home-outline" size={25} color={iconColor} />;
                label = 'Home';
                break;
              case 'buykit':
                icon = <Ionicons name="cart-outline" size={25} color={iconColor} />;
                label = 'Buy Kit';
                break;
              case 'test':
                icon = <FontAwesome5 name="file-alt" size={25} color={iconColor} />;
                label = 'Start Quiz';
                break;
              case 'products':
                icon = <Ionicons name="bag-handle-outline" size={25} color={iconColor} />;
                label = 'Products';
                break;
              case 'videos':
                icon = <Ionicons name="videocam-outline" size={25} color={iconColor} />;
                label = 'Videos';
                break;
              case 'me':
                icon = <MaterialIcons name="person-outline" size={25} color={iconColor} />;
                label = 'You';
                break;
              case 'history':
                icon = <Ionicons name="time-outline" size={25} color={iconColor} />;
                label = 'History';
                break;
              default:
                icon = null;
                label = '';
            }

            return (
              <View style={{ width: 70, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ padding: 2, borderRadius: 50, marginBottom: 0 }}>{icon}</View>
                <Text
                  style={{
                    fontSize: 10,
                    color: iconColor,
                    fontWeight: focused ? '600' : '400',
                    textAlign: 'center',
                    flexWrap: 'nowrap',
                  }}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
            );
          },
        })}
      >
        <Tabs.Screen
          name="home"
          options={{
            redirect: () => (hasPurchased ? '/AfterPurchase' : undefined),
          }}
        />
        <Tabs.Screen
          name="buykit"
          options={{
            href: quizCompleted ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="test"
          options={{
            href: quizCompleted ? null : undefined,
          }}
        />
        <Tabs.Screen name="products" />
        <Tabs.Screen name="videos" />
        <Tabs.Screen
          name="me"
          options={{
            href: hasPurchased ? null : undefined,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            href: hasPurchased ? undefined : null,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
