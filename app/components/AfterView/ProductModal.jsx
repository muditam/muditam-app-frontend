import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

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
      (err) => console.warn('Failed to get image size:', err)
    );
  }, [uri]);

  if (!dimensions.height) return null;

  return (
    <Image
      source={{ uri }}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        resizeMode: 'contain',
      }}
    />
  );
}

export default function ProductModal({ visible, onClose, product }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!product) return null;

  const getHighlights = () => {
    if (product.title === 'Karela Jamun Fizz') {
      return [
        "Helps to Manage Sugar Fluctuations",
        "5x Powerful & 10x Effective",
        "Helps in Energy Levels & Immunity",
      ];
    } else if (product.title === 'Sugar Defend Pro') {
      return [
        "Best Results in 3 Months",
        "Reduces Blood Sugar Levels",
        "5x Powerful & 10x Effective",
      ];
    } else if (product.title === 'Vasant Kusmakar Ras') {
      return [
        "Infused with Swarna Bhasma",
        "Natural Metabolic Balance",
        "5x Powerful & 10x Effective",
      ];
    }
    return [];
  };

  const getBottomImages = () => {
    if (product.title === 'Karela Jamun Fizz') {
      return [
        'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-2_d3d4895f-28fe-45df-8640-365005abf725.webp?v=1745412045',
        'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M_-_6.webp?v=1745412625',
      ];
    } else if (product.title === 'Sugar Defend Pro') {
      return [
        'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-3_ad0469a5-6aa9-4088-8c1c-10d3c9f320e2.webp?v=1745412079',
        'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-7_54340b79-637e-4f52-8375-ae78f80dfd28.webp?v=1745669047',
      ];
    } else if (product.title === 'Vasant Kusmakar Ras') {
      return [
        'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/mobile_6_40cb18e5-16b6-4d9b-bc4a-ab78cb386cc9.webp?v=1739017517',
        'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/M-2_996026e0-60d5-4217-acdd-00429cc1b966.webp?v=1739448980',
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
        <View style={styles.drawer}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <ScrollView>
            {/* Carousel */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {images.map((img, i) => (
                <View key={i} style={{ width: screenWidth }}>
                  <AutoSizedImage uri={img} />
                </View>
              ))}
            </ScrollView>

            {/* Dots */}
            <View style={styles.dotsContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    { opacity: currentSlide === index ? 1 : 0.3 },
                  ]}
                />
              ))}
            </View>

            {/* Product Details */}
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.price}>₹{product.price}</Text>

            {/* Rating */}
            <View style={styles.ratingRow}>
              {Array(5)
                .fill()
                .map((_, i) => (
                  <Image
                    key={i}
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/616/616489.png',
                    }}
                    style={styles.star}
                  />
                ))}
              <Text style={styles.reviewText}>Excellent 4.8/5 based on 1200+ Reviews</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Highlights */}
            {highlights.map((point, i) => (
              <View key={i} style={styles.pointRow}>
                <Image
                  source={{
                    uri: 'https://cdn.shopify.com/s/files/1/0918/6213/9202/files/tick.png?v=1737386057',
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: '#fff',
    height: screenHeight * 0.85, // allow nearly full height to scroll
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 15,
  },
  closeText: {
    fontSize: 22,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
    marginHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  star: {
    width: 16,
    height: 16,
    marginRight: 2,
  },
  reviewText: {
    fontSize: 12,
    marginLeft: 8,
    color: '#555',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
    marginHorizontal: 20,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    paddingHorizontal: 20,
  },
  tick: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  pointText: {
    fontSize: 14,
    color: '#333',
  },
  bottomImagesRow: {
    marginTop: 20,
  },
});
