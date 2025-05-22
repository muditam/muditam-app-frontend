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
    name: "Bilal Ahmed Shah",
    location: "Jaipur",
    rating: 5,
    fullText:
      "My friends used to tease me all the time about hair loss but now I am glad that my hair is full. I feel much more confident now. My family is also happy, a big thank you to the Muditam team.",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: "2",
    name: "Ravi Kumar",
    rating: 4,
    location: "Jaipur",
    fullText:
      "After trying so many products, Muditam finally gave me results. I can see real growth in just two months and I’m truly impressed by their plan and support.",
    avatar: "",
  },
  {
    id: "3",
    name: "Sneha R.",
    location: "Jaipur",
    rating: 5,
    fullText:
      "My hair feels so much healthier and thicker. Thanks to the doctor team and customized plan, I feel amazing and confident again!",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    id: "4",
    name: "Suresh Yadav",
    rating: 5,
    location: "Jaipur",
    fullText:
      "The support team is quick and helpful. Muditam works and it’s not a scam like others. I’ve recommended it to my friends as well.",
    avatar: "invalid-url",
  },
  {
    id: "5",
    name: "Pooja Singh",
    rating: 4,
    location: "Jaipur",
    fullText:
      "Great results in just one month. Their diet and supplement combo is perfect. And I love how convenient it is to follow their plan.",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
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
