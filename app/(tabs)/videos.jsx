import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { router } from "expo-router";
const { width, height } = Dimensions.get("window");
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionList } from "react-native";

const categorizedVideos = {
  "Customer Testimonial Clips": [
    {
      id: 1,
      title:
        "How to Manage Blood Sugar Naturally",
      url: "https://cdn.shopify.com/videos/c/o/v/eec1a9292b424341b1f9ae2c42fdb191.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/6_527d324c-da6b-4954-80f6-8280a0d6c300.png?v=1722316967",
    },
    {
      id: 2,
      title: "Top 5 Ayurvedic Tips for Diabetes",
      url: "https://cdn.shopify.com/videos/c/o/v/b5baf7888efb47599c3efb16f0a79a1e.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/3_0b563148-da79-4a3b-95e6-1f5720ab00a7.png?v=1722316842",
    },
    {
      id: 3,
      title: "What is HbA1c? Explained!",
      url: "https://cdn.shopify.com/videos/c/o/v/c1d7b744e7324a5e882bda4cd515780c.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/6_527d324c-da6b-4954-80f6-8280a0d6c300.png?v=1722316967",
    },
    {
      id: 4,
      title: "Beginner’s Guide to Ayurveda",
      url: "https://cdn.shopify.com/videos/c/o/v/67592f944522471c9c317aee972dccc3.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/6_527d324c-da6b-4954-80f6-8280a0d6c300.png?v=1722316967",
    },
    {
      id: 5,
      title: "Diabetes Myths Busted!",
      url: "https://cdn.shopify.com/videos/c/o/v/6c1d51e9d2644fd88c2ecb29e6393a6a.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/5_07a9d779-ebd5-4872-8760-13ec2b09f047.png?v=174704382",
    },
  ],
  "More About Your Treatment": [
    {
      id: 1,
      title: "How to Manage Blood Sugar Naturally",
      url: "https://cdn.shopify.com/videos/c/o/v/eec1a9292b424341b1f9ae2c42fdb191.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/ChatGPT_Image_Apr_15_2025_12_29_49_PM.png?v=1750508870",
    },
    {
      id: 2,
      title: "Top 5 Ayurvedic Tips for Diabetes",
      url: "https://cdn.shopify.com/videos/c/o/v/b5baf7888efb47599c3efb16f0a79a1e.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_5.png?v=1750508870",
    },
    {
      id: 3,
      title: "What is HbA1c? Explained!",
      url: "https://cdn.shopify.com/videos/c/o/v/c1d7b744e7324a5e882bda4cd515780c.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/ChatGPT_Image_Apr_8_2025_07_36_40_PM.png?v=1750508870",
    },
    {
      id: 4,
      title: "Beginner’s Guide to Ayurveda",
      url: "https://cdn.shopify.com/videos/c/o/v/67592f944522471c9c317aee972dccc3.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_5.png?v=1750508870",
    },
    {
      id: 5,
      title: "Diabetes Myths Busted!",
      url: "https://cdn.shopify.com/videos/c/o/v/6c1d51e9d2644fd88c2ecb29e6393a6a.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/5_07a9d779-ebd5-4872-8760-13ec2b09f047.png?v=174704382",
    },
  ],
  "Sugar Drop Tips": [
    {
      id: 1,
      title: "How to Manage Blood Sugar Naturally",
      url: "https://cdn.shopify.com/videos/c/o/v/eec1a9292b424341b1f9ae2c42fdb191.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/ChatGPT_Image_Apr_15_2025_12_29_49_PM.png?v=1750508870",
    },
    {
      id: 2,
      title: "Top 5 Ayurvedic Tips for Diabetes",
      url: "https://cdn.shopify.com/videos/c/o/v/b5baf7888efb47599c3efb16f0a79a1e.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_5.png?v=1750508870",
    },
    {
      id: 3,
      title: "What is HbA1c? Explained!",
      url: "https://cdn.shopify.com/videos/c/o/v/c1d7b744e7324a5e882bda4cd515780c.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/ChatGPT_Image_Apr_8_2025_07_36_40_PM.png?v=1750508870",
    },
    {
      id: 4,
      title: "Beginner’s Guide to Ayurveda",
      url: "https://cdn.shopify.com/videos/c/o/v/67592f944522471c9c317aee972dccc3.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_5.png?v=1750508870",
    },
    {
      id: 5,
      title: "Diabetes Myths Busted!",
      url: "https://cdn.shopify.com/videos/c/o/v/6c1d51e9d2644fd88c2ecb29e6393a6a.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/5_07a9d779-ebd5-4872-8760-13ec2b09f047.png?v=174704382",
    },
  ],
  "Simple Nutrition Tips": [
    {
      id: 1,
      title: "How to Manage Blood Sugar Naturally",
      url: "https://cdn.shopify.com/videos/c/o/v/eec1a9292b424341b1f9ae2c42fdb191.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/ChatGPT_Image_Apr_15_2025_12_29_49_PM.png?v=1750508870",
    },
    {
      id: 2,
      title: "Top 5 Ayurvedic Tips for Diabetes",
      url: "https://cdn.shopify.com/videos/c/o/v/b5baf7888efb47599c3efb16f0a79a1e.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_5.png?v=1750508870",
    },
    {
      id: 3,
      title: "What is HbA1c? Explained!",
      url: "https://cdn.shopify.com/videos/c/o/v/c1d7b744e7324a5e882bda4cd515780c.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/6_527d324c-da6b-4954-80f6-8280a0d6c300.png?v=1722316967",
    },
    {
      id: 4,
      title: "Beginner’s Guide to Ayurveda",
      url: "https://cdn.shopify.com/videos/c/o/v/67592f944522471c9c317aee972dccc3.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_5.png?v=1750508870",
    },
    {
      id: 5,
      title: "Diabetes Myths Busted!",
      url: "https://cdn.shopify.com/videos/c/o/v/6c1d51e9d2644fd88c2ecb29e6393a6a.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/5_07a9d779-ebd5-4872-8760-13ec2b09f047.png?v=174704382",
    },
  ],
  "Health Hacks": [
    {
      id: 1,
      title: "How to Manage Blood Sugar Naturally",
      url: "https://cdn.shopify.com/videos/c/o/v/eec1a9292b424341b1f9ae2c42fdb191.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/ChatGPT_Image_Apr_15_2025_12_29_49_PM.png?v=1750508870",
    },
    {
      id: 2,
      title: "Top 5 Ayurvedic Tips for Diabetes",
      url: "https://cdn.shopify.com/videos/c/o/v/b5baf7888efb47599c3efb16f0a79a1e.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_5.png?v=1750508870",
    },
    {
      id: 3,
      title: "What is HbA1c? Explained!",
      url: "https://cdn.shopify.com/videos/c/o/v/c1d7b744e7324a5e882bda4cd515780c.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/6_527d324c-da6b-4954-80f6-8280a0d6c300.png?v=1722316967",
    },
    {
      id: 4,
      title: "Beginner’s Guide to Ayurveda",
      url: "https://cdn.shopify.com/videos/c/o/v/67592f944522471c9c317aee972dccc3.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_5.png?v=1750508870",
    },
    {
      id: 5,
      title: "Diabetes Myths Busted!",
      url: "https://cdn.shopify.com/videos/c/o/v/6c1d51e9d2644fd88c2ecb29e6393a6a.mp4",
      thumbnail: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/5_07a9d779-ebd5-4872-8760-13ec2b09f047.png?v=174704382",
    },
  ],
};


export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState(null);


  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
  const [visibleIndex, setVisibleIndex] = useState(null);


  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index);
    }
  });


  const insets = useSafeAreaInsets();

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 80 });

  const handlePress = (category, index) => {
    setSelectedCategory(category);
    setSelectedVideoIndex(index);
    setVisibleIndex(index);
  };

  const closeModal = () => {
    setSelectedCategory(null);
    setSelectedVideoIndex(null);
    setVisibleIndex(null);
  };

  const renderVideoCard = ({ item, index, category }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePress(category, index)}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={{
          uri: item.thumbnail,
        }}
        style={styles.thumbnail}
        imageStyle={{ borderRadius: 12 }}
      />
    </TouchableOpacity>
  );

  const renderReel = useCallback(
    ({ item, index }) => (
      <ReelVideo video={item} isActive={index === visibleIndex} />
    ),
    [visibleIndex]
  );

  const ReelVideo = React.memo(({ video, isActive }) => (
    <View style={styles.reelVideo}>
      <Video
        source={{ uri: video.url }}
        resizeMode="cover"
        style={styles.videoPlayer}
        shouldPlay={isActive}
        isLooping
      />
      <View style={styles.videoInfo}>
        <Image
          source={{
            uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Muditam.webp?v=1744890066",
          }}
          style={styles.logo}
        />
        <Text style={styles.videoTitle}>{video.title}</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="thumbs-up-outline" size={34} color="#fff" />
            <Text style={styles.iconLabel}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="thumbs-down-outline" size={34} color="#fff" />
            <Text style={styles.iconLabel}>Dislike</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-social-outline" size={34} color="#fff" />
            <Text style={styles.iconLabel}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ));


  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="black"
            onPress={() => router.back()}
          />
          <Text style={styles.headerText}>Insights</Text>
        </View>
        {Object.entries(categorizedVideos).map(([category, videos]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <FlatList
              data={videos}
              horizontal
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) =>
                renderVideoCard({ item, index, category })
              }
              showsHorizontalScrollIndicator={false}
            />
          </View>
        ))}
      </ScrollView>


      {selectedCategory !== null && selectedVideoIndex !== null && (
        <Modal visible animationType="slide">
          <View style={{ flex: 1, backgroundColor: "#000" }}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={30} color="#fff" />
            </TouchableOpacity>
            <FlatList
              vertical
              data={categorizedVideos[selectedCategory]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderReel}
              pagingEnabled
              snapToInterval={height}
              decelerationRate="fast"
              removeClippedSubviews={true}
              showsVerticalScrollIndicator={false}
              initialScrollIndex={selectedVideoIndex}
              getItemLayout={(data, index) => ({
                length: height,
                offset: height * index,
                index,
              })}
              onViewableItemsChanged={onViewableItemsChanged.current}
              viewabilityConfig={viewabilityConfig.current}
              windowSize={5}
              initialNumToRender={2}
              maxToRenderPerBatch={2}
            />
          </View>
        </Modal>

      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    // paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginTop: 26,
  },


  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 8,
  },
  categoryContainer: {
    // marginBottom:16,
    marginHorizontal: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
    marginBottom: 10,
  },
  card: {
    width: 160,
    marginLeft: 10,
    marginBottom: 16,
    borderRadius: 11,
    backgroundColor: "#D9D9D9",
  },
  thumbnail: {
    width: "100%",
    height: 280,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 50,
    padding: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 10,
    color: "white",
    position: "absolute",
    zIndex: 1,
    bottom: 0,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  modalContainer: {
    position: 'absolute', height, width
  },
  closeButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },


  videoInfo: {
    width: width,
    display: "flex",
    flexDirection: "row",
    paddingLeft: 8,
    paddingRight: 20,
    alignItems: "center",
    position: "absolute",
    backgroundColor: "#000",
    paddingVertical: 10,
    bottom: 0,
    paddingBottom: Platform.OS === 'android' ? 62 : 0,
  },
  videoPlayer: {
    width: width,
    height: height,
  },
  videoTitle: {
    justifyContent: "center",
    display: "flex",
    color: "white",
    fontSize: 18,
    paddingLeft: 8,
    paddingRight: 30,
  },
  reelVideo: {
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 50,
    display: "flex",
    justifyContent: "center",
  },


  iconContainer: {
    position: "absolute",
    right: 16,
    bottom: Platform.OS === 'android' ? 150 : 98,
    alignItems: "center",
  },
  iconButton: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 500,
    marginTop: 2,
  },
});
