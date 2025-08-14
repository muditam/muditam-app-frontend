import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useCart } from "./contexts/CartContext";


const { width } = Dimensions.get("window");


export default function Cart() {
  const router = useRouter();
  const { cartItems, incrementItem, decrementItem, addToCart } = useCart();
  const [products, setProducts] = useState([]);

  const productInfoMap = {
  "Karela Jamun Fizz": "Control blood sugar levels",
  "Liver Fix": "Liver Detox friend",
  "Sugar Defend Pro": "Work on Root Cause",
  "Chandraprabha Vati": "Kidney Health Support",
  "Heart Defend Pro": "Support healthy heart",
  "Vasant Kusmakar Ras": "Blood sugar control",
  "Performance Forever": "Men's health",
  "Power Gut": "Support Gut Health",
  "Shilajit with Gold": "Increase Stamina",
  "Stress And Sleep": "Reduce stress",
};

  const handleDecrement = (item) => {
    if (item.quantity === 1) {
      Alert.alert(
        "Remove from Cart",
        `Are you sure you want to remove "${item.title}" from your cart?`,
        [
          { text: "Keep in cart", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => decrementItem(item.id, true),
          },
        ]
      );
    } else {
      decrementItem(item.id);
    }
  };


  const recommendedProducts = products.filter(
    (p) => !cartItems.some((cart) => String(cart.id) === String(p.id))
  );
  const handleAddToCart = (item) => {
    addToCart(item);
  };


  const getItemQuantity = (productId) => {
    const item = cartItems.find((cartItem) => cartItem.id === productId);
    return item?.quantity || 0;
  };


  useEffect(() => {
    fetch("https://muditam-app-backend-6a867f82b8dc.herokuapp.com/api/shopify/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  async function getShopifyCartToken() {
    try {
      const response = await fetch('https://muditam.myshopify.com/cart.js');
      const data = await response.json();
      const formattedCartId = `gid://shopify/Cart/${data.token}`;
      return formattedCartId;
    } catch (error) {
      console.error('Error fetching Shopify cart token:', error);
      return '';
    }
  }

  const handlePress = (item) => {
    router.push({
      pathname: "/productPage",
      params: { productId: item.id },
    });
  };


  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleProceedToPay = async () => {
    try {
      const validItems = cartItems.filter(
        (item) => item.first_variant_id && item.quantity > 0
      );

      if (validItems.length === 0) {
        Alert.alert("Cart is empty", "Add products to continue.");
        return;
      }

      const response = await fetch(
        "https://muditam-app-backend-6a867f82b8dc.herokuapp.com/api/shopify/create-cart",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: validItems }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.cartId) {
        Alert.alert("Error", "Unable to create Shopify cart. Try again.");
        return;
      }

      const cartId = data.cartId.split("/").pop(); // extract token
      router.push({
        pathname: "/GoKwikCheckout",
        params: { cartId, total },
      });
    } catch (err) {
      console.error("Cart creation failed:", err);
      Alert.alert("Error", "Something went wrong creating your cart.");
    }
  };

  return (

    <View style={styles.container}>
      <ScrollView style={{ marginBottom: 80 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} />
          </TouchableOpacity>
          <Text style={styles.heading}>Order Summary</Text>
        </View>


        <View >
          <Text style={{ paddingHorizontal: 16, fontSize: 20, fontWeight: 500, paddingTop: 14, }}> 
            Products in Cart
          </Text>


          <FlatList
            data={cartItems}
            keyExtractor={(item) => `cart-${item.id}`}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.infoSection}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={{ color: "#666", fontSize: 13 }}>{productInfoMap[item.title]}</Text>
                  <Text style={styles.price}>₹{item.price * item.quantity}</Text>
                </View>
                <View style={styles.counterContainer}>
                  <TouchableOpacity onPress={() => handleDecrement(item)}>
                    <Text style={styles.counterButton}>
                      <MaterialIcons
                        name="remove"
                        size={18}
                        color="white"
                        backgroundColor="#9D57FF"
                      />
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => incrementItem(item.id)}>
                    <Text style={styles.counterButton}>
                      <FontAwesome6
                        name="add"
                        size={18}
                        color="white"
                        backgroundColor="#9D57FF"
                      />
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />


          <View >
            <Text style={{ paddingVertical: 4, fontSize: 20, fontWeight: 500, paddingLeft: 16, }}>
              Recommended Add-ons
            </Text>
            <Text style={{ color: "#7D7D7D", fontSize: 14, paddingLeft: 16, }}>
              Others with similar conditions also bought these products
            </Text>


            <FlatList
              data={recommendedProducts}
              keyExtractor={(item) => `rec-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}


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

                    {quantity > 0 ? (
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
                        <TouchableOpacity onPress={() => handleIncrement(item.id)}>
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
          </View>



        </View>


      </ScrollView>



      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.total}>₹{total.toFixed(0)}</Text>
          <Text style={styles.tax}>Inclusive of all taxes</Text>
        </View>
        <TouchableOpacity style={styles.payButton} onPress={handleProceedToPay}>
          <Text style={styles.payText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
}


const cardWidth = (Dimensions.get("window").width - 70) / 2;




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  backBtn: {
    marginRight: 12,
  },
  heading: {
    fontSize: 20,
    fontWeight: 600,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 10,
  },
  card: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    position: "relative",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  infoSection: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
  },
  counterContainer: {
    position: "absolute",
    right: 16,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
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
  bottomBar: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingRight: 16,
    paddingVertical: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingLeft: 30,
  },
  total: {
    fontSize: 20,
    fontWeight: "bold",
  },
  tax: {
    fontSize: 14,
    lineHeight: 16,
  },
  payButton: {
    backgroundColor: "#9D57FF",
    paddingHorizontal: 35,
    paddingVertical: 8,
    borderRadius: 4,
  },
  payText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  recommendedSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  productCard: {
    width: cardWidth,
    marginBottom: 16,
    marginTop: 20,
    marginRight: 16,
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
    fontWeight: "500",
    fontSize: 14,
  },
});

