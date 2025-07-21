import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, FontAwesomeIcon } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import FAQ from "../components/FAQ";
import RealJourneysSlider from "../components/RealJourneysSlider";


const width = Dimensions.get("window").width; 
const cardWidth = width - 32;


export default function BuyKit() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndexes, setActiveImageIndexes] = useState({});
  const scrollRefs = useRef({});
  const [totalPrice, setTotalPrice] = useState(0);


  const productDetails = {
    "product 1": {
      name: "Karela Jamun Fizz",
      title: "Control Sugars",
      timing: ["🔆 Morning", "🌛 Night"],
      icons: [
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/KJF-1.png?v=1752645241",
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/KJF-2.png?v=1752645241",
      ],
      iconLabels: [
        "Controls Sugar Levels\nafter meals",
        "Boosts Natural\nInsulin Production",
      ],
      tagline: "Key Ingredients: Karela, Jamun, Neem, Gudmar, Amla, etc",
    },
    "product 2": {
      name: "Sugar Defend Pro",
      title: "Works on Root Cause",
      timing: ["🔆 Morning", "🌟 Afternoon"],
      icons: [
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/SDP-1.png?v=1752645241",
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/SDP-2.png?v=1752645241",
      ],
      iconLabels: [
        "Improves insulin\nsensitivity",
        "Helps reduce sugar\nfluctuations",
      ],
      tagline:
        "Key Ingredients: Inositol, Alpha Lipoic Acid, Evening Primrose Oil, Magnesium, Chromium, Berberine, etc",
    },
    "product 3": {
      name: "Vasant Kusmakar Ras",
      title: "Controls Stubborn Sugar",
      timing: ["🔆 Morning", "🌟 Afternoon"],
      icons: [
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/VKR-1.png?v=1752645241",
        "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/VKR-2.png?v=1752645241",
      ],
      iconLabels: [
        "Helps manage\nstubborn blood sugar",
        "Improves energy &\nreduces diabetic fatigue",
      ],
      tagline:
        "Key Ingredients: Swarn Bhasma, Moti Bhasma, Rajat Bhasma, Abhrak Bhasma, etc",
    },
  };
  
  // at top of your component file
const infoItems = [
  {
    text: "Diabetologist\nApproved",
    icon: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/1_5.png?v=1752645672",
  },
  {
    text: "Science\nBacked",
    icon: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/2_6.png?v=1752645672",
  },
  {
    text: "Rooted in\nAyurveda",
    icon: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/3_4.png?v=1752645672",
  },
];



  useEffect(() => {
    const fetchUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("userDetails");
        if (!stored) return;


        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
      } catch (err) {
        console.warn("Failed to load username", err);
      }
    };


    fetchUser();
  }, []);


  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem("hba1c");
        const hba1c = stored ? JSON.parse(stored) : null;


        const res = await fetch(
          "https://muditam-app-backend.onrender.com/api/shopify/products"
        );
        const data = await res.json();


        let titlesToShow = [];
        if (hba1c !== null && hba1c <= 6.0) {
          titlesToShow = ["Karela Jamun Fizz"];
        } else if (hba1c > 6.0 && hba1c <= 9.0) {
          titlesToShow = ["Karela Jamun Fizz", "Sugar Defend Pro"];
        } else {
          titlesToShow = ["Sugar Defend Pro", "Vasant Kusmakar Ras"];
        }


        const filtered = data.filter((p) => titlesToShow.includes(p.title));


        const enriched = filtered.map((p) => ({
          ...p,
          image: { uri: p.image },
          quantity: 1,
          first_variant_id: p.first_variant_id || p.variants?.[0]?.id,
        }));


        const total = enriched.reduce(
          (sum, p) => sum + p.price * p.quantity,
          0
        );
        setTotalPrice(total);


        setProducts(enriched);
      } catch (err) {
        console.error("Error loading products or hba1c:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Get your Diabetes Kit</Text>
        </View>


        <View style={styles.contentWrapper}>
          <View style={styles.productRow}>
            {products.map((item, index) => (
              <View style={styles.productCard} key={index}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={item.image}
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.productName}>{item.title}</Text>
              </View>
            ))}
          </View>


          <Text style={styles.greeting}>
            {user?.name || "Guest"}, your Diabetes Management kit is ready!
          </Text>


          <View style={styles.giftSection}>
            <Image
              source={{
                uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Group_825.png?v=1747490503",
              }}
              style={styles.giftImage}
              resizeMode="contain"
            />
          </View>


          <View style={styles.infoRow}>
            {infoItems.map(({ text, icon }, i) => (
              <View key={i} style={styles.infoItem}>
                <View style={styles.infoCircle}>
                  <Image source={{ uri: icon }} style={styles.infoCircleImage} />
                </View>
                <Text style={styles.infoText}>{text}</Text>
              </View>
            ))}
          </View>



          {products.map((product, pIndex) => {
            const productImages = product.images || [];
            const currentIndex = activeImageIndexes[product.id] || 0;
            const match = Object.values(productDetails).find(
              (d) => d.name === product.title
            );


            return (
              <View key={product.id} style={styles.productDetailCard}>
                {match && (
                  <View style={styles.titleTimingRow}>
                    <Text style={styles.detailTitle}>{`${pIndex + 1}. ${
                      match.title
                    }`}</Text>
                    <View style={styles.timingRow}>
                      {match.timing.map((t, i) => (
                        <Text key={i}>{t}</Text>
                      ))}
                    </View>
                  </View>
                )}


                <FlatList
                  ref={(ref) => (scrollRefs.current[product.id] = ref)}
                  data={productImages}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  pagingEnabled
                  decelerationRate="fast"
                  snapToAlignment="center"
                  showsHorizontalScrollIndicator={false}
                  onScroll={(e) => {
                    const index = Math.round(
                      e.nativeEvent.contentOffset.x / cardWidth
                    );
                    setActiveImageIndexes((prev) => ({
                      ...prev,
                      [product.id]: index,
                    }));
                  }}
                  scrollEventThrottle={16}
                  style={[styles.imageCarousel, { flexGrow: 0 }]}
                  renderItem={({ item, index }) => (
                    <View
                      style={{
                        width: cardWidth,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        source={{ uri: item }}
                        style={[
                          styles.carouselImage,
                          { width: cardWidth - 34 },
                        ]}
                      />
                    </View>
                  )}
                />


                <View style={styles.dotsContainer}>
                  {productImages.map((_, index) => {
                    let start = 0;
                    let end = 4;


                    if (currentIndex <= 2) {
                      start = 0;
                      end = 4;
                    } else if (currentIndex >= productImages.length - 3) {
                      start = productImages.length - 5;
                      end = productImages.length - 1;
                    } else {
                      start = currentIndex - 2;
                      end = currentIndex + 2;
                    }


                    if (index < start || index > end) return null;


                    const isActive = index === currentIndex;


                    const size = isActive ? 12 : 8;
                    const opacity = isActive ? 1 : 0.2;


                    return (
                      <View
                        key={index}
                        style={{
                          width: size,
                          height: size,
                          borderRadius: size / 2,
                          backgroundColor: "black",
                          opacity,
                          marginHorizontal: 4,
                        }}
                      />
                    );
                  })}
                </View>


                <Text style={styles.productTitle}>{product.title}</Text>


                {match && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailText}>
                      {product.description?.replace(/<\/?[^>]+(>|$)/g, "") ||
                        ""}
                    </Text>


                    <View style={styles.iconRow}>
                      {match && match.icons && match.icons.length > 0 ? (
                        match.icons.map((iconUri, i) => (
                          <View key={i}>
                            <View style={styles.iconCircle}>
                              <Image
                                source={{ uri: iconUri }}
                                style={styles.iconImage}
                              />
                            </View>
                            <Text style={styles.iconLabel}>
                              {match.iconLabels[i]}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <View style={styles.iconItem}>
                          <View style={styles.iconCircle}>
                            <Text style={styles.iconPlaceholder}></Text>
                          </View>
                          <Text style={styles.iconLabel}>
                            No icons available
                          </Text>
                        </View>
                      )}
                    </View>


                    <View
                      style={{
                        backgroundColor: "#F4F4F4",
                        padding: 10,
                        margin: 16,


                        paddingHorizontal: 16,
                        borderRadius: 4,
                        justifyContent: "center",
                        marginBottom: 5,
                      }}
                    >
                      <Text style={styles.tagline}>{match.tagline}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>


        <View style={styles.consultCard}>
          <Text style={styles.consultTitle}>Have Questions?</Text>
          <Text style={styles.consultSubtitle}>Talk to a Diabetes Expert</Text>
          <Text style={styles.consultDescription}>
            We'll set up your online consult within 1 hour — no waiting
          </Text>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.consultButton}>
            <Text style={styles.consultButtonText}>
              <Feather name="phone" size={18} color="#000" /> Book a Consult
            </Text>
          </TouchableOpacity>
        </View>


        <View style={styles.kitInfoSection}>
          <Text style={styles.kitInfoTitle}>
            What you get in ₹{totalPrice.toFixed(0)}
          </Text>
          <Text style={styles.kitInfoSubtitle}>
            1-month Customized Kit ₹{totalPrice.toFixed(0)}
          </Text>
          <View style={styles.divider} />


          {[
            {
              title: "100% Effective Results",
              description:
                "Two personalized products with proven ingredients",
            },
            {
              title: "Regular Diabetes Coach Support",
              description:
                "Ongoing personalized guidance from diabetes experts",
            },
            {
              title: "Monthly Doctor Consultation",
              description:
                "Complimentary monthly Muditam doctor reviews",
            },
            {
              title: "Diabetes-Friendly Diet Plan",
              description:
                "Tailored plans to avoid sugar spikes",
            },
          ].map((item, index) => (
            <View key={index} style={styles.benefitRow}> 
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  gap: 5,
                }}
              >
                <Image
                  source={{
                    uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Checkmark_1.png?v=1747293655",
                  }}
                  style={{ width: 20, height: 20, marginTop: 3 }}
                />
                <Text style={styles.benefitTitle}>{item.title}</Text>
              </View>
              <Text style={styles.benefitDescription}>{item.description}</Text>
            </View>
          ))}
        </View>


        <View style={styles.expertGuidanceCard}>
          <View style={styles.expertTextSection}>
            <Text style={styles.expertTitle}>Expert Guidance Anytime</Text>
            <Text style={styles.expertDescription}>
              For personalised support and everyday sugar management.
            </Text>
          </View>
          <Image
            source={{
              uri: "https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Mask_group_3.png?v=1747143071",
            }} // replace with actual image URL if hosted elsewhere
            style={styles.expertImage}
          />
        </View>


        <RealJourneysSlider />
        <FAQ />
      </ScrollView>


      <View style={styles.priceContainer}>
        <View>
          <Text style={styles.price}>₹{totalPrice.toFixed(0)}</Text>
          <Text style={styles.tax}>Inclusive of all taxes</Text>
        </View>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={async () => {
            try {
              const validItems = products.filter(
                (item) => item.first_variant_id && item.quantity > 0
              );


              if (validItems.length === 0) {
                Alert.alert(
                  "No products selected",
                  "Please add products to continue."
                );
                return;
              }


              const response = await fetch(
                "https://muditam-app-backend.onrender.com/api/shopify/create-cart",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ items: validItems }),
                }
              );


              const data = await response.json();


              if (!response.ok || !data.cartId) {
                Alert.alert(
                  "Checkout Failed",
                  "Unable to create cart. Try again."
                );
                return;
              }


              const cartToken = data.cartId.split("/").pop();


              // Navigate to GoKwikCheckout
              const { router } = require("expo-router");
              router.push({
                pathname: "/GoKwikCheckout",
                params: { cartId: cartToken, total: totalPrice },
              });
            } catch (err) {
              console.error("Error launching checkout:", err);
              Alert.alert("Error", "Something went wrong. Please try again.");
            }
          }}
        >
          <Text style={styles.buyText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 28,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#9D57FF",
    height: 110,
  },
  headerText: {
    color: "white",
    fontSize: 22,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontWeight: "500",
    fontFamily: Platform.OS === "macos" ? "Poppins" : "System",
  },
  contentWrapper: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -40,
    paddingTop: 20,
    paddingBottom: 30,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    marginHorizontal: 16,
  },
  productCard: {
    alignItems: "center",
    width: width / 3 - 20,
  },
  imageWrapper: {
    width: "100%",
    height: 160,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 10,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  productName: {
    fontSize: 15,
    textAlign: "center",
    fontWeight: "500",
    fontFamily: Platform.OS === "macos" ? "Poppins" : "System",
  },
  greeting: {
    fontSize: 20,
    fontFamily: Platform.OS === "macos" ? "Poppins" : "System",
    fontWeight: "500",
    paddingHorizontal: 16,
  },
  giftSection: {
    marginHorizontal: 16,
  },
  giftImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginVertical: 6,
  },
  infoItem: {
    alignItems: "center",
    width: width / 3 - 10,
  },
  infoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F4F4F4",
    marginBottom: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
    fontFamily: Platform.OS === "macos" ? "Poppins" : "System",
  },
  infoCircleImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  titleTimingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  timingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: 5,
    marginTop: 16,
  },


  timingText: {
    fontSize: 12,
    color: "#ff9f0a",
    fontWeight: "500",
    paddingHorizontal: 6,
    justifyContent: "center",
    borderRadius: 6,
    fontFamily: Platform.OS === "macos" ? "Poppins" : "System",
  },


  iconRow: {
    flexDirection: "row",
    gap: 50,
    width: "100%",
    margin: 16,
  },
  iconCircleContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F4F4F4",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },


  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    // gap:60,
    justifyContent: "space-between",
    marginTop: 10,
  },
  iconItem: {
    alignItems: "center",
    width: "30%",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F4F4F4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  iconImage: {
    width: 35,
    height: 35,
  },
  iconPlaceholder: {
    fontSize: 30,
  },
  iconLabel: {
    fontSize: 14,
    fontFamily: Platform.OS === "macos" ? "Poppins" : "System",
  },


  tagline: {
    fontSize: 14,
    color: "#5B5B5B",
    fontStyle: "italic",
    lineHeight: 18,
    fontFamily: Platform.OS === "macos" ? "Poppins" : "System",
  },


  productDetailCard: {
    borderWidth: 0.5,
    borderColor: "#A3A3A3",
    borderRadius: 10,
    paddingBottom: 20,
    marginHorizontal: 16,
    marginVertical: 16,
  },


  imageCarousel: {
    width: "100%",
    height: 359,
  },


  carouselImage: {
    width: cardWidth * 0.9,
    height: 359,
    borderRadius: 8,
    borderWidth: 0.5,
    resizeMode: "contain",
  },


  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 50,
    backgroundColor: "black",
    marginHorizontal: 5,
  },


  detailTitle: {
    fontSize: 16,
    fontWeight: "700",
    paddingTop: 16,
    paddingLeft: 16,
    fontFamily: Platform.OS === "macos" ? "Poppins" : "System",
  },
  productTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 16,
    fontFamily: Platform.OS === "macos" ? "Poppins" : "System",
  },


  detailText: {
    fontSize: 14,
    color: "#5B5B5B",
    paddingHorizontal: 16,
    lineHeight: 18,
    fontFamily: Platform.OS === "macos" ? "Poppins" : "System",
  },
  priceContainer: {
    position: "absolute",
    bottom: "0%",
    left: 0,
    right: 0,
    backgroundColor: "#F3E9FF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingRight: 16,
    paddingLeft: 34,
    borderRadius: 0,
    elevation: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Poppins",
    color: "#000",
  },
  tax: {
    fontSize: 14,
    fontFamily: "Poppins",
  },
  buyButton: {
    backgroundColor: "#9D57FF",
    paddingVertical: 6,
    paddingHorizontal: 40,
    borderRadius: 4,
  },
  buyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Poppins",
  },


  consultCard: {
    borderWidth: 0.5,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: "#fff",
  },
  consultTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Poppins",
    marginBottom: 4,
  },
  consultSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins",
    marginBottom: 4,
  },
  consultDescription: {
    fontSize: 13,
    fontFamily: "Poppins",
    marginBottom: 12,
  },
  consultButton: {
    backgroundColor: "#E4D0FF",
    borderRadius: 6,
    paddingVertical: 10,
    marginTop: 6,
    alignItems: "center",
  },
  consultButtonText: {
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Poppins",
  },


  kitInfoSection: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  kitInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Poppins",
    marginBottom: 4,
  },
  kitInfoSubtitle: {
    fontSize: 15,
    fontFamily: "Poppins",
    marginBottom: 8,
  },
  divider: {
    height: 0.5,
    backgroundColor: "#000",
    marginVertical: 10,
  },


  benefitRow: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 18,
    marginTop: 3,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Poppins",
  },
  benefitDescription: {
    fontSize: 15,
    fontFamily: "Poppins",
    color: "#626262",
    marginTop: 2,
  },
  expertGuidanceCard: {
    backgroundColor: "#F7F2FF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expertTextSection: {
    flex: 1,
    paddingRight: 12,
  },
  expertTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Poppins",
    marginBottom: 4,
    color: "#000",
  },
  expertDescription: {
    fontSize: 15,
    fontFamily: "Poppins",
    lineHeight: 20,
  },
  expertImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#ccc",
  },
});
