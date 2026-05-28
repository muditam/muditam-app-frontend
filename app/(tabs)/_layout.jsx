import { Tabs, useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { View, Text, useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import '../../global.css';
import { parseJsonSafely } from '../../utils/safeJson';

import { checkQuizStatus } from '../../utils/checkQuizFromServer';
import { checkPurchaseStatus } from '../../utils/checkPurchaseStatus';
import { setupNotificationResponseListener, syncPushNotificationsIfPermitted } from '../../utils/registerPushNotifications';
import ChatWidget from '../components/ChatWidget';

export default function Layout() {
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userReady, setUserReady] = useState(false);
  const { width } = useWindowDimensions();

  const router = useRouter();

  useEffect(() => {
    const subscription = setupNotificationResponseListener();
    return () => subscription?.remove?.();
  }, []);

  // 1. Check if user is logged in before showing Tabs!
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (!userDetails) {
          router.replace('/login');
        } else {
          const parsedUser = parseJsonSafely(userDetails, {});
          setUserReady(true);
          syncPushNotificationsIfPermitted(parsedUser?._id).catch((error) => {
            console.warn('Push sync failed:', error.message);
          });
        }
      } catch (_err) {
        setUserReady(true); // fail-safe
      }
    };
    checkUser();
  }, [router]);

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

  const iconSize = width >= 768 ? 27 : width < 390 ? 22 : 25;
  const tabLabelSize = width < 390 ? 9 : 10;
  const tabBarHeight = width >= 768 ? 68 : width < 390 ? 56 : 60;
  const tabPaddingTop = width < 390 ? 6 : 10;
  const tabSlotWidth = width >= 768 ? 84 : width < 390 ? 54 : 68;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'left', 'right']}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            height: tabBarHeight,
            backgroundColor: '#fff',
            borderTopWidth: 0.5,
            borderTopColor: '#e0e0e0',
            paddingTop: tabPaddingTop,
          },
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => {
            const iconColor = focused ? '#543287' : '#666';
            let icon, label;

            switch (route.name) {
              case 'home':
                icon = <Ionicons name="home-outline" size={iconSize} color={iconColor} />;
                label = 'Home';
                break;
              case 'buykit':
                icon = <Ionicons name="cart-outline" size={iconSize} color={iconColor} />;
                label = 'Buy Kit';
                break;
              case 'test':
                icon = <FontAwesome5 name="file-alt" size={iconSize} color={iconColor} />;
                label = 'Start Quiz';
                break;
              case 'products':
                icon = <Ionicons name="bag-handle-outline" size={iconSize} color={iconColor} />;
                label = 'Products';
                break;
              case 'videos':
                icon = <Ionicons name="videocam-outline" size={iconSize} color={iconColor} />;
                label = 'Videos';
                break;
              case 'me':
                icon = <MaterialIcons name="person-outline" size={iconSize} color={iconColor} />;
                label = 'You';
                break;
              case 'history':
                icon = <Ionicons name="time-outline" size={iconSize} color={iconColor} />;
                label = 'History';
                break;
              default:
                icon = null;
                label = '';
            }

            return (
              <View style={{ width: tabSlotWidth, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ padding: 2, borderRadius: 50, marginBottom: 0 }}>{icon}</View>
                <Text
                  style={{
                    fontSize: tabLabelSize,
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
          options={{}}
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
      <ChatWidget bottomOffset={tabBarHeight + 14} />
    </SafeAreaView>
  );
}
