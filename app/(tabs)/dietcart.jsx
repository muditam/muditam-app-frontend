import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function DietCart() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Diet Insights</Text>

        {/* Chart Section */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Hydration This Week</Text>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/4165/4165954.png',
            }}
            style={styles.chartImage}
          />
          <Text style={styles.chartNote}>You met your goal 5 out of 7 days</Text>
        </View>

        {/* Hydration Tip */} 
        <View style={styles.tipCard}>
          <Ionicons name="water-outline" size={24} color="#9D57FF" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.tipTitle}>Stay Hydrated</Text>
            <Text style={styles.tipText}>Drinking 8 glasses of water daily helps cleanse your body and improve skin.</Text>
          </View>
        </View>

        {/* Call to Action */}
        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaText}>View Full Plan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView> 
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    fontFamily: 'Poppins',
  },
  chartCard: {
    backgroundColor: '#F6F0FF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'Poppins',
  },
  chartImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  chartNote: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#E0BBFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
    color: '#543287',
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins',
  },
  ctaBtn: {
    backgroundColor: '#9D57FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
});
