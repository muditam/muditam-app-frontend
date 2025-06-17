import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TOTAL_KITS = 5;

const kitDescriptions = {
  1: {
    title: 'Start Your Journey',
    desc: 'Cleanse and prepare your body with herbs that support insulin sensitivity.',
  },
  2: {
    title: 'Improving blood sugar level, Control HbA1c',
    desc: 'Using ingredients like karela, jamun, neem we will control high sugar level and prevent...',
  },
  3: { title: 'Reverse Symptoms', desc: 'Improve pancreas function and reduce dependence on medication.' },
  4: { title: 'Stabilize & Prevent Relapse', desc: 'Continue progress and stabilize sugar levels long-term.' },
  5: { title: 'Maintain Good Health', desc: 'Support healthy lifestyle and long-term diabetes control.' },
};

export default function KitProgressSection({ currentKit = 2, completedKits = [] }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Visible Results Will Take {TOTAL_KITS} Kits</Text>
      <Text style={styles.subtext}>You are on kit number {currentKit}.</Text>
      <Text style={styles.subtext}>Use complete recommended kit for best results.</Text>

      {/* Current Kit */}
      <View style={[styles.kitCard, styles.currentKit]}>
        <View style={styles.cardHeader}>
          <Text style={styles.kitTitle}>Kit {currentKit}</Text>
          <View style={styles.currentBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.currentText}>CURRENT</Text>
          </View>
        </View>
        <Text style={styles.kitDescTitle}>{kitDescriptions[currentKit]?.title}</Text>
        <Text style={styles.kitDesc}>{kitDescriptions[currentKit]?.desc}</Text>
      </View>

      {/* All Kits Scrollable */}
      <Text style={styles.subHeader}>Other Kits</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kitsRow}>
        {Array.from({ length: TOTAL_KITS }, (_, i) => {
          const kitNum = i + 1;
          if (kitNum === currentKit) return null;

          const isCompleted = completedKits.includes(kitNum);
          return (
            <View key={kitNum} style={styles.kitMiniCard}>
              <View style={styles.kitMiniHeader}>
                <Text style={styles.kitMiniTitle}>Kit {kitNum}</Text>
                {isCompleted && <Ionicons name="checkmark-circle" size={18} color="green" />}
              </View>
              <Text style={styles.kitMiniDesc}>{kitDescriptions[kitNum]?.title}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#7C4DFF',
    marginTop: 15,
  },
  header: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
    color: 'white',
    marginBottom: 2,
  },
  subHeader: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  currentKit: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginBottom: 20,
  },
  kitCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  kitDescTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
  },
  kitDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'green',
    marginRight: 4,
  },
  currentText: {
    color: 'green',
    fontSize: 12,
    fontWeight: '600',
  },
  kitsRow: {
    paddingRight: 8,
  },
  kitMiniCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kitMiniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kitMiniTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  kitMiniDesc: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
    marginTop: 8,
  },
});
