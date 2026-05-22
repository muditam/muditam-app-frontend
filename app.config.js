const sharedGoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const androidGoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY || sharedGoogleMapsApiKey;
const iosGoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY || sharedGoogleMapsApiKey;

export default {
  expo: {
    name: 'Muditam Ayurveda',
    slug: 'muditam',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/logo.png',
    scheme: 'muditam',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    android: {
      package: 'com.madhurmuditam.muditam',
      googleServicesFile: './google-services.json',
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.MODIFY_AUDIO_SETTINGS',
        'android.permission.INTERNET',
        'android.permission.WAKE_LOCK',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
      ],
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      config: {
        usesCleartextTraffic: true,
        ...(androidGoogleMapsApiKey
          ? {
              googleMaps: {
                apiKey: androidGoogleMapsApiKey,
              },
            }
          : {}),
      },
    },
    ios: {
      bundleIdentifier: 'com.madhurmuditam.muditam',
      supportsTablet: true,
      buildNumber: '1.0.0',
      config: iosGoogleMapsApiKey
        ? {
            googleMapsApiKey: iosGoogleMapsApiKey,
          }
        : undefined,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSMicrophoneUsageDescription: 'Allow Muditam Ayurveda to use your microphone for internet calls.',
        NSLocationWhenInUseUsageDescription: 'Allow Muditam Ayurveda to detect your location and show nearby sample collection areas.',
      },
    },
    extra: {
      eas: {
        projectId: 'fde999e1-7ae9-45d3-83c2-33930fc4045e',
      },
      googleMapsApiKeyConfigured: Boolean(sharedGoogleMapsApiKey || androidGoogleMapsApiKey || iosGoogleMapsApiKey),
      googleMapsAndroidConfigured: Boolean(androidGoogleMapsApiKey),
      googleMapsIosConfigured: Boolean(iosGoogleMapsApiKey),
    },
    plugins: [
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-router',
      'expo-font',
      'expo-notifications',
      'expo-video',
      [
        'expo-location',
        {
          locationWhenInUsePermission: 'Allow Muditam Ayurveda to detect your location and show nearby sample collection areas.',
        },
      ],
    ],
  },
};
