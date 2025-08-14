import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioButton } from 'react-native-paper';

const barImages = {
  supplements: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Group_917.webp?v=1745650473',
  diet: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Group_916.webp?v=1745650473',
  lifestyle: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Group_915.webp?v=1745650473',
};

export default function HbA1cProgressView() {
  const [hba1cValue, setHba1cValue] = useState(9.5);
  const [selected, setSelected] = useState('supplements');

  const getCurrentDateFormatted = () => {
    const d = new Date();
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }); 
  };

  const getGoalDateFormatted = () => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTargetHbA1c = () => {
  let target = hba1cValue;
  if (selected === 'supplements') target = hba1cValue - 0.5;
  if (selected === 'diet') target = hba1cValue - 1.5;
  if (selected === 'lifestyle') target = hba1cValue - 1.8;
  return Math.max(4.9, target).toFixed(1);
  };


  useEffect(() => {
    const loadAnswers = async () => {
      const data = await AsyncStorage.getItem('quizProgress');
      const parsed = JSON.parse(data || '{}');
      const q4 = parsed.answers?.[3]; // index 3 = question 4
      const match = /([0-9.]+)%/.exec(q4);
      if (match) setHba1cValue(parseFloat(match[1]));
    };
    loadAnswers();
  }, []);

  useEffect(() => {
  const fetchUserHbA1c = async () => {
    try {
      const user = await AsyncStorage.getItem('userDetails');
      const phone = JSON.parse(user || '{}')?.phone;
      if (!phone) return;

      const response = await fetch(`https://muditam-app-backend-ca1c8b03db09.herokuapp.com/api/quiz/${phone}`);
      const data = await response.json();

      if (response.ok && data.hba1c) {
        setHba1cValue(data.hba1c);
      }
    } catch (error) {
      console.error('Failed to fetch user hba1c:', error);
    }
  };

  fetchUserHbA1c();
}, []);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results Expected in 90 Days</Text>

      <View style={styles.imageSection}>
        <Image
          source={{ uri: barImages[selected] }}
          style={styles.barImage}
          resizeMode="contain"
        />
        <Text style={styles.goalLabel}>
          {getGoalDateFormatted()} Goal{' '}
          <Text style={{ color: '#03AD31', fontWeight: 'bold', fontSize:30 }}>{getTargetHbA1c()}%</Text>
        </Text>
        <Text style={styles.currentLabel}>
          {getCurrentDateFormatted()}{' '}
          <Text style={{ color: '#E60000', fontWeight: 'bold', fontSize:30 }}>{hba1cValue}%</Text>
        </Text>
      </View>

      <View style={styles.optionsCard}>
        <Text style={styles.optionsTitle}>Select an option to see expected results</Text>

        {[
          { key: 'supplements', label: 'Only Supplements' },
          { key: 'diet', label: 'With Diet Modification & Supplements' },
          { key: 'lifestyle', label: 'With Diet, Lifestyle modifications & Supplements' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => setSelected(item.key)}
            activeOpacity={0.8}
            style={[
              styles.radioItem,
              selected === item.key && styles.radioItemActive,
            ]}
          >
            <RadioButton
              value={item.key}
              status={selected === item.key ? 'checked' : 'unchecked'}
              onPress={() => setSelected(item.key)}
              color="#543087"
            />
            <Text
              style={[
                styles.radioText,
                selected === item.key && styles.radioTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor:"#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins',
    marginBottom: 16,
  },
  imageSection: {
    alignItems: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  barImage: {
    width: '100%',
    height: 100,
    marginTop: 15,
    marginBottom: 20,
  },
  goalLabel: {
    position: 'absolute',
    top: -16,
    left: 100,
    fontSize: 12,
    fontFamily: 'Poppins',
    color: '#000',
  },
  currentLabel: {
    position: 'absolute',
    bottom: -10,
    right: 10,
    fontSize: 12,
    fontFamily: 'Poppins',
    color: '#000',
  },
  optionsCard: {
    marginTop: 24, 
    padding: 12,
    borderRadius: 12,
    paddingBottom:20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins',
    color: '#000',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  radioItemActive: {
    borderColor: '#543087',
    backgroundColor: '#FAF6FF',
    borderWidth:0.25,
  },
  radioText: {
    fontSize: 16,
    fontFamily: 'Poppins',
        width:"90%"

  },
});


