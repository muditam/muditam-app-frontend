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

const CARD_WIDTH = 220;
const CARD_HEIGHT = 280;
const SPACING = 12;

const videos = [
  {
    id: '1',
    thumbnail: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Smiles_in_the_Park.png?v=1746440710',
    url: 'https://cdn.shopify.com/videos/c/o/v/9603ccc053314a139fe15c15f95ea5a8.mp4',
    quote: 'Would rate it 9/10, my baldness got covered',
    name: 'Amit',
  },
  {
    id: '2',
    thumbnail: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Contemplative_Gaze_Against_Red_Brick_Wall.png?v=1746525897',
    url: 'https://cdn.shopify.com/videos/c/o/v/c1d7b744e7324a5e882bda4cd515780c.mp4',
    quote: 'Results are best, my hair is back on my head',
    name: 'Shashank',
  },
  {
    id: '3',
    thumbnail: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mobile_View_3_5b33b084-74db-4ada-b4cc-7b0db3aabc3a.webp?v=1746169747',
    url: 'https://cdn.shopify.com/videos/c/o/v/3733915a671b4905adf3e87ce18c1a1e.mp4',
    quote: 'Amazing results, would recommend to everyone',
    name: 'Ravi',
  },
  {
    id: '4',
    thumbnail: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mobile_View_3_1f6bc52a-c011-4a44-993a-c8a38a9e261a.jpg?v=1746169067',
    url: 'https://cdn.shopify.com/videos/c/o/v/1d8505c4968747469d631c46c440daac.mp4',
    quote: 'My confidence is back!',
    name: 'Rakesh',
  },
  {
    id: '5',
    thumbnail: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_2025_04_30T13_40_02_784Z.png?v=1746076534',
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
          style={{ width: '100%', height: 160 }}
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

        {/* Mini before/after overlay (fake for now) */}
        <View style={{
          position: 'absolute',
          bottom: 6,
          right: 6,
          flexDirection: 'row',
          gap: 4,
        }}>
          <Image
            source={{ uri: item.thumbnail }}
            style={{ width: 30, height: 30, borderRadius: 6, borderWidth: 1, borderColor: '#fff' }}
          />
          <Image
            source={{ uri: item.thumbnail }}
            style={{ width: 30, height: 30, borderRadius: 6, borderWidth: 1, borderColor: '#fff' }}
          />
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
      <Text className="text-lg font-semibold px-4 mb-3">Muditam Heroes</Text>
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
