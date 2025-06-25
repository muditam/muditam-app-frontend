import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CARD_WIDTH = 150;
const CARD_HEIGHT = 280;
const SPACING = 12;

const videos = [
  {
    id: "1",
    thumbnail:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/1_1_1e442318-4b63-4e40-b63e-e47351af1fcb.png?v=1747043545",
    url: "https://cdn.shopify.com/videos/c/o/v/9603ccc053314a139fe15c15f95ea5a8.mp4",
    quote: "Would rate it 9/10, my baldness got covered",
    name: "Amit",
  },
  {
    id: "2",
    thumbnail:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/3_0b563148-da79-4a3b-95e6-1f5720ab00a7.png?v=1722316842",
    url: "https://cdn.shopify.com/videos/c/o/v/c1d7b744e7324a5e882bda4cd515780c.mp4",
    quote: "Results are best, my hair is back on my head",
    name: "Shashank",
  },
  {
    id: "3",
    thumbnail:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/6_527d324c-da6b-4954-80f6-8280a0d6c300.png?v=1722316967",
    url: "https://cdn.shopify.com/videos/c/o/v/3733915a671b4905adf3e87ce18c1a1e.mp4",
    quote: "Amazing results, would recommend to everyone",
    name: "Ravi",
  },
  {
    id: "4",
    thumbnail:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/2_6eb3e3dd-15ad-46ae-af3d-ff4abfdc2de1.png?v=1722316897",
    url: "https://cdn.shopify.com/videos/c/o/v/1d8505c4968747469d631c46c440daac.mp4",
    quote: "My confidence is back!",
    name: "Rakesh",
  },
  {
    id: "5",
    thumbnail:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/5_07a9d779-ebd5-4872-8760-13ec2b09f047.png?v=1747043820",
    url: "https://cdn.shopify.com/videos/c/o/v/1ba69a72ee3b455b8c8cee00a669cae3.mp4",
    quote: "Never thought I’d see my hair this thick again!",
    name: "Dev",
  },
];


export default function HeroVideoList() {
  const router = useRouter();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/fullscreen', params: { video: item.url } })}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginRight: SPACING,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 10, // ↑ Increase this to simulate spread
        overflow: Platform.OS === 'ios' ? 'visible' : 'hidden',
        // Android Shadow
        elevation: 6,
      }}
    >
      {/* Thumbnail as background */}
      <View style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Image
          source={{ uri: item.thumbnail }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode="cover"
        />

        {/* Play Icon (left-centered) */}
        <View style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          backgroundColor: '#fff',
          padding: 4,
          borderRadius: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ color: '#000', fontSize: 14 }}><MaterialIcons name="play-arrow" size={22} color="black" />
          </Text>
        </View>

      </View>
    </TouchableOpacity>
  );




  return (
    <View className="mt-6">
      <Text style={{
        fontSize: 21, fontWeight: 700, marginLeft: 16, marginBottom: 16,
      }}>Results That Speaks</Text>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  iconContainer: {
    position: "absolute",
    right: 16,
    bottom: Platform.OS === 'android' ? 150 : 98,
    alignItems: "center",
  },
  iconButton: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 500,
    marginTop: 2,
  },
})

