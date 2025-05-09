import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';

const { width } = Dimensions.get('window');

const reviews = [
  {
    id: '1',
    name: 'Bilal Ahmed Shah',
    rating: 5,
    shortText:
      'My friends used to tease me all the time about hair loss but now I am glad that my hair is full. I feel much more confid...',
    fullText:
      'My friends used to tease me all the time about hair loss but now I am glad that my hair is full. I feel much more confident now. My family is also happy, a big thank you to the Muditam team.',
  },
  {
    id: '2',
    name: 'Ravi Kumar',
    rating: 4,
    shortText:
      'After trying so many products, Muditam finally gave me results. I can see real growth in just two months...',
    fullText:
      'After trying so many products, Muditam finally gave me results. I can see real growth in just two months and I’m truly impressed by their plan and support.',
  },
  {
    id: '3',
    name: 'Sneha R.',
    rating: 5,
    shortText:
      'My hair feels so much healthier and thicker. Thanks to the doctor team...',
    fullText:
      'My hair feels so much healthier and thicker. Thanks to the doctor team and customized plan, I feel amazing and confident again!',
  },
  {
    id: '4',
    name: 'Suresh Yadav',
    rating: 5,
    shortText:
      'The support team is quick and helpful. Muditam works and it’s not a scam like others...',
    fullText:
      'The support team is quick and helpful. Muditam works and it’s not a scam like others. I’ve recommended it to my friends as well.',
  },
  {
    id: '5',
    name: 'Pooja Singh',
    rating: 4,
    shortText:
      'Great results in just one month. Their diet and supplement combo is perfect...',
    fullText:
      'Great results in just one month. Their diet and supplement combo is perfect. And I love how convenient it is to follow their plan.',
  },
];

export default function ReviewsSection() {
  const [selectedReview, setSelectedReview] = useState(null);

  return (
    <View className="mt-4 mb-6">
      <Text className="text-xl font-semibold px-4 mb-1">Google Reviews & Ratings</Text>
      <View className="px-4 mb-4 flex-row items-center gap-1">
        <Text className="text-3xl font-bold">4.6</Text>
        <Text className="text-yellow-500 text-xl">★★★★★</Text>
        <Text className="text-gray-500 text-sm ml-2">6072 ratings</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedReview(item)}
            className="bg-white border border-gray-300 rounded-xl p-4 w-72 mr-4"
          >
            <Text className="font-semibold mb-1">{item.name}</Text>
            <Text className="text-yellow-500 mb-1">{'★'.repeat(item.rating)}</Text>
            <Text className="text-sm text-gray-700">{item.shortText}</Text>
            <Text className="text-green-600 mt-1">Read ...</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal View */}
      <Modal visible={!!selectedReview} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-2xl p-6 max-h-[90%]">
          <TouchableOpacity
            onPress={() => setSelectedReview(null)}
            style={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10,
                padding: 8,
            }}
            >
            <Text style={{ fontSize: 22 }}>✕</Text>
            </TouchableOpacity>
            <Text className="font-semibold text-base mb-1">{selectedReview?.name}</Text>
            <Text className="text-yellow-500 mb-2">{'★'.repeat(selectedReview?.rating)}</Text>
            <ScrollView>
              <Text className="text-sm text-gray-800 leading-relaxed">{selectedReview?.fullText}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
