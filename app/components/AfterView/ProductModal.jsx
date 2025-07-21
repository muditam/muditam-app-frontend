import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView,
} from "react-native";
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
import MaterialIcons from "@expo/vector-icons/MaterialIcons";


function AutoSizedImage({ uri }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    Image.getSize(
      uri,
      (w, h) => {
        const scaleFactor = screenWidth;
        const imageHeight = (h / w) * scaleFactor;
        setDimensions({ width: scaleFactor, height: imageHeight });
      },
      (err) => console.warn("Failed to get image size:", err)
    );
  }, [uri]);


  if (!dimensions.height) return null;


  return (
    <Image
      source={{ uri }}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        resizeMode: "contain",
      }}
    />
  );
}


export default function ProductModal({ visible, onClose, product }) {
  const [currentSlide, setCurrentSlide] = useState(0);


   const slideAnim = useRef(new Animated.Value(screenHeight)).current;


  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
    if (!visible) return null; 

  if (!product) return null;


  const getHighlights = () => {
    if (product.title === "Karela Jamun Fizz") {
      return [
        "Helps to Manage Sugar Fluctuations",
        "5x Powerful & 10x Effective",
        "Helps in Energy Levels & Immunity",
      ];
    } else if (product.title === "Sugar Defend Pro") {
      return [
        "Best Results in 3 Months",
        "Reduces Blood Sugar Levels",
        "5x Powerful & 10x Effective",
      ];
    } else if (product.title === "Vasant Kusmakar Ras") {
      return [
        "Infused with Swarna Bhasma",
        "Natural Metabolic Balance",
        "5x Powerful & 10x Effective",
      ];
    }
    return [];
  };


  const getBottomImages = () => {
    if (product.title === "Karela Jamun Fizz") {
      return [
        "https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-1_4b8d43c3-b2b3-4c27-9df1-7270c5d4012c.webp?v=1740555333",
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-2_d3d4895f-28fe-45df-8640-365005abf725.webp?v=1745412045",
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-5_fe076b79-b7f7-474d-bfc4-2928b31cb68a.webp?v=1745412567",
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M_-_6.webp?v=1745412625",
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-8_f195ea40-a9e7-4bb6-adf6-d92ccab291bc.webp?v=1745412710",
      ];
    } else if (product.title === "Sugar Defend Pro") {
      return [
        "https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-1_e77f04a5-968a-4206-ae74-e48f23609647.webp?v=1738920670",
      "https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-2_d11114c1-24e3-4a50-9e7e-949de1fabbba.webp?v=1738920692",
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-3_36d1d318-a5a8-4aff-99fc-2d73f338c7d1.webp?v=1739450395",
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-4_ff350861-df10-41aa-bdd2-ad67de371ea7.webp?v=1739450564",
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-5_1d797925-8a93-4b34-bccd-cd7d6efe8016.webp?v=1739450711",
      ];
    } else if (product.title === "Vasant Kusmakar Ras") {
      return [
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-1_998babf9-8572-45a0-9019-b29060eeef5c.webp?v=1739450842",
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-2_0da906be-e92f-4dd4-b615-9fd1b2184659.webp?v=1739450918",
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-3_18fd147a-a4f9-42da-80c3-7e5de9a27a9a.webp?v=1739450969",
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-4_77dd8a80-e75c-4ddc-9707-c9518c8d7c58.webp?v=1739450996",
      "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-5_d11c8316-c02c-493c-b6d5-2757336bf413.webp?v=1739451019",
      ];
    }
    return [];
  };


  const images = product.images?.length ? product.images : [product.image];
  const highlights = getHighlights();
  const bottomImages = getBottomImages();


  const handleScroll = (e) => {
    const slide = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setCurrentSlide(slide);
  };


  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
        <View style={styles.drawer}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

         <ScrollView>
            <Text style={styles.heading}>{product.title}</Text>

            {/* Carousel */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {/* images */}


              {images.map((img, i) => (
                <View
                  key={i}
                  style={{
                    width: screenWidth,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{ uri: img }}
                    style={{
                      width: screenWidth * 0.9,
                      height: screenWidth * 0.9,
                      resizeMode: "cover",
                      borderRadius: 8,
                      marginVertical: 16,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.2,
                      shadowRadius: 12,
                      elevation: 4,
                    }}
                  />
                </View>
              ))}
            </ScrollView>


            {/* Dots */}


            <View style={styles.dotsContainer}>
              {images.map((_, index) => {
                const distance = Math.abs(currentSlide - index);


                let size = 0;
                let opacity = 0;


                if (distance === 0) {
                  size = 15;
                  opacity = 1;
                } else if (distance === 1) {
                  size = 10;
                  opacity = 0.2;
                } else if (distance === 2) {
                  size = 7;
                  opacity = 0.2;
                } else if (distance === 3) {
                  size = 3;
                  opacity = 0.2;
                } else {
                  size = 0;
                  opacity = 0;
                }

                return (
                  <View
                    key={index}
                    style={{
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      backgroundColor: "black",
                      opacity: opacity,
                      marginHorizontal: 4,
                    }}
                  />
                );
              })}
            </View>


            {/* Product Details */}
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.price}>₹{product.price}</Text> 

            {/* Rating */}
            <View style={styles.ratingRow}>
              {Array(5)
                .fill()
                .map((_, i) => (
                  <MaterialIcons name="star-rate" size={18} color="#F5C518" />
                ))}
              <Text style={styles.reviewText}>
                Excellent 4.8/5 based on 1200+ Reviews
              </Text>
            </View>


            {/* Divider */}
            <View style={{ alignItems: "center", display: "flex" }}>
              <LinearGradient
                colors={["transparent", "#ccc", "#ccc", "#ccc", "transparent"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.gradientLine}
              />
            </View>


            {/* Highlights */}
            {highlights.map((point, i) => (
              <View key={i} style={styles.pointRow}>
                <Image
                  source={{
                    uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Checkmark_1.png?v=1747293655",
                  }}
                  style={styles.tick}
                />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}


            {/* Bottom Images */}
            <View style={styles.bottomImagesRow}>
              {bottomImages.map((img, i) => (
                <AutoSizedImage key={i} uri={img} />
              ))}
            </View>


          </ScrollView>


        </View>
</Animated.View>


      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  drawer: {
    backgroundColor: "#fff",
    height: screenHeight * 0.80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
   
  },


  closeBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingRight: 16,
  },


  closeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },


  dot: {
    width: 12,
    height: 12,
    borderRadius: 50,
    backgroundColor: "black",
    marginHorizontal: 5,
  },


  title: {
    fontSize: 30,
    fontWeight: "700",
    marginTop: 14,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 16,
  },
  price: {
    fontSize: 25,
    color: "#333",
    marginVertical: 5,
    paddingHorizontal: 16,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8,
    marginLeft: 16,
  },
  star: {
    width: 16,
    height: 16,
    marginRight: 2,
  },
  reviewText: {
    fontSize: 13,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
    marginHorizontal: 16,
  },
  gradientLine: {
    height: 1.5,
    width: "90%",
    marginHorizontal: 10,
    borderRadius: 4,
    marginVertical: 8,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  tick: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  pointText: {
    fontSize: 16,
    color: "#333",
  },
  bottomImagesRow: {
    marginTop: 10,
  },
});


