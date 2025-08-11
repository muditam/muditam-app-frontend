export default {
    expo: {
        name: "Muditam Ayurveda",
        slug: "muditam",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/logo.png",
        scheme: "muditam",
        userInterfaceStyle: "automatic",
        android: { 
            package: "com.madhurmuditam.muditam",
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
            buildNumber: "1.0.0"
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
            "expo-video"
        ]
    }
};
