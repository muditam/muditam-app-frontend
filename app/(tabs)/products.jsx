import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "../contexts/CartContext";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FontAwesomeIcon, Ionicons } from "@expo/vector-icons"; // for cart icon
import { Feather } from "@expo/vector-icons";
import { Modal } from "react-native";


export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const popupAnim = useRef(new Animated.Value(100)).current;
  const router = useRouter();
  const { addToCart, cartItems, incrementItem, decrementItem } = useCart();


  const categories = ["All", "Diabetes", "Liver", "Gut", "Sleep"];
  const [selectedCategory, setSelectedCategory] = useState("All");


  const categoryToProductsMap = {
    diabetes: ["karela jamun fizz", "sugar defend pro", "vasant kusmakar ras"],
    liver: ["liver fix", "heart defend pro"],
    gut: ["power gut"],
    sleep: ["stress and sleep"],
  };


  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) =>
        categoryToProductsMap[selectedCategory.toLowerCase()]?.includes(
          p.title.toLowerCase()
        )
      );


  useEffect(() => {
    fetch("http://192.168.1.15:3001/api/shopify/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => {
        console.error("Error fetching products:", err);
      })
      .finally(() => setLoading(false));
  }, []);


  const handlePress = (item) => {
    router.push({
      pathname: "/productPage",
      params: { productId: item.id },
    });
  };


  const handleAddToCart = (item) => {
    addToCart(item);
    setShowPopup(true);


    Animated.timing(popupAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();


    setTimeout(() => {
      Animated.timing(popupAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowPopup(false));
    }, 5000);
  };


  const handleIncrement = (item) => {
    incrementItem(item.id);
  };


  const handleDecrement = (item) => {
    const qty = getItemQuantity(item.id);
    if (qty <= 1) {
      decrementItem(item.id, true);
    } else {
      decrementItem(item.id);
    }
  };


  const getItemQuantity = (productId) => {
  const item = cartItems.find((cartItem) => String(cartItem.id) === String(productId));
  return item?.quantity || 0;
};

  const handleViewCart = () => {
    router.push("/cart");
  };


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#543287" />
      </View>
    );
  }


  return (
    <View style={{ flex: 1, backgroundColor: "#F7F2FF" }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backArrow}
        >
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Products</Text>


        <TouchableOpacity
          onPress={handleViewCart}
          style={styles.cartIconContainer}
        >
          <Ionicons name="cart-outline" size={24} color="#000" />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>


      <View style={styles.grayLine} />


      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
      >
        {categories.map((cat) => {
          const isActive = cat === selectedCategory;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryTab,
                isActive
                  ? styles.categoryTabActive
                  : styles.categoryTabInactive,
              ]}
            >
              <Text
                style={
                  isActive
                    ? styles.categoryTextActive
                    : styles.categoryTextInactive
                }
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>


      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => {
          const quantity = getItemQuantity(item.id);
          return (
            <View style={styles.productCard}>
              <TouchableOpacity onPress={() => handlePress(item)}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                />
                <Text style={styles.productTitle}>{item.title}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>₹&nbsp;{item.price}</Text>
                </View>
              </TouchableOpacity>

              {cartItems.some((c) => String(c.id) === String(item.id)) ? (
                <View style={styles.counterContainer}>
                  <TouchableOpacity onPress={() => handleDecrement(item)}>
                    <Text style={styles.counterButton}>
                      <MaterialIcons
                        name="delete-outline"
                        size={20}
                        color="#989898"
                      />
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{quantity}</Text>
                  <TouchableOpacity onPress={() => handleIncrement(item)}>
                    <Text style={styles.counterButton}>
                      <FontAwesome6
                        name="add"
                        size={14}
                        color="white"
                        backgroundColor="#9D57FF"
                      />
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.cartButton}
                  onPress={() => handleAddToCart(item)}
                >
                  <Text style={styles.cartButtonText}>ADD TO CART</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />


      {showPopup && (
        <Animated.View
          style={[
            styles.popupContainer,
            {
              transform: [{ translateY: popupAnim }],
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              marginHorizontal: 16,
              borderRadius: 8,
            },
          ]}
        >
          <Text style={styles.popupText}>
            {cartItems.length} Product(s) Added
          </Text>
          <TouchableOpacity onPress={handleViewCart}>
            <Text style={styles.viewCartBtn}>View Cart</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}


const cardWidth = (Dimensions.get("window").width - 48) / 2;


const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },

  productCard: {
    width: cardWidth,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: "center",
  },
  priceRow: {
    alignItems: "center",
    marginBottom: 8,
    textAlign: "center",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 6,
  },
  comparePrice: {
    fontSize: 12,
    color: "#888",
    textDecorationLine: "line-through",
  },
  cartButton: {
    backgroundColor: "#9D57FF",
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  cartButtonText: {
    color: "#fff",
    fontWeight: 500,
    fontSize: 14,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterButton: {
    color: "#9D57FF",
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
  counterValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginHorizontal: 10,
  },


  viewCartBtn: {
    backgroundColor: "#E4D0FF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    color: "#000",
    fontWeight: "700",
    fontSize: 14,
    overflow: "hidden",
  },


  headerContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  backArrow: {
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },
  cartIconContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 25,
  },
  cartBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#9D57FF",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 10,
  },
  grayLine: {
    height: 0.5,
    backgroundColor: "black",
  },
  categoryTab: {
    borderWidth: 1,
    borderRadius: 18,
    borderColor: "#543087",
    paddingHorizontal: 18,
    marginRight: 12,
    backgroundColor: "white",
    maxHeight: 36,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 16,
  },


  categoryTabActive: {
    backgroundColor: "#9D57FF",
    borderColor: "#9D57FF",
    height: 36,
  },


  categoryTabInactive: {
    height: 36,
  },


  categoryTextActive: {
    color: "white",
    textAlign: "center",
  },


  categoryTextInactive: {
    textAlign: "center",
  },


  popupContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },


  popupText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
});





