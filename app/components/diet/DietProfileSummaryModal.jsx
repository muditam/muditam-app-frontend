import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatAllergyLabel, formatHealthConditionLabel } from '../../../utils/diet';

export default function DietProfileSummaryModal({ visible, profile, onClose, onEdit }) {
  if (!profile) return null;
  const rows = [
    ['Goal', profile.goal],
    ['Diet type', profile.dietType],
    ['Activity', profile.activityCode],
    ['Meals per day', profile.mealsPerDay],
    ['Weight', `${profile.weightKg} kg`],
    ['Target weight', `${profile.targetWeightKg} kg`],
    ['Calories', `${Math.round(profile.calorieTarget || 0)} kcal`],
    ['Smart target', `${Math.round(profile.smartCalorieTarget || 0)} smart`],
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile used for your plan</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.link}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {rows.map(([label, value]) => (
              <View key={label} style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{String(value || '-')}</Text>
              </View>
            ))}
            {!!profile.communityCodes?.length && <Text style={styles.details}>Communities: {profile.communityCodes.join(', ')}</Text>}
            {!!profile.healthConditions?.length && <Text style={styles.details}>Health conditions: {profile.healthConditions.map(formatHealthConditionLabel).join(', ')}</Text>}
            {!!profile.allergies?.length && <Text style={styles.details}>Allergies: {profile.allergies.map(formatAllergyLabel).join(', ')}</Text>}
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={onEdit}>
            <Text style={styles.buttonText}>Edit profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.36)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 19, fontWeight: '800', color: '#111827' },
  link: { color: '#6d28d9', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { color: '#64748b', fontWeight: '600' },
  value: { color: '#1e293b', fontWeight: '700' },
  details: { marginTop: 14, color: '#334155' },
  button: { backgroundColor: '#132f25', marginTop: 18, borderRadius: 16, alignItems: 'center', paddingVertical: 14 },
  buttonText: { color: '#fff', fontWeight: '800' },
});
