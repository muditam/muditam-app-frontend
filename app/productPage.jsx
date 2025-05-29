import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Animated } from 'react-native';
import { useCart } from './contexts/CartContext';

const { width } = Dimensions.get('window');

function AutoSizedImage({ uri }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    Image.getSize(
      uri,
      (w, h) => {
        const scaleFactor = width * 0.90 / w;
        const imageHeight = h * scaleFactor;
        setDimensions({ width: width * 0.90, height: imageHeight });
      },
      (err) => console.warn('Failed to get image size:', err)
    );
  }, [uri]);

  if (!dimensions.height) return null;

  return (
    <View style={{ alignItems: 'center', marginBottom: 12 }}>
      <Image
        source={{ uri }}
        style={{ width: dimensions.width, height: dimensions.height, borderRadius: 12 }}
        resizeMode="contain"
      />
    </View>
  );
}

export default function ProductPage() {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, cartItems } = useCart();
  const [productData, setProductData] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const popupAnim = useRef(new Animated.Value(100)).current;
  const [showPopup, setShowPopup] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  useEffect(() => {
    if (productId) {
      fetch(`http://192.168.1.6:3001/api/shopify/product/${productId}`)
        .then(res => res.json())
        .then(data => setProductData(data))
        .catch(err => {
          console.error('Failed to load product:', err);
        });
    }
  }, [productId]);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const calculateDiscount = (price, comparePrice) => {
    if (!price || !comparePrice || comparePrice <= price) return null;
    const discount = Math.round(((comparePrice - price) / comparePrice) * 100);
    return `Save: ${discount}%`;
  };

  if (!productData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#543287" />
      </View>
    );
  }

  const handleAddToCart = () => {
    const variant = variants.find(v => v.id === selectedVariantId);
    if (!variant) return;
  
    const productToAdd = {
      id: variant.id,
      title: `${title} - ${variant.title}`,
      image: variant.image || images[0],
      price: parseFloat(variant.price),
    };
  
    addToCart(productToAdd);
    setShowPopup(true);
  
    Animated.timing(popupAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  

  const { title, description, images, variants } = productData;
  const selectedVariant = variants.find(v => v.id === selectedVariantId);
  const displayedImages = selectedVariantId && selectedVariant?.image
    ? [selectedVariant.image]
    : images;

  let extraImages = [];

  if (title === 'Karela Jamun Fizz') {
    extraImages = [
      'https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-1_4b8d43c3-b2b3-4c27-9df1-7270c5d4012c.webp?v=1740555333',
    ];
  } else if (title === 'Sugar Defend Pro') {
    extraImages = [
      'https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-1_e77f04a5-968a-4206-ae74-e48f23609647.webp?v=1738920670',
      'https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-2_d11114c1-24e3-4a50-9e7e-949de1fabbba.webp?v=1738920692',
    ];
  } else if (title === 'Chandraprabha Vati') {
    extraImages = [
      'https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-1_c2479531-6133-4579-b222-f520eb1abef5.webp?v=1738926000',
      'https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-2_825f30be-11ee-4635-8de6-ad2c5b1fe444.webp?v=1738926017',
      'https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-3_4b14fe58-f0cb-4534-9123-e11b414e2ff4.webp?v=1738926034',
    ];
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {displayedImages.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={styles.image}
              resizeMode="contain"
            />
          ))}
        </ScrollView>

        <View style={styles.dotsContainer}>
          {displayedImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>

        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.ratingRow}>
            {Array(5).fill().map((_, index) => (
              <FontAwesome key={index} name="star" size={14} color="#FFD700" style={{ marginRight: 2 }} />
            ))}
            <Text style={styles.ratingText}>Rated 4.8/5 based on 1200+ Reviews</Text>
          </View>

          <Text style={styles.description}>
            {description?.replace(/<\/?[^>]+(>|$)/g, '') || 'No description available.'}
          </Text>
        </View>

        {/* Variant Picker */}
        <View style={styles.variantsContainer}>
          {variants.map((variant) => {
            const packText = variant.metafields?.custom?.pack_usage || variant.title;
            const isSelected = selectedVariantId === variant.id;
            const discountText = calculateDiscount(
              parseFloat(variant.price),
              parseFloat(variant.compare_at_price)
            );

            return (
              <TouchableOpacity
                key={variant.id}
                style={[
                  styles.variantCard,
                  isSelected && styles.selectedVariantCard,
                ]}
                onPress={() => setSelectedVariantId(variant.id)}
              >
                {variant.image && (
                  <Image source={{ uri: variant.image }} style={styles.variantImage} />
                )}
                <Text style={styles.variantPack}>{packText}</Text>
                {variant.compare_at_price && (
                  <Text style={styles.variantCompare}>₹{parseInt(variant.compare_at_price)}</Text>
                )}
                <Text style={styles.variantPrice}>₹{parseInt(variant.price)}</Text>
                <Text style={styles.variantTax}>MRP (incl. of all taxes)</Text>
                {discountText && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{discountText}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !selectedVariantId && { opacity: 0.5 },
            ]}
            onPress={handleAddToCart}
            disabled={!selectedVariantId}
          >
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              !selectedVariantId && { opacity: 0.5 },
            ]}
            onPress={() => console.log('Buy Now')}
            disabled={!selectedVariantId}
          >
            <Text style={styles.buttonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>

        {extraImages.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
            {extraImages.map((img, idx) => (
              <AutoSizedImage key={idx} uri={img} />
            ))}
          </View>
        )}
      </ScrollView>
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
          <TouchableOpacity onPress={() => router.push('/cart')}>
            <Text style={styles.viewCartBtn}>View Cart</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const cardWidth = (width - 64) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: width,
    height: width * 1.1,
    backgroundColor: '#fff',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#543287',
  },
  details: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 6,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  variantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  variantCard: {
    width: cardWidth,
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedVariantCard: {
    borderColor: '#543287',
    backgroundColor: '#f1ecff',
  },
  variantImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  variantPack: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  variantCompare: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  variantPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  variantTax: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  discountBadge: {
    marginTop: 8,
    backgroundColor: '#aaa',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#543287',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#8c52ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
