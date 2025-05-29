import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  FlatList,
} from "react-native";


const { width: screenWidth } = Dimensions.get("window");


const testimonials = [
  {
    image:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_2025_05_01T06_36_10_887Z.png?v=1746081456",
    name: "Rajesh Verma",
    city: "Lucknow",
    avatar:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Contemplative_Gaze_Against_Red_Brick_Wall.png?v=1746525897",
    description:
      "I had been struggling with high sugar levels and fatigue for over 5 years. After following the Muditam plan, my sugar is under control and my energy levels are back. I feel like myself again.",
    symptoms: ["Fatigue", "Frequent urination", "Sugar spikes"],
  },
  {
    image:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/IMG_2294.heic?v=1746076533",
    name: "Anita Nair",
    city: "Kochi",
    avatar:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Smiling_Outdoors_with_Greenery_Background.png?v=1746516563",
    description:
      "Muditam’s approach felt very natural and easy to follow. My sugar levels have improved and so has my digestion. I no longer get acidity after meals!",
    symptoms: ["Acidity", "Bloating", "High post-meal sugars"],
  },
  {
    image:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_2025_05_01T06_36_10_887Z.png?v=1746081456",
    name: "Deepak Sharma",
    city: "Jaipur",
    avatar:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Contemplative_Gaze_Against_Red_Brick_Wall.png?v=1746525897",
    description:
      "I never believed natural supplements could help until I tried Muditam. With small lifestyle changes and the kit, my sugar dropped and I lost weight too.",
    symptoms: ["Weight Loss", "High HbA1c", "Sugar cravings"],
  },
  {
    image:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_2025_04_30T13_40_02_784Z.png?v=1746076534",
    name: "Meena Gupta",
    city: "Delhi",
    avatar:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Smiling_Outdoors_with_Greenery_Background.png?v=1746516563",
    description:
      "The team guided me really well. The kit is simple, and the diet tips actually helped. My sugar is stable now and I sleep better too.",
    symptoms: ["Poor sleep", "Mood swings", "High fasting sugar"],
  },
];


const loopedData = [
  testimonials[testimonials.length - 1],
  ...testimonials,
  testimonials[0],
];


const SPACING = 4;
const CARD_WIDTH = screenWidth * 0.76;
const ITEM_SIZE = CARD_WIDTH + SPACING;


const TestimonialCard = ({ item, scale }) => (
  <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
    <Image source={{ uri: item.image }} style={styles.mainImage} />
    <View style={{ paddingHorizontal: 16 }}>
      <View style={styles.profileContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <Text style={styles.name}>
          {item.name}, {item.city}
        </Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.improvedSymptomsLabel}>Improved Symptoms</Text>
      <View style={styles.symptomsContainer}>
        {item.symptoms.map((symptom, idx) => (
          <Text key={idx} style={styles.symptomTag}>
            {symptom}
          </Text>
        ))}
      </View>
    </View>
  </Animated.View>
);


export default function RealJourneysSlider() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(1);


  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: ITEM_SIZE,
        animated: false,
      });
    }, 0);
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;


      flatListRef.current?.scrollToOffset({
        offset: nextIndex * ITEM_SIZE,
        animated: true,
      });


      setActiveIndex(nextIndex);
    }, 5000);


    return () => clearInterval(interval);
  }, [activeIndex]);


  const handleMomentumEnd = (e) => {
    let index = Math.round(e.nativeEvent.contentOffset.x / ITEM_SIZE);


    if (index === 0) {
      flatListRef.current?.scrollToOffset({
        offset: (testimonials.length) * ITEM_SIZE,
        animated: false,
      });
      setActiveIndex(testimonials.length);
    } else if (index === loopedData.length - 1) {
      flatListRef.current?.scrollToOffset({
        offset: ITEM_SIZE,
        animated: false,
      });
      setActiveIndex(1);
    } else {
      setActiveIndex(index);
    }
  };


  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>Real Journeys. Real Results.</Text>
      <Animated.FlatList
        ref={flatListRef}
        data={loopedData}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_SIZE}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - CARD_WIDTH) / 2,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * ITEM_SIZE,
            index * ITEM_SIZE,
            (index + 1) * ITEM_SIZE,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: "clamp",
          });


          return <TestimonialCard item={item} scale={scale} />;
        }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginVertical:16
  },
  header: {
    fontSize: 24,
    fontWeight: "500",
    fontFamily: "Poppins",
    textAlign: "center",
  },
  card: {
  width: CARD_WIDTH,
  marginHorizontal: SPACING / 2,
  backgroundColor: "#fff",
  borderRadius: 16,
  shadowColor: "#000",
  shadowOpacity: 0.9,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 2,
  marginTop: 20,
  marginBottom: 10,
},
 
  mainImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: "cover",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins",
    marginLeft: 16,
  },
  description: {
    fontSize: 14,
    color: "#5B5B5B",
    marginTop: 10,
    fontFamily: "Poppins",
    lineHeight: 20,
  },
  improvedSymptomsLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    fontFamily: "Poppins",
  },
  symptomsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  symptomTag: {
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontFamily: "Poppins",
    marginRight: 6,
    marginBottom: 6,
  },
});



