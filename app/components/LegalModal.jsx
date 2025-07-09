import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

interface LegalModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  lastUpdated: string;
  content: string;
}

export default function LegalModal({
  visible,
  onClose,
  title,
  lastUpdated,
  content,
}: LegalModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl max-h-[90%] p-4">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xl font-semibold">{title}</Text>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 4 }}
              >
                <Text className="text-2xl">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Last Updated */}
            <Text className="text-sm text-gray-500 mb-3">
              Last Updated on {lastUpdated}
            </Text>

            {/* Content */}
            <ScrollView className="mb-4">
              <Text className="text-base text-gray-700">{content}</Text>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
