const sharedGoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const androidGoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY || sharedGoogleMapsApiKey;
const iosGoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY || sharedGoogleMapsApiKey;

export default {
  expo: {
    name: 'Muditam Ayurveda',
    slug: 'muditam',
    version: '1.0.3',
    orientation: 'portrait',
    icon: './assets/images/logo.png',
    scheme: 'muditam',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    android: {
      package: 'com.madhurmuditam.muditam',
      googleServicesFile: './google-services.json',
      blockedPermissions: [
        'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
        'android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION',
      ],
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
      config: androidGoogleMapsApiKey
        ? {
            googleMaps: {
              apiKey: androidGoogleMapsApiKey,
            },
          }
        : undefined,
    },
    ios: {
      bundleIdentifier: 'com.madhurmuditam.muditam',
      supportsTablet: true,
      buildNumber: '1.0.42',
      config: iosGoogleMapsApiKey
        ? {
            googleMapsApiKey: iosGoogleMapsApiKey,
          }
        : undefined,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          'Muditam Ayurveda uses the camera so you can take a profile photo and capture health-related images, such as glucose readings, to upload in the app.',
        NSMicrophoneUsageDescription:
          'Muditam Ayurveda uses the microphone so you can record voice notes in chat and speak during internet audio calls with your health expert.',
        NSPhotoLibraryUsageDescription:
          'Muditam Ayurveda accesses your photo library so you can choose a profile photo or attach existing health-related images and files in chat and care flows.',
        NSPhotoLibraryAddUsageDescription:
          'Muditam Ayurveda saves selected health-related images to your app flow only when you choose to upload or share them, such as a profile photo or glucose reading.',
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
      [
        'expo-notifications',
        {
          defaultChannel: 'default',
          color: '#543287',
        },
      ],
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
