import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.35;
const SPACING = 12;

const causes = [
  {
    title: 'Nutrient Deficiency',
    color: '#b5d885',
    icon: '🍎',
    description:
      'Indian men suffer from iron and protein deficiencies significantly more than other countries, making nutrition one of the main factors behind hair loss.',
    treatment: [
      'Improved nutrition with healing diet plans',
      'Essential supplements for hair nutrition',
      'Addressing gut health to improve nutrient absorption'
    ]
  },
  {
    title: 'Stress & Sleep',
    color: '#c4c98f',
    icon: '💤',
    description:
      'Disturbed sleep and chronic stress can affect the hair growth cycle by shifting the growth phase of the follicle to rest phase, leading to excessive hair fall.',
    treatment: [
      'Managing stress levels',
      'Regularising sleep cycles',
      'Recommending lifestyle changes',
      'Supporting overall health and metabolism'
    ]
  },
  {
    title: 'Genetics',
    color: '#8fc6db',
    icon: '🧬',
    description:
      'Hereditary hair loss is the most common cause. It gradually happens with aging and is often predictable.',
    treatment: [
      'Slowing down genetic hair loss progression',
      'Supporting regrowth with topical actives',
      'Improving scalp health for retention'
    ]
  },
  {
    title: 'Weight',
    color: '#f2c28c',
    icon: '⚖️',
    description:
      'Drastic weight loss or fluctuations affect hormonal balance and nutrition, contributing to hair thinning.',
    treatment: [
      'Stabilizing healthy weight with balanced nutrition',
      'Monitoring deficiencies from dieting',
      'Promoting sustainable metabolic health'
    ]
  },
  {
    title: 'Environment',
    color: '#c2d6d6',
    icon: '🌿',
    description:
      'Pollution, water quality, and sun exposure damage hair and disrupt scalp microbiome.',
    treatment: [
      'Detoxifying buildup from scalp and strands',
      'Shielding hair from UV and environmental stress',
      'Nourishing scalp barrier with ayurvedic herbs'
    ]
  }
];

export default function CausesSection() {
  const [activeCause, setActiveCause] = useState(null);

  return (
    <View className="px-4 mt-8 mb-8">
      <Text className="text-xl font-semibold mb-2">What Causes Hair Loss?</Text>
      <Text className="text-gray-500 mb-4">
        Hair loss reasons are internal and external. Muditam helps treat these so you can achieve your desired hair goals.
      </Text>

      {/* Horizontal Scroll List */}
      <FlatList
        data={causes}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.title}
        contentContainerStyle={{ paddingRight: 0 }}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + SPACING}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="items-center rounded-lg py-6 px-4 mr-3"
            style={{
              backgroundColor: item.color,
              width: CARD_WIDTH
            }}
            onPress={() => setActiveCause(item)}
          >
            <Text className="text-3xl mb-3">{item.icon}</Text>
            <Text className="text-center font-semibold text-base">{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal */}
      <Modal visible={!!activeCause} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl p-6 max-h-[90%]">
            <TouchableOpacity onPress={() => setActiveCause(null)} className="absolute top-4 right-4 z-10">
              <Text className="text-xl">✕</Text>
            </TouchableOpacity>

            <Text className="text-lg font-semibold mb-2">What Causes Hair Loss?</Text>

            <View className="flex-row items-center mb-3">
              <Text style={{ fontSize: 24 }}>{activeCause?.icon}</Text>
              <Text className="ml-2 font-semibold text-base">{activeCause?.title}</Text>
            </View>

            <ScrollView>
              <Text className="bg-gray-100 p-3 rounded text-sm text-gray-700 mb-3">
                {activeCause?.description}
              </Text>

              <Text className="font-semibold text-red-600 mb-1">Muditam’s personalized treatment will work on:</Text>
              <View className="pl-3">
                {activeCause?.treatment.map((point, i) => (
                  <Text key={i} className="text-sm text-gray-800 mb-1">• {point}</Text>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
