import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";


const { width } = Dimensions.get("window");


const reviews = [
  {
    id: "1",
    name: "Vikas, 60",
    location: "Jaipur",
    rating: 5,
    fullText:
      "I had been diabetic for 7 years, and nothing was really working. But after starting Muditam’s supplements and following their diet, my sugar levels started coming down within a month. I feel more energetic and finally hopeful.",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-6.png?v=1751975429",
  },
  {
    id: "2",
    name: "Neha, 52",
    rating: 5,
    location: "Mumbai",
    fullText:
      "I started Karela Jamun Fizz along with the diet plan, and it became a part of my morning routine. My sugar started to remain more stable. I don’t feel heavy or tired after meals anymore. Feels like my body is finally recovering!",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/F-6.png?v=1751975430",
  },
  {
    id: "3",
    name: "Manoj, 58",
    location: "Lucknow",
    rating: 5,
    fullText:
      "Medicine to shuru se jab se sugar hui h kha hi rha tha lekin sugar jyada hi aati thi. Jab maine Muditam ka supplement liya aur saath mein diet follow kiya tab jaake farak dikhna shuru hua. Sugar readings ab stable hai. Thakaan bhi kam ho gayi hai.",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-7.png?v=1751975430",
  },
  {
    id: "4",
    name: "Priya, 55",
    rating: 5,
    location: "Bangaluru",
    fullText:
      "I’ve tried many things over the years, but no change in sugar. I started treatment for my high sugars with Muditam last year and now my sugar is absolutely normal. I take only 1 tablet daily and the regular follow-ups helps me to stay on track.",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/F-2.png?v=1751975430",
  },
  {
    id: "5",
    name: "Alok, 61",
    rating: 5,
    location: "Chandigarh",
    fullText:
      "arlier, even after eating small meals, no rice, my sugar would still rise. But with Muditam’s plan - right supplements and food changes - things are all better now. My HbA1c was 9.4% when I started, and in 2 months it is down to 8.1% and I’m planning to continue it until it comes below 7%.",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-4.png?v=1751975430",
  },
  {
    id: "6",
    name: "Kamla, 63",
    rating: 5,
    location: "Indore",
    fullText:
      "Before Muditam, sugar always up-down. Now I take my supplement regular and eat what expert said. Feeling more strong, not sleepy after lunch. Sugar also coming in better range.",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/F-5.png?v=1751975430",
  },
  {
    id: "7",
    name: "Sanjana",
    rating: 5,
    location: "Delhi",
    fullText:
      "I wasn’t even looking for a solution when a friend told me about Muditam. I just gave it a try casually. But within 2 months, my sugar came down, and that tired feeling went away. I did research after using them, all the ingredients they have used are backed by strong scientific evidence. And IT WORKS!! This is the Best Solution for Diabetes management!!",
    avatar: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/F-4.png?v=1751975430",
  },
];


function Avatar({ uri }) {
  const [error, setError] = useState(false);


  if (!uri || error) {
    return (
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 24,
          backgroundColor: "#ccc",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <MaterialIcons name="person" size={30} color="#666" />
      </View>
    );
  }


  return (
    <Image
      source={{ uri }}
      style={{
        width: 50,
        height: 50,
        borderRadius: 24,
        marginRight: 12,
      }}
      onError={() => setError(true)}
      resizeMode="cover"
    />
  );
}


export default function ReviewsSection() {
    // const [selectedReview, setSelectedReview] = useState(null);


  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);


  const cardWidth = 324;


  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    setActiveIndex(index);
  };


  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };


  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ paddingBottom: 80 }}>
        <FlatList
          ref={flatListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={reviews}
          keyExtractor={(item) => item.id}
          onScroll={onScroll}
          scrollEventThrottle={16}
          pagingEnabled={false}
          contentContainerStyle={{
            paddingLeft: 18,
            paddingBottom: 16,
          }}
          renderItem={({ item }) => (
            <View
              className="bg-white rounded-xl p-4 w-72 mr-4"
              style={{
                borderWidth: 0.5,
                borderColor: "#6C6C6C",
                width: cardWidth,
                height: 320,
                marginRight:18,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <Avatar uri={item.avatar} />
                <View>
                  <Text style={{ fontWeight: "600", color: "#000" }}>{item.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={18}
                      color="#ccc"
                    />
                    <Text style={{ color: "#777", marginLeft: 4 }}>{item.location}</Text>
                  </View>
                </View>
              </View>


              <View style={{ height: 1, backgroundColor: "#C0C0C0", marginBottom: 12 }} />


              <View style={{ flexDirection: "row", marginBottom: 8 }}>
                {[...Array(item.rating)].map((_, i) => (
                  <MaterialIcons key={i} name="star" size={22} color="orange" />
                ))}
              </View>


              <Text style={{ lineHeight: 20, fontSize: 14, color: "#000" }}>
                {item.fullText}
              </Text>
            </View>
          )}
        />


        {/* Dots */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
          {reviews.map((_, index) => (
            <TouchableOpacity key={index} onPress={() => scrollToIndex(index)}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: activeIndex === index ? "#868686" : "#D9D9D9",
                  marginHorizontal: 5,
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
