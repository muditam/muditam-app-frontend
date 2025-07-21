import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  FlatList,
  Platform,
} from "react-native";


const { width: screenWidth } = Dimensions.get("window");


const testimonials = [
  {
    image:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/B-3.png?v=1751973930",
    name: "Rajesh Verma",
    city: "Lucknow",
    avatar:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-1.png?v=1751973981",
    description:
      "My sugar levels were out of control for a long time. Doctor was about to start insulin. After Muditam, I didn’t need it. Thank God I started on time. Now I feel very active, sugar is also in good control.",
    symptoms: ["Uncontrolled Sugars", "Fatigue", "Post Meal Sugar spikes", "Insulin Avoided"],
  },
  {
    image:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/B-1.png?v=1751973930",
    name: "Anita Nair",
    city: "Kochi",
    avatar:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/F-7.png?v=1751973981",
    description:
      "I was so tired of trying different things. Sugar used to stay high all the time. With Muditam, I finally saw it come under control. Feeling light and more active now.",
    symptoms: ["Low Energy", "Heaviness", "High Post-Meal Sugars"],
  },
  {
    image:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/B-4.png?v=1751973930",
    name: "Deepak Sharma",
    city: "Jaipur",
    avatar:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-9.png?v=1751973980",
    description:
      "My sugar was very high, my legs used to sleep if I ever used to sit down for more than 10 mins. No energy, wanted to sleep all day and only used to wake up for urination several times. Since I started this treatment, all my problems are gone. No ants running, more energy & sugar also in control. ",
    symptoms: ["Tingling Sensation", "High HbA1c", "Frequent Urination"],
  },
  {
    image:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/B-5.png?v=1751973930",
    name: "Meena Gupta",
    city: "Delhi",
    avatar:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/F-3.png?v=1751973980",
    description:
      "I started with Karela Jamun Fizz, then added Sugar Defend. Within 2 months, sugar fasting is 115 from 341. First time it’s that low in years. My digestion has also improved",
    symptoms: ["Bloating", "Indigestion", "High fasting sugar"],
  },
  {
    image:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/B-2.png?v=1751973930",
    name: "Suresh Iyer",
    city: "Mumbai",
    avatar:
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-3.png?v=1751973981",
    description:
      "Diabetes was taking away my quality of life. My cholesterol increased, i got fatty liver. I’ve been on medicines for 6 years. But with Muditam, I found a solution to not just sugar but all my health problems. All problems gone. ",
    symptoms: ["Uncontrolled Diabetes", "Fatty Liver", "Cholestrol"],
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
  // iOS shadow
  shadowColor: "#000",
  shadowOpacity: Platform.OS === "ios" ? 0.10 : 0,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4, 
  elevation: 2,
  marginTop: 20,
  marginBottom: 10,
},
  mainImage: {
    width: "100%",
    height: 170,
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



