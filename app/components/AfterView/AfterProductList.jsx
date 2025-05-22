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

export default function AfterProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem('hba1c');
        const hba1c = stored ? JSON.parse(stored) : null;

        const res = await fetch('http://192.168.1.9:3001/api/shopify/products');
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
        <View style={styles.row}>
          <Text>1-Month Customised Kit</Text>
          <Text>₹{totalPrice.toFixed(0)}</Text>
        </View>
        <View style={styles.row}>
          <Text>✅ Diabetic Coach Support</Text>
          <Text style={styles.free}>Free</Text>
        </View>
        <View style={styles.row}>
          <Text>✅ Doctor Prescription</Text>
          <Text style={styles.free}>Free</Text>
        </View>
        <View style={styles.row}>
          <Text>✅ Ayurvedic Diet Plan</Text>
          <Text style={styles.free}>Free</Text>
        </View>
      </View>

      <View style={styles.giftSection}>
        <Text style={styles.giftHeading}>Free Gift’s For You</Text>
        <Image
          source={{
            uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Group_825.png?v=1747490503',
          }}
          style={styles.giftImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { margin: 16 },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
    marginBottom: 10,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 0,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 120,
    resizeMode: 'contain',
    marginRight: 8,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  subtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  bottomRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 8,
},
  line: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 6,
    width: '100%',
  },
  tag: {
    fontSize: 10,
    backgroundColor: '#eee',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    color: '#333',
  },
  arrowIconRight: {
  width: 20,
  height: 20,
  marginLeft: 8,
  alignSelf: 'center',
},
  price: {
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  arrowIcon: {
    width: 20,
    height: 20,
    marginTop: 4,
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: '#fff',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'Poppins',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  free: {
    color: '#28A745',
    fontWeight: '600',
  },
  giftSection: {
    backgroundColor: '#F9F9F9',
    marginTop: 24,
  },
  giftHeading: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'Poppins',
  },
  giftImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
});
