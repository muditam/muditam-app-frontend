import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface LegalModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  lastUpdated: string;
  content: string;
}

export default function LegalModal({ visible, onClose, title, lastUpdated, content }: LegalModalProps) {
  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-2xl max-h-[90%] p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-semibold">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-xl">✕</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-gray-500 mb-3">Last Updated on {lastUpdated}</Text>
          <ScrollView className="mb-4">
            <Text className="text-base text-gray-700">{content}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
