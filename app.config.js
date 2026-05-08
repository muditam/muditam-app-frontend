export default {
    expo: {
        name: "Muditam Ayurveda",
        slug: "muditam",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/logo.png",
        scheme: "muditam",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        android: { 
            package: "com.madhurmuditam.muditam",
            "googleServicesFile": "./google-services.json",
            permissions: [
                "android.permission.RECORD_AUDIO",
                "android.permission.MODIFY_AUDIO_SETTINGS",
                "android.permission.INTERNET",
                "android.permission.WAKE_LOCK"
            ],
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png", 
                backgroundColor: "#ffffff"
            },
            config: {
                usesCleartextTraffic: true
            } 
        },
        ios: {
            bundleIdentifier: "com.madhurmuditam.muditam",
            supportsTablet: true,
            buildNumber: "1.0.0",
            infoPlist: {
                ITSAppUsesNonExemptEncryption: false,
                NSMicrophoneUsageDescription: "Allow Muditam Ayurveda to use your microphone for internet calls."
            }
        },
        extra: {
            eas: {
                projectId: "fde999e1-7ae9-45d3-83c2-33930fc4045e"
            }
        },
        plugins: [
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/splash-icon.png",
                    resizeMode: "contain",
                    backgroundColor: "#ffffff"
                }
            ],
            "expo-router",
            "expo-font",
            "expo-notifications",
            "expo-video"
        ]
    }
};
