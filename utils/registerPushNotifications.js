import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://muditam-app-backend-ca1c8b03db09.herokuapp.com';

let Notifications = null;

try {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.warn('expo-notifications not available:', error.message);
}

const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android' || !Notifications) return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
};

const getProjectId = () =>
  Constants.expoConfig?.extra?.eas?.projectId ||
  Constants.easConfig?.projectId;

const savePushToken = async (userId, token) => {
  const res = await fetch(`${API_BASE}/api/user/save-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, expoPushToken: token }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return token;
};

export const registerPushNotifications = async (userId) => {
  if (Platform.OS === 'web' || !userId || !Device.isDevice || !Notifications) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  await ensureAndroidChannel();

  const projectId = getProjectId();
  const token = (await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  )).data;

  return savePushToken(userId, token);
};

export const syncPushNotificationsIfPermitted = async (userId) => {
  if (Platform.OS === 'web' || !userId || !Device.isDevice || !Notifications) return null;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return null;

  await ensureAndroidChannel();

  const projectId = getProjectId();
  const token = (await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  )).data;

  return savePushToken(userId, token);
};

const openNotificationUrl = async (url) => {
  if (!url || typeof url !== 'string') return;

  if (url.startsWith('/')) {
    router.push(url);
    return;
  }

  const parsed = Linking.parse(url);
  if (parsed.scheme === 'muditam' && parsed.path) {
    router.push(`/${parsed.path}`);
    return;
  }

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  }
};

export const setupNotificationResponseListener = () => {
  if (Platform.OS === 'web' || !Notifications) return null;

  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const url = response?.notification?.request?.content?.data?.url;
    openNotificationUrl(url).catch((error) => {
      console.warn('Notification link failed:', error.message);
    });
  });

  Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      const url = response?.notification?.request?.content?.data?.url;
      return openNotificationUrl(url);
    })
    .catch((error) => {
      console.warn('Initial notification link failed:', error.message);
    });

  return subscription;
};
