import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = 18; // Wider, so "10", "11", "12" fit on one line

const generateHba1cRange = () => {
  const range = [];
  for (let i = 5; i <= 12; i += 0.1) {
    range.push(parseFloat(i.toFixed(1)));
  }
  return range;
};

const getColorForValue = (value) => {
  const percent = (value - 5) / (12 - 5);
  const r = Math.round(255 * percent);
  const g = Math.round(255 * (1 - percent));
  return `rgb(${r},${g},0)`;
};

export default function HbA1cScreen() {
  const router = useRouter();
  const flatListRef = useRef();
  const hba1cRange = generateHba1cRange();
  const [selected, setSelected] = useState(8.0);
  const lastIndexRef = useRef(null);

  useEffect(() => {
    const index = hba1cRange.findIndex((v) => v === selected);
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: false });
      lastIndexRef.current = index;
    }
  }, []);

  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / ITEM_WIDTH);
    const clampedIndex = Math.max(0, Math.min(index, hba1cRange.length - 1));
    if (lastIndexRef.current !== clampedIndex) {
      setSelected(hba1cRange[clampedIndex]);
      lastIndexRef.current = clampedIndex;
      Haptics.selectionAsync();
    }
  };

  const handleNext = async () => {
    try {
      await AsyncStorage.setItem('hba1c', JSON.stringify(selected));

      const progressStr = await AsyncStorage.getItem('quizProgress');
      const progress = progressStr ? JSON.parse(progressStr) : null;
      const resumeIndex = Array.isArray(progress?.answers)
        ? progress.answers.length
        : 0;

      // NOTE: You must define `questions` array somewhere globally for this to work
      if (typeof questions !== "undefined" && resumeIndex >= questions.length) {
        router.replace('/home');  
      } else {
        router.replace(`/quiz/${resumeIndex || 0}`);
      }
    } catch (e) {
      console.error('Failed to save HbA1c or navigate:', e);
      router.replace('/quiz/0');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        <ImageBackground
          source={{
            uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_2_3f1a9fbb-3859-430c-96e3-1f78f9efc641.png?v=1747201712',
          }}
          style={styles.header}
          resizeMode="cover"
        >
          <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 10 }}>
            <Feather name="arrow-left" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>HbA1c</Text>
          <Pressable onPress={() => router.replace('/home')} style={{ paddingHorizontal: 10 }}>
            <Feather name="x" size={24} color="white" />
          </Pressable>
        </ImageBackground>

        <Text style={styles.heading}>What is your latest HbA1c level?</Text>

        <View style={styles.displayBox}>
          <Text style={[styles.selectedValue, { color: getColorForValue(selected) }]}>
            {selected}%
          </Text>

          <FlatList
            ref={flatListRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={hba1cRange}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({
              length: ITEM_WIDTH,
              offset: ITEM_WIDTH * index,
              index,
            })}
            keyExtractor={(item) => item.toString()}
            contentContainerStyle={{
              paddingHorizontal: (width - ITEM_WIDTH) / 2,
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => {
              const isMajor = Number(item) % 1 === 0;
              return (
                <View style={styles.tickContainer}>
                  {isMajor && (
                    <Text style={styles.tickLabel}>
                      {item}
                    </Text>
                  )}
                  <View
                    style={{
                      height: isMajor ? 24 : 12,
                      width: isMajor ? 2 : 1,
                      backgroundColor: '#444',
                      marginTop: 2,
                    }}
                  />
                </View>
              );
            }}
          />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>

        <View style={styles.tipBox}>
          <Text style={styles.tipHeading}>Did you know?</Text>
          <Text style={styles.tipText}>
            The higher the HbA1c, the greater the risk of developing diabetes complications like kidney disease and heart disease.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10, 
    height: 100,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: '600',
    color: 'white', 
  },
  heading: {
    fontSize: 18,
    marginBottom: 30,
    fontWeight: '500',
    color: '#2E2E2E',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  displayBox: {
    backgroundColor: '#e0f5d8',
    paddingVertical: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    marginHorizontal: 16,
  },
  selectedValue: {
    fontSize: 44,
    fontWeight: '700',
    marginBottom: 10,
  },
  tickContainer: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tickLabel: {
    fontSize: 13,
    color: '#444',
    minWidth: 24, 
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: '#543087',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
    marginHorizontal: 16,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipBox: {
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    padding: 16,
    borderTopWidth: 4,
    borderTopColor: '#9D57FF',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  tipHeading: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    color: '#444',
  },
});
