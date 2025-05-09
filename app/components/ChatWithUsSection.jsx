import React from 'react';
import { View, Text, Image, TouchableOpacity, Linking } from 'react-native';

export default function ChatWithUsSection() {
  const whatsappNumber = '8989174741';
  const openWhatsApp = () => {
    const url = `https://wa.me/91${whatsappNumber}`;
    Linking.openURL(url);
  };

  return (
    <View className="px-4 mt-4 mb-4">
      <Text className="text-xl font-semibold mb-3">Chat With Us</Text>

      <View className="bg-white border border-gray-300 rounded-xl p-4 flex-row justify-between items-center">
        <View style={{ flex: 1 }}>
          <Text className="font-semibold text-base mb-1">Talk to a Hair Coach Now</Text>
          <Text className="text-sm text-gray-500">Get all your queries resolved in 15 minutes</Text>

          <TouchableOpacity
            onPress={openWhatsApp}
            className="mt-3 bg-[#d4edc9] px-4 py-2 rounded-lg flex-row items-center justify-center"
          >
            <Image
              source={{ uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/icon-whatsapp.png?v=1720530391' }}
              style={{ width: 18, height: 18, marginRight: 8 }}
            />
            <Text className="font-semibold text-sm text-black">Chat Now</Text>
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/icon-whatsapp.png?v=1720530391' }}
          style={{ width: 50, height: 50, marginLeft: 12 }}
        />
      </View>
    </View>
  );
}
