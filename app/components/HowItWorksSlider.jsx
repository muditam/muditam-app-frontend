import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';

const steps = [
  {
    id: 1,
    title: 'Take The Hair Test',
    step: 'Step 1 of 3',
    description: 'An online test that identifies the root cause of your hair loss',
    icon: '📝'
  },
  {
    id: 2,
    title: 'Buy The Plan',
    step: 'Step 2 of 3',
    description: 'On the basis of your responses, a customised treatment plan is created',
    icon: '🛒'
  },
  {
    id: 3,
    title: 'Start Your Hair Journey',
    step: 'Step 3 of 3',
    description: 'You get a free diet plan and access to a hair coach to guide you',
    icon: '💬'
  }
];

const { width } = Dimensions.get('window');

export default function HowItWorksSlider() {
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    setIndex(newIndex);
  };

  return (
    <View className="mt-4 mb-6">
      <Text className="text-xl font-semibold px-4 mb-4">How Muditam Works</Text>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {steps.map((item) => (
          <View
            key={item.id}
            style={{ width }}
            className="px-4"
          >
            <View className="bg-white border border-gray-300 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-3xl mr-3">{item.icon}</Text>
                <View>
                  <Text className="text-xs text-gray-500">{item.step}</Text>
                  <Text className="text-base font-semibold">{item.title}</Text>
                </View>
              </View>
              <Text className="text-sm text-gray-600 mt-1">{item.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="flex-row justify-center mt-3">
        {steps.map((_, i) => (
          <View
            key={i}
            style={{
              height: 6,
              width: i === index ? 16 : 6,
              backgroundColor: i === index ? '#000' : '#ccc',
              borderRadius: 3,
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>

      <Image
        source={{
          uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Smiling_Outdoors_with_Greenery_Background.png?v=1746516563',
        }}
        className="w-full h-64 mt-6"
        resizeMode="cover"
      />
    </View>
  );
}