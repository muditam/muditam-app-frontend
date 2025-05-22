import React, { useEffect, useState, useRef } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../contexts/CartContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter(); 
const popupAnim = useRef(new Animated.Value(100)).current;
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    fetch('http://192.168.1.9:3001/api/shopify/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => {
        console.error('Error fetching products:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePress = (item) => {
    router.push({
      pathname: '/productPage',
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
  };  

  const handleViewCart = () => {
    router.push('/cart');
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#543287" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <TouchableOpacity onPress={() => handlePress(item)}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <Text style={styles.productTitle}>{item.title}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.productPrice}>₹{item.price}</Text>
                {item.compare_at_price && item.compare_at_price !== item.price && (
                  <Text style={styles.comparePrice}>₹{item.compare_at_price}</Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.cartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {showPopup && (
        <Animated.View
          style={[
            styles.popupContainer,
            {
              transform: [{ translateY: popupAnim }],
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: '2%',
            },
          ]}
        >
          <Text style={styles.popupText}>{cartItems.length} Product(s) Added</Text>
          <TouchableOpacity onPress={handleViewCart}>
            <Text style={styles.viewCartBtn}>View Cart</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const cardWidth = (Dimensions.get('window').width - 48) / 2;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    width: cardWidth,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#543287',
    marginRight: 6,
  },
  comparePrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  cartButton: {
    backgroundColor: '#543287',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  popupContainer: {
    backgroundColor: '#eee',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 99,
  },  
  popupText: {
    fontSize: 14,
    color: '#000',
  },
  viewCartBtn: {
    color: '#543287',
    fontWeight: 'bold',
  },
});
