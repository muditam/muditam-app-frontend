import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const CARD_WIDTH = 150;
const CARD_HEIGHT = 280;
const SPACING = 12;

const videos = [
  {
    id: '1',
    thumbnail: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/1_1_1e442318-4b63-4e40-b63e-e47351af1fcb.png?v=1747043545',
    url: 'https://cdn.shopify.com/videos/c/o/v/9603ccc053314a139fe15c15f95ea5a8.mp4',
    quote: 'Would rate it 9/10, my baldness got covered',
    name: 'Amit',
  },
  {
    id: '2',
    thumbnail: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/3_0b563148-da79-4a3b-95e6-1f5720ab00a7.png?v=1722316842',
    url: 'https://cdn.shopify.com/videos/c/o/v/c1d7b744e7324a5e882bda4cd515780c.mp4',
    quote: 'Results are best, my hair is back on my head',
    name: 'Shashank',
  },
  {
    id: '3',
    thumbnail: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/6_527d324c-da6b-4954-80f6-8280a0d6c300.png?v=1722316967',
    url: 'https://cdn.shopify.com/videos/c/o/v/3733915a671b4905adf3e87ce18c1a1e.mp4',
    quote: 'Amazing results, would recommend to everyone',
    name: 'Ravi',
  },
  {
    id: '4',
    thumbnail: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/2_6eb3e3dd-15ad-46ae-af3d-ff4abfdc2de1.png?v=1722316897',
    url: 'https://cdn.shopify.com/videos/c/o/v/1d8505c4968747469d631c46c440daac.mp4',
    quote: 'My confidence is back!',
    name: 'Rakesh',
  },
  {
    id: '5',
    thumbnail: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/5_07a9d779-ebd5-4872-8760-13ec2b09f047.png?v=1747043820',
    url: 'https://cdn.shopify.com/videos/c/o/v/1ba69a72ee3b455b8c8cee00a669cae3.mp4',
    quote: 'Never thought I’d see my hair this thick again!',
    name: 'Dev',
  },
];

export default function HeroVideoList() {
  const router = useRouter();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/fullscreen', params: { video: item.url } })}
      style={{
        width: CARD_WIDTH,
        marginRight: SPACING,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      {/* Thumbnail */}
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: item.thumbnail }}
          style={{ width: '100%', height: 260 }}
          resizeMode="cover"
        />

        {/* Play Icon Overlay */}
        <View style={{
          position: 'absolute',
          top: '40%',
          left: '40%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: 10,
          borderRadius: 30,
        }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>▶</Text>
        </View>
         
      </View>

      {/* Quote */}
      <View style={{ padding: 10 }}>
        <Text numberOfLines={2} style={{ fontSize: 13, color: '#000' }}>{item.quote}</Text>
        <Text style={{ fontSize: 12, marginTop: 4, color: '#555' }}>– {item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="mt-6">
      <Text className="text-lg font-semibold px-5 mb-3">Muditam Heroes</Text>
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
