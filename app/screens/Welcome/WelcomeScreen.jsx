import React from 'react';
import { View, Image } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Image
        source={{
          uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Muditam_Ayurveda_Logo.png?v=1740224106',
        }}
        className="w-40 h-40"
        resizeMode="contain"
      />
    </View>
  );
}
