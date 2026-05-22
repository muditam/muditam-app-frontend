import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DietFoodCard({ food, onPress, onSwap }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{food.name}</Text>
          <Text style={styles.meta}>
            {food.portion} {food.portionUnit} · {food.source}
          </Text>
        </View>
        <View style={styles.badges}>
          {!!food.brandName && <Text style={styles.badge}>{food.brandName}</Text>}
          {!!food.nutriScore && <Text style={[styles.badge, styles.nutri]}>{food.nutriScore}</Text>}
        </View>
      </View>
      <View style={styles.metricsRow}>
        <Text style={styles.metric}>{Math.round(food.calories || 0)} kcal</Text>
        <Text style={styles.metric}>{Math.round(food.smartCalories || 0)} smart</Text>
        <Text style={styles.metric}>P {Math.round(food.protein || 0)}</Text>
        <Text style={styles.metric}>C {Math.round(food.carbs || 0)}</Text>
        <Text style={styles.metric}>F {Math.round(food.fat || 0)}</Text>
      </View>
      {!!food.remark && <Text style={styles.remark}>{food.remark}</Text>}
      {onSwap ? (
        <TouchableOpacity style={styles.swapButton} onPress={onSwap}>
          <Text style={styles.swapText}>Swap food</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 14, gap: 10, borderWidth: 1, borderColor: '#efe7da' },
  header: { flexDirection: 'row', gap: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  meta: { marginTop: 4, color: '#6b7280', fontSize: 12 },
  badges: { alignItems: 'flex-end', gap: 6 },
  badge: { backgroundColor: '#f4efe8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, color: '#8b5e34', fontSize: 11, fontWeight: '700' },
  nutri: { backgroundColor: '#ecfdf3', color: '#166534' },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: { fontSize: 12, color: '#334155', backgroundColor: '#f8fafc', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999 },
  remark: { color: '#7c2d12', fontSize: 12 },
  swapButton: { alignSelf: 'flex-start', backgroundColor: '#153c31', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  swapText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
