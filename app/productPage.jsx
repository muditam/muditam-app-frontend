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
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { Animated } from 'react-native';
import { useCart } from './contexts/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (productId) {
      fetch(`https://muditam-app-backend.onrender.com/api/shopify/product/${productId}`)
        .then(res => res.json())
        .then(data => {
          setProductData(data);
          if (data?.variants?.length > 0) {
            setSelectedVariantId(data.variants[0].id); // Set first variant as selected
          }
        })
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
  if (!productData || !selectedVariantId) return;

  const { title, images, variants } = productData;
  const variant = variants.find((v) => v.id === selectedVariantId);
  if (!variant) return;

  const productToAdd = {
    id: variant.id,
    first_variant_id: variant.id,  
    title: `${title} - ${variant.title}`,
    image: variant.image || images[0],
    price: parseFloat(variant.price),
    quantity: 1,
  };

  addToCart(productToAdd);
  setShowPopup(true);

  Animated.timing(popupAnim, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  }).start();
};

const handleBuyNow = async () => {
  if (!productData || !selectedVariantId) return;

  const { title, images, variants } = productData;
  const variant = variants.find((v) => v.id === selectedVariantId);
  if (!variant) return;

  const productToBuy = {
    id: variant.id,
    first_variant_id: variant.id, // required for backend
    title: `${title} - ${variant.title}`,
    image: variant.image || images[0],
    price: parseFloat(variant.price),
    quantity: 1,
  };

  try {
    const response = await fetch("https://muditam-app-backend.onrender.com/api/shopify/create-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [productToBuy] }),
    });

    const data = await response.json();

    if (!response.ok || !data.cartId) {
      Alert.alert("Error", "Unable to create cart. Please try again.");
      return;
    }

    const cartId = data.cartId.split("/").pop(); // extract token only

    router.push({
      pathname: "/GoKwikCheckout",
      params: { cartId },
    });
  } catch (err) {
    console.error("Buy Now cart creation failed:", err);
    Alert.alert("Error", "Something went wrong. Please try again.");
  }
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
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-2_d3d4895f-28fe-45df-8640-365005abf725.webp?v=1745412045',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-5_fe076b79-b7f7-474d-bfc4-2928b31cb68a.webp?v=1745412567',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M_-_6.webp?v=1745412625',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-8_f195ea40-a9e7-4bb6-adf6-d92ccab291bc.webp?v=1745412710',
    ];
  } else if (title === 'Liver Fix') {
    extraImages = [
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-1_584d6e37-5925-45dd-8f36-2d06e3723366.webp?v=1745668513',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-2_99d8fc9a-62c6-4e41-a242-67575b951738.webp?v=1745668551',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-4_7399defc-95b0-425c-9888-38178d47ae74.webp?v=1745668837',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-6_ccdc797a-8386-4793-8ce8-b33b0b8468ba.webp?v=1745668896', 
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-8_17cbd83c-18e3-4a71-9653-6f3148127999.webp?v=1745668989',
    ];
  }else if (title === 'Sugar Defend Pro') {
    extraImages = [
      'https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-1_e77f04a5-968a-4206-ae74-e48f23609647.webp?v=1738920670',
      'https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-2_d11114c1-24e3-4a50-9e7e-949de1fabbba.webp?v=1738920692',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-3_36d1d318-a5a8-4aff-99fc-2d73f338c7d1.webp?v=1739450395',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-4_ff350861-df10-41aa-bdd2-ad67de371ea7.webp?v=1739450564',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-5_1d797925-8a93-4b34-bccd-cd7d6efe8016.webp?v=1739450711',
    ];
  } else if (title === 'Chandraprabha Vati') {
    extraImages = [
      'https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-1_c2479531-6133-4579-b222-f520eb1abef5.webp?v=1738926000',
      'https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-2_825f30be-11ee-4635-8de6-ad2c5b1fe444.webp?v=1738926017',
      'https://cdn.shopify.com/s/files/1/0929/2323/2544/files/M-3_4b14fe58-f0cb-4534-9123-e11b414e2ff4.webp?v=1738926034',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-4.webp?v=1739448131',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-5_0c10a67b-db0c-4d2f-aeba-875e093bb394.webp?v=1739448145',
    ];
  } else if (title === 'Heart Defend Pro') {
    extraImages = [
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-1_374f17f3-3118-4c73-9ca7-1b2795e6123d.webp?v=1739448301',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-2_11717340-c507-42ae-ae70-90813f1b77cd.webp?v=1739448324',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-3_427d87eb-644f-4b3d-b09f-00feb11a28ad.webp?v=1739448341',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-4_8d5590ba-4985-40f6-888c-4616aa00c01e.webp?v=1739448367',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-5_0dae6785-2446-45d9-94a3-674f9829d718.webp?v=1739448378',
    ];
  } else if (title === 'Vasant Kusmakar Ras') {
    extraImages = [
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-1_998babf9-8572-45a0-9019-b29060eeef5c.webp?v=1739450842',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-2_0da906be-e92f-4dd4-b615-9fd1b2184659.webp?v=1739450918',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-3_18fd147a-a4f9-42da-80c3-7e5de9a27a9a.webp?v=1739450969',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-4_77dd8a80-e75c-4ddc-9707-c9518c8d7c58.webp?v=1739450996',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-5_d11c8316-c02c-493c-b6d5-2757336bf413.webp?v=1739451019',
    ];
  } else if (title === 'Performance Forever') {
    extraImages = [
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-1_1df283ee-80f9-4b05-9ec9-d85173aa4f72.webp?v=1739448951',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-2_996026e0-60d5-4217-acdd-00429cc1b966.webp?v=1739448980',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-3_0316d641-1aa3-4276-9649-f19943c373c5.webp?v=1739448996',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-4_4cad64ff-5421-4ec7-b4f4-a921a3fdbf77.webp?v=1739449144',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-5_e8f0a26b-84b0-4e65-9507-6d404c8c3992.webp?v=1739449170',
    ];
  } else if (title === 'Power Gut') {
    extraImages = [
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-1_99105e61-782f-4800-8aba-861d8b6194e3.webp?v=1739449316',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-2_c8b150d6-c1d4-49c9-8f08-74c4fd9ec88f.webp?v=1739449409',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-3_01c547c4-ee01-49d9-82f5-db938bcc8859.webp?v=1739449433',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-4_8f43638f-5744-4f9a-9164-64d8722be1ad.webp?v=1739449451',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-5_e6642fcc-d0d1-42e7-b59b-973949619a2b.webp?v=1739449513',
    ];
  } else if (title === 'Shilajit with Gold') {
    extraImages = [
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-1_2bb282a2-caa2-4f79-a741-40ecff246cb3.webp?v=1739449671',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-2_8a050d6e-e398-417f-9a49-dfe3d65d5498.webp?v=1739449809',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-3_0fba6a4f-4d91-40a6-abd3-12a75008f14e.webp?v=1739449904',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-4_af3947d3-70e7-49d7-be8a-da1f26144303.webp?v=1739449843',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-5_aa070733-bd4c-4dc0-8ccb-22ab342909a7.webp?v=1739449865',
    ];
  } else if (title === 'Stress And Sleep') {
    extraImages = [
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-1_d63e3ff6-0459-4bbc-b831-9eea17b9995d.webp?v=1739449980',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-2_988e80ac-6afb-4367-8960-1943d2ad5840.webp?v=1739450021',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-3_ca736096-8961-4544-8c50-6795e7c0012a.webp?v=1739450128',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-4_cb07c60c-109b-4484-a151-7d4a2eb9fd2f.webp?v=1739450153',
      'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-5_9442cc6a-a7b6-45c1-93a1-b4291194d582.webp?v=1739450177',
    ];
  }

  return ( 
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Back Button */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
  <TouchableOpacity onPress={() => router.back()}>
    <Feather name="arrow-left" size={24} color="#000" />
  </TouchableOpacity>
</View>

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
            <Text style={styles.ratingText}>Rated 
              <Text style={{ fontWeight: 'bold' }}> 4.8/5</Text> based on 1200+ Reviews
            </Text>
          </View>

          <Text style={styles.description}>
            {description?.replace(/<\/?[^>]+(>|$)/g, '') || 'No description available.'}
          </Text>
        </View>

        {/* Variant Picker – first 3 only */}
        <View style={styles.variantsContainer}>
          {variants.slice(0, 3).map((variant) => {
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
            onPress={handleBuyNow}
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
    </SafeAreaView>
  );
}

const cardWidth = (width - 64) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
  paddingHorizontal: 18,
  paddingTop: 1,
  paddingBottom: -5,
  backgroundColor: '#fff',
  zIndex: 2,
},
  backButton: {
    position: 'absolute',
    top: 15,
    left: 10,
    zIndex: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 4,
  },
  image: {
    width: width,
    height: width * 1.1,
    backgroundColor: '#fff',
    marginTop: -5,
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
    marginBottom: 0,
  },
  ratingText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 6,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
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
