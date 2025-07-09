import React from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";


export default function ChatWithUsSection() {
  const whatsappNumber = "9625368707";
  const openWhatsApp = () => {
    const url = `https://wa.me/91${whatsappNumber}`;
    Linking.openURL(url);
  };


  return (
    <View className="px-4 mt-4">
      <View className="bg-white border border-[#D0D5DD] rounded-xl p-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 pr-2">
            <Text className="font-semibold text-xl text-base mb-1">
              Chat with a Diabetes Expert
            </Text>
            <Text className="text-md text-[#667085]">
              Get all your queries resolved in{" "}
            </Text>
            <Text className="text-md text-[#667085]">15 mins or less</Text>
          </View>


          <Image
            source={{
              uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_3.png?v=1747143071",
            }}
            style={{ width: 64, height: 64, borderRadius: 34 }}
          />
        </View>


        <TouchableOpacity
        style={{ backgroundColor: '#E4D0FF' }}
          onPress={openWhatsApp}
          className="mt-3 px-4 py-2 rounded-lg flex-row items-center justify-center"
        >
          <FontAwesome
            name="whatsapp"
            size={22}
            color="black"
            style={{ marginRight: 8 }}
          />


          <Text className="font-semibold text-md text-black">Chat With Us</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}



