import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductModal from './ProductModal';
import { FontAwesome } from '@expo/vector-icons';


export default function AfterProductList({ setTotalPrice, totalPrice, setSelectedProducts }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem('hba1c');
        const hba1c = stored ? JSON.parse(stored) : null;

        const res = await fetch('https://muditam-app-backend.onrender.com/api/shopify/products');
        const data = await res.json();

        let titlesToShow = [];
        if (hba1c <= 6.0) {
          titlesToShow = ['Karela Jamun Fizz'];
        } else if (hba1c > 6.0 && hba1c <= 9.0) {
          titlesToShow = ['Karela Jamun Fizz', 'Sugar Defend Pro'];
        } else {
          titlesToShow = ['Sugar Defend Pro', 'Vasant Kusmakar Ras'];
        }

        const filtered = data.filter((p) => titlesToShow.includes(p.title));
        setProducts(filtered);

        const enriched = filtered.map((p) => ({
          ...p,
          quantity: 1,
          first_variant_id: p.first_variant_id || p.variants?.[0]?.id, // fallback to first variant
        }));

        setProducts(enriched);
        setSelectedProducts(enriched);

        // Calculate total price
        const total = filtered.reduce((acc, curr) => acc + parseFloat(curr.price), 0);
        setTotalPrice(total);
      } catch (err) {
        console.error('Error loading products or hba1c:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);


  const renderItem = ({ item }) => {
    let subtitleText = 'Control blood sugar levels';

    if (item.title === 'Sugar Defend Pro') {
      subtitleText = 'Helps manage post-meal sugar spikes';
    } else if (item.title === 'Vasant Kusmakar Ras') {
      subtitleText = 'Supports natural insulin response';
    }

    return (
      <View style={styles.productCard}>
        <Image source={{ uri: item.image }} style={styles.productImage} />

        {/* Text block */}
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{subtitleText}</Text>
          <View style={styles.line} />
          <View style={styles.bottomRow}>
            <Text style={styles.tag}>DIABETES CARE</Text>
            <Text style={styles.price}>₹{item.price}</Text>
          </View>
        </View>

        {/* Arrow on far right */}
        <TouchableOpacity onPress={() => { setSelectedProduct(item); setModalVisible(true); }}>
          <Image
            source={{ uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/image_130_2.png?v=1746007801' }}
            style={styles.arrowIconRight}
          />
        </TouchableOpacity>

        <ProductModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          product={selectedProduct}
        />
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your 1st Month Kit – ({products.length} products)</Text>

      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>What you get for ₹{totalPrice.toFixed(0)}</Text>
        <View style={styles.line1} />

        <View style={styles.row}>
          <Text style={styles.itemText}>1-Month Customized Kit</Text>
          <Text style={styles.priceText}>₹{totalPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.leftContent}>
            <Text style={styles.itemText}>Diabetes Coach Support</Text>
          </View>
          <Text style={styles.free}>Free</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.leftContent}>
            <Text style={styles.itemText}>Doctor Prescription</Text>
          </View>
          <Text style={styles.free}>Free</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.leftContent}>
            <Text style={styles.itemText}>Ayurvedic Diet Plan</Text>
          </View>
          <Text style={styles.free}>Free</Text>
        </View>

        <View style={styles.line1} />
        <View style={styles.row}>
          <Text style={styles.summaryTitlee}>Total Payment</Text>
          <Text style={styles.summaryTitlee}>₹{totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.giftSection}>
        <View style={styles.line2} />
        <Text style={styles.giftHeading}>Free Gifts For You</Text>
        <Image
          source={{
            uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Group_825.png?v=1747490503',
          }}
          style={styles.giftImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.line2} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    // margin: 16
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    marginVertical: 8,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#A3A3A3',
    borderRadius: 10,
  },
  productImage: {
    width: 60,
    height: 120,
    resizeMode: 'cover',
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'Poppins',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  line: {
    height: 0.75,
    backgroundColor: '#E9E9E9',
    marginVertical: 10,
    width: '100%',
  },
  tag: {
    fontSize: 10,
    fontWeight: 500,
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
    alignSelf: 'flex-start',
    color: '#333',
  },
  arrowIconRight: {
    width: 20,
    height: 20,
    marginLeft: 8,
    marginRight: 10,
    alignSelf: 'center',
  },
  price: {
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  arrowIcon: {
    width: 20,
    height: 20,
    marginTop: 4,
  },
  summaryBox: {
    borderWidth: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  summaryTitlee: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  check: {
    height: 14,
    width: 7,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#03AD31',
    transform: [{ rotate: '45deg' }],
    marginRight: 8,
  },
  itemText: {
    fontSize: 16,
    color: '#000',
  },
  priceText: {
    fontSize: 16,
    color: '#000',
  },
  free: {
    fontSize: 16,
    color: '#03AD31',
  },
  line1: {
    height: 2,
    backgroundColor: '#E9E9E9',
    marginVertical: 10,
    width: '100%',
  },
  line2: {
    height: 5,
    backgroundColor: '#F4F4F4',
    marginVertical: 10,
    width: '100%',
  },
  giftSection: {
    marginVertical: 16,
  },
  giftHeading: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins',
    padding: 16,
  },
  giftImage: {
    width: '90%',
    height: 100,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
});



