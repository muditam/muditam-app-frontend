import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { router } from "expo-router";
import Modal from "react-native-modal";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";


const { width, height } = Dimensions.get("window");


// --- categorizedVideos data unchanged (paste yours here) ---
const categorizedVideos = {
  "Health Hacks": [
    {
      id: 1,
      title: "Top 10 Sugar Control Tips You Must Know",
      url: "https://cdn.shopify.com/videos/c/o/v/204cd2478021457b8ca546af8d24be0e.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/1_1_e235442d-c20d-46bc-836f-afd5d7691965.png?v=1752239463",
    },
    {
      id: 2,
      title:
        "Shocking Truth About Bread & Sugar! You eat more sugar than you think.",
      url: "https://cdn.shopify.com/videos/c/o/v/8eab9daac59447c380452d86c9afd0d2.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/3_1_a14a09eb-92e4-4f9b-a838-7f0c7410b9de.png?v=1752239641",
    },
    {
      id: 3,
      title:
        "Stop Pricking Fingers Like This! Most people don’t know the correct spot.",
      url: "https://cdn.shopify.com/videos/c/o/v/3088c003d6db46bfa3cd528f1d69e9e0.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/4_77139b79-e4fa-4c62-9dbe-1a2281c43d7c.png?v=1752239466",
    },
  ],
  "Simple Nutrition Tips": [
    {
      id: 1,
      title: "Breakfast Habit That Spikes Your Sugar!",
      url: "https://cdn.shopify.com/videos/c/o/v/3dbff512f46f4ca6a24c44008fbe827d.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/6_7e2876c5-c7d3-49e3-9cd8-3d6c06ebbe32.png?v=1752239961",
    },
    {
      id: 2,
      title: "These Fruits Spike Your Sugar Levels!",
      url: "https://cdn.shopify.com/videos/c/o/v/91ddd6a33602436c906f8f5b75465852.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/7_dd90ee93-1750-474d-9502-5612a1c836a7.png?v=1752239960",
    },
    {
      id: 3,
      title: "Not All Flours Are Sugar-Friendly!",
      url: "https://cdn.shopify.com/videos/c/o/v/7da7b0c8569249b38fc199298c38dc36.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/8_f014d8b2-294f-4ffd-8c13-c28ac8ce86fa.png?v=1752239975",
    },
    {
      id: 4,
      title: "Is Brown Rice Really Better for Sugar?",
      url: "https://cdn.shopify.com/videos/c/o/v/10aa2130829341de819217e1ec94ec1e.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/9_b7e6279d-cb8e-4cfa-bdf9-308bf23956e9.png?v=1752239975",
    },
    {
      id: 5,
      title: "Not All Fruits Spike Sugar!",
      url: "https://cdn.shopify.com/videos/c/o/v/c5adb2dd9f3949eb9b761ba8b38608a9.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/10_b92b1b9e-1815-4dcb-b174-186d87394fa3.png?v=1752239975",
    },
  ],
  Diabetes: [
    {
      id: 1,
      title: "Have Family History of Diabetes?",
      url: "https://cdn.shopify.com/videos/c/o/v/2f6515f7ab654e4aa6b6c228ff502934.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/2_2_13635ec1-2e0d-4e8c-a714-3bab150812b1.png?v=1752240085",
    },
    {
      id: 2,
      title: "This Is Why Sugar Spikes Differ!",
      url: "https://cdn.shopify.com/videos/c/o/v/c8c382d94c9144d588a369f8ff461baa.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/5_2_486b82a8-4d65-424f-9dbb-cfc2d5cb0f7d.png?v=1752240084",
    },
  ],
  "Muditam Treatment": [
    {
      id: 1,
      title: "If You Think We’re Just About Sugar Control...Watch this. ",
      url: "https://cdn.shopify.com/videos/c/o/v/dfad618874114798867c8c2227e8954f.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/1_2_4834b9b2-9b3d-4d3c-a7db-3936215d967f.png?v=1752240393",
    },
    {
      id: 2,
      title: "If You Know Us Only for Karela Jamun Fizz… You’re missing out",
      url: "https://cdn.shopify.com/videos/c/o/v/803897e25b1241a7b4d06f7a8dfad2b1.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/2_3.png?v=1752240393",
    },
  ],
  Testimonial: [
    {
      id: 1,
      title: "Sugar Kam Karni Thi Naturally",
      url: "https://cdn.shopify.com/videos/c/o/v/ba854ce719414dbcbafa599094a5556c.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/2_4.png?v=1752240562",
    },
    {
      id: 2,
      title: "4-5 saal se diabetes tha…",
      url: "https://cdn.shopify.com/videos/c/o/v/8a4485511dd14056b3cca4023926f227.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/3_2_c9ad6605-4ebc-4381-8b5a-726c3d95f1c9.png?v=1752240561",
    },
    {
      id: 3,
      title: "Diabetes ke kaaran hamesha jhanjhanahat",
      url: "https://cdn.shopify.com/videos/c/o/v/0d60123acab64ef9bc7940c308426d14.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/7_1_b33a6bac-6989-49e4-9c23-cb9b1e799ad3.png?v=1752240614",
    },
    {
      id: 4,
      title:
        "Duniya ke baaki logo ki tarah main bhi sugar se kaafi pareshan tha",
      url: "https://cdn.shopify.com/videos/c/o/v/b781fd7daa2c4d7990733017f6a26db6.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/5_3_82f38ff5-0836-43c0-a678-c4fc35df93e5.png?v=1752240614",
    },
    {
      id: 5,
      title: "Dawaiyon se leke gharelu nuskhe tak sab try kiya…",
      url: "https://cdn.shopify.com/videos/c/o/v/e24822634fd245ce95fb001fff8c9e63.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/6_1_38d917d3-1461-4d5f-960a-4e2a57134669.png?v=1752240614",
    },
    {
      id: 6,
      title: "Sugar ne thaka diya tha…",
      url: "https://cdn.shopify.com/videos/c/o/v/1bf2fd885b98438faf6b8c88ae023c96.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/7_1_b33a6bac-6989-49e4-9c23-cb9b1e799ad3.png?v=1752240614",
    },
    {
      id: 7,
      title: "Roz baar-baar urine jaana…",
      url: "https://cdn.shopify.com/videos/c/o/v/978df695203243af832b64f98d77cb33.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/8_1.png?v=1752240614",
    },
    {
      id: 8,
      title: "Meetha chhor diya, nuskhe bhi try kiye…",
      url: "https://cdn.shopify.com/videos/c/o/v/80fa6c3a93a24dd1aedfbea14b999c43.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/9_1.png?v=1752240614",
    },
    {
      id: 9,
      title: "Honestly, mujhe nahi laga tha Facebook pe mila",
      url: "https://cdn.shopify.com/videos/c/o/v/1663a5732c56488487ce947f59fc4dd9.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/10_1.png?v=1752240613",
    },
    {
      id: 10,
      title: "30 saal purani sugar thi… par pehli baar mila itna aaram",
      url: "https://cdn.shopify.com/videos/c/o/v/ae32d0eb3209467c807b843839970449.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/11_93ea02bf-a029-461b-b638-32d1c9729819.png?v=1752240614",
    },
    {
      id: 11,
      title: "Jab sugar kabhi 350 se neeche nahi aayi…",
      url: "https://cdn.shopify.com/videos/c/o/v/9e384cba55c74388b14ed3a56cbf122f.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/12_97a08575-7777-46c0-b111-5542ac93881c.png?v=1752240614",
    },
  ],
  "Karela Jamun Fizz": [
    {
      id: 1,
      title: "Struggling with High HbA1c?",
      url: "https://cdn.shopify.com/videos/c/o/v/943ec08f535445c483be4f2e9f3f93ce.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/1_789d6a27-0336-42fc-b066-c069841dc35a.png?v=1752241744",
    },
    {
      id: 2,
      title: "Medicines Not Working on HbA1c?",
      url: "https://cdn.shopify.com/videos/c/o/v/5ad443e6dbe348ea98ba1dfb401ac258.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/2_6c97940e-77ca-4a27-802a-3dd4a1009ae5.png?v=1752241743",
    },
    {
      id: 3,
      title: "Want to Lower HbA1c Naturally?",
      url: "https://cdn.shopify.com/videos/c/o/v/76761910fd1d45a48663b0bff6d33860.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/3_092eaef0-9d73-48f6-b2fc-5b0d78182ee6.png?v=1752241743",
    },
    {
      id: 4,
      title: "Fast Sugar Drops Don't Last!",
      url: "https://cdn.shopify.com/videos/c/o/v/94c2f3b6032046648436fc1a07fba574.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/4_9ac73857-3bdd-4a11-a952-5f3c58496a56.png?v=1752241743",
    },
    {
      id: 5,
      title: "Why Take 3 Different Remedies?",
      url: "https://cdn.shopify.com/videos/c/o/v/b485aa97490743fd8901ae1a03aa2a6d.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/5_4b0e29ef-1cad-4d5e-85ac-b209d3ea57ee.png?v=1752241743",
    },
    {
      id: 6,
      title: "From Bitter Remedies to Real Results!",
      url: "https://cdn.shopify.com/videos/c/o/v/2527ede25632467f932280cd5801417b.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/6_7b285149-31e8-4e53-a71e-5de03c553767.png?v=1752241743",
    },
    {
      id: 7,
      title: "Top 3 Juices for Sugar Control!",
      url: "https://cdn.shopify.com/videos/c/o/v/355914930792466a845deff45ae3ac19.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/7_df3df69b-9591-4c53-9d32-dc6b67d0261f.png?v=1752241743",
    },
    {
      id: 8,
      title: "11 Powerful Herbs in 1 Sugar Control Tablet. ",
      url: "https://cdn.shopify.com/videos/c/o/v/0e97b6a1967d43069a4586fa059426ea.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0727/5108/7844/files/8_2.png?v=1752325523000",
    },
  ],
  "Liver Fix": [
    {
      id: 1,
      title: "Liver Reports Red? SGPT-SGOT Control Ka Trusted Tareeka",
      url: "https://cdn.shopify.com/videos/c/o/v/7777293648614755a46711327fe51b5a.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/1_4.png?v=1752242256",
    },
    {
      id: 2,
      title: "Fatty Liver? Try This 10-Herb Ayurvedic Formula That Works",
      url: "https://cdn.shopify.com/videos/c/o/v/db8c46b717e54308ac2a9161e77812bb.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/2_5.png?v=1752242256",
    },
    {
      id: 3,
      title: "Don’t Wait for Grade 2 or 3 - Treat Fatty Liver Early",
      url: "https://cdn.shopify.com/videos/c/o/v/c618b9e938714603af45702af518f1aa.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/3_3.png?v=1752242256",
    },
    {
      id: 4,
      title:
        "These Hidden Signs Could Mean Fatty Liver! Catch it early before it worsens.",
      url: "https://cdn.shopify.com/videos/c/o/v/b92f117aba9f48c291af45144fbfdbd3.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/4_2_8a4f4732-eb21-491f-89b9-d75226f5f7ae.png?v=1752242256",
    },
    {
      id: 5,
      title: "Fatty Liver Ke Chakkar Mein Apne Favourite Foods",
      url: "https://cdn.shopify.com/videos/c/o/v/7834cc140fe14d80a37f9756b4a83836.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/5_4.png?v=1752242256",
    },
  ],
  Supplements: [
    {
      id: 1,
      title: "How to Manage Blood Sugar Naturally",
      url: "https://cdn.shopify.com/videos/c/o/v/85d03f9b985b4c40bd5986aae0929cad.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/6_527d324c-da6b-4954-80f6-8280a0d6c300.png?v=1722316967",
    },
    {
      id: 2,
      title: "Top 5 Ayurvedic Tips for Diabetes",
      url: "https://cdn.shopify.com/videos/c/o/v/f2af7ed73649450dab62f6e3d7eeb061.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/3_0b563148-da79-4a3b-95e6-1f5720ab00a7.png?v=1722316842",
    },
    {
      id: 3,
      title: "What is HbA1c? Explained!",
      url: "https://cdn.shopify.com/videos/c/o/v/85d03f9b985b4c40bd5986aae0929cad.mp4",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/6_527d324c-da6b-4954-80f6-8280a0d6c300.png?v=1722316967",
    },
  ],
};


export default function Videos() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
  const [visibleIndex, setVisibleIndex] = useState(null);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();


  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index);
    }
  });


  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 80 });


  const handlePress = (category, index) => {
    const videos = categorizedVideos[category];
    if (!videos || index < 0 || index >= videos.length) return;
    setSelectedCategory(category);
    setSelectedVideoIndex(index);
    setVisibleIndex(index);
  };


  const closeModal = () => {
    setSelectedCategory(null);
    setSelectedVideoIndex(null);
    setVisibleIndex(null);
  };


  const onScrollToIndexFailed = useCallback((info) => {
    flatListRef.current?.scrollToIndex({ index: 0, animated: false });
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    }, 50);
  }, []);


  const canOpenModal =
    selectedCategory !== null &&
    selectedVideoIndex !== null &&
    Array.isArray(categorizedVideos[selectedCategory]) &&
    selectedVideoIndex >= 0 &&
    selectedVideoIndex < categorizedVideos[selectedCategory].length;


  const renderVideoCard = ({ item, index, category }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePress(category, index)}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={{ uri: item.thumbnail }}
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


  const ReelVideo = React.memo(({ video, isActive }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const videoRef = useRef(null);
    const insets = useSafeAreaInsets();


    const togglePlayPause = () => {
      setIsPaused((prev) => !prev);
      setShowControls(true);
      setTimeout(() => setShowControls(false), 2000);
    };


    useEffect(() => {
      if (!isActive) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    }, [isActive]);


    return (
      <View style={styles.reelContainer}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={togglePlayPause}
        >
          <Video
            ref={videoRef}
            source={{ uri: video.url }}
            resizeMode="contain"
            style={styles.videoPlayer}
            shouldPlay={isActive && !isPaused}
            isLooping
            paused={isPaused}
          />
        </TouchableOpacity>


        {/* Play/Pause Button */}
        {showControls && (
          <View style={styles.playPauseOverlay}>
            <Ionicons
              name={isPaused ? "play-circle-outline" : "pause-circle-outline"}
              size={72}
            />
          </View>
        )}


        {/* Floating action icons */}
        <View style={[styles.iconContainer, { bottom: 130 + insets.bottom }]}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="thumbs-up-outline" size={30} color="#fff" />
            <Text style={styles.iconLabel}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-social-outline" size={30} color="#fff" />
            <Text style={styles.iconLabel}>Share</Text>
          </TouchableOpacity>
        </View>


        {/* Bottom info bar */}
        <View style={[styles.videoInfo, { paddingBottom: insets.bottom + 8 }]}>
          <Image
            source={{
              uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Muditam.webp?v=1744890066",
            }}
            style={styles.logo}
          />
          <View style={{ flex: 1, paddingHorizontal: 8 }}>
            <Text style={styles.videoTitle}>{video.title}</Text>
          </View>
        </View>
      </View>
    );
  });


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
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


      <Modal
        isVisible={canOpenModal}
        onBackdropPress={closeModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        margin="0"
        useNativeDriver
        propagateSwipe
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <TouchableOpacity onPress={closeModal} style={[styles.closeButton]}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          {canOpenModal && (
            <FlatList
              ref={flatListRef}
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
              onScrollToIndexFailed={onScrollToIndexFailed}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 8,
  },
  categoryContainer: {
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
    position: "absolute",
    height,
    width,
  },
  fullscreenModal: {
    margin: 0,
    padding: 0,
    backgroundColor: "black",
    zIndex: 999,
  },


  closeButton: {
    position: "absolute",
    left: 20,
    top:Platform.OS==="ios"?50:0,
    zIndex: 10,
  },


  logo: {
    width: 50,
    height: 50,
    borderRadius: 50,
    display: "flex",
    justifyContent: "center",
  },


  reelContainer: {
    width,
    height,
    backgroundColor: "#000",
    position: "relative",
  },


  videoPlayer: {
    ...StyleSheet.absoluteFillObject,
  },


  videoInfo: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },


  videoTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    flexShrink: 1,
  },


  iconContainer: {
    position: "absolute",
    right: 16,
    bottom: 130,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },


  iconButton: {
    alignItems: "center",
  },


  iconLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  playPauseOverlay: {
    position: "absolute",
    top: "40%",
    left: "40%",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 100,
  },
});
