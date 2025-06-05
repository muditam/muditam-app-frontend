import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { height } = Dimensions.get('window');

export default function SugarDrop() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null); // 'upload' or 'camera'
  const [slideAnim] = useState(new Animated.Value(height));

  const [activeTab, setActiveTab] = useState('Timeline');

  const handleAddImage = async (type, method) => {
    let result;
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Camera access is required');
        return;
      }
      result = await ImagePicker.launchCameraAsync();
    } else {
      result = await ImagePicker.launchImageLibraryAsync();
    }

    if (!result.canceled) {
      const now = new Date();
      const newRecord = {
        id: Date.now(),
        image: result.assets[0].uri,
        date: now.toISOString(),
        tag: method === 'before' ? 'Pre-meal' : 'Post-meal',
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setRecords((prev) => [...prev, newRecord]);
      closeModal();
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setRecords((prev) => prev.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  const openModal = (action) => {
    setSelectedAction(action);
    setShowMethodModal(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowMethodModal(false));
  };

  const groupByMonth = records.reduce((acc, record) => {
    const dateObj = new Date(record.date);
    const monthKey = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!acc[monthKey]) acc[monthKey] = {};
    const dateKey = dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (!acc[monthKey][dateKey]) acc[monthKey][dateKey] = [];
    acc[monthKey][dateKey].push(record);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/me')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#543287" />
          </TouchableOpacity>
          <Text style={styles.heading}>Sugar Drop</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Timeline' && styles.activeTab]}
            onPress={() => setActiveTab('Timeline')}
          >
            <Text style={[styles.tabText, activeTab === 'Timeline' && styles.activeTabText]}>
              Timeline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Report' && styles.activeTab]}
            onPress={() => {
              setActiveTab('Report');
              router.push('/report');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'Report' && styles.activeTabText]}>
              Report
            </Text>
          </TouchableOpacity>
        </View>

        {/* Timeline Content */}
        {activeTab === 'Timeline' && (
          <>
            {Object.keys(groupByMonth)
              .sort((a, b) => new Date(b) - new Date(a))
              .map((month) => (
                <View key={month} style={styles.monthBlock}>
                  <Text style={styles.monthTitle}>{month}</Text>
                  {Object.keys(groupByMonth[month])
                    .sort((a, b) => new Date(b) - new Date(a))
                    .map((date) => (
                      <View key={date} style={styles.dateBlock}>
                        <Text style={styles.dateTitle}>{date}</Text>
                        <View style={styles.imagesRow}>
                          {groupByMonth[month][date].map((item) => (
                            <View key={item.id} style={styles.imageCard}>
                              <Image source={{ uri: item.image }} style={styles.image} />
                              <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => handleDelete(item.id)}
                              >
                                <Ionicons name="trash-outline" size={16} color="black" />
                              </TouchableOpacity>
                              <View style={styles.tag}>
                                <Text style={styles.tagText}>{item.tag}</Text>
                              </View>
                              <Text style={styles.timeLabel}>{item.time}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                </View>
              ))}
          </>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => openModal('upload')}
        >
          <Text style={styles.bottomButtonText}>Upload Image</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => openModal('camera')}
        >
          <Text style={styles.bottomButtonText}>Take a Picture</Text>
        </TouchableOpacity>
      </View>

      {/* Animated Bottom Modal */}
      {showMethodModal && (
        <Animated.View style={[styles.modalBox, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
            <Entypo name="cross" size={24} color="gray" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {selectedAction === 'upload' ? 'Upload Image' : 'Take a Picture'}
          </Text>
          <Text style={styles.modalSubtitle}>Select a method to add records</Text>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleAddImage(selectedAction, 'before')}
          >
            <Ionicons name="camera" size={24} color="#7C3AED" />
            <View>
              <Text style={styles.modalOptionText}>Before Meal</Text>
              <Text style={styles.modalOptionSub}>Upload glucose photo before eating</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleAddImage(selectedAction, 'after')}
          >
            <Ionicons name="camera" size={24} color="#7C3AED" />
            <View>
              <Text style={styles.modalOptionText}>After Meal</Text>
              <Text style={styles.modalOptionSub}>Upload glucose photo after eating</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  backBtn: { marginRight: 12 },
  heading: { fontSize: 20, fontWeight: 'bold', color: '#543287' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 30,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 30 },
  activeTab: { backgroundColor: '#543287' },
  tabText: { fontSize: 14, color: '#543287', fontWeight: '600' },
  activeTabText: { color: 'white' },
  monthBlock: { marginBottom: 16, paddingHorizontal: 16 },
  monthTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  dateBlock: { marginBottom: 12 },
  dateTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  imagesRow: { flexDirection: 'row', flexWrap: 'wrap' },
  imageCard: {
    width: '46%',
    margin: '2%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 6,
    position: 'relative',
  },
  image: { width: '100%', height: 120, borderRadius: 4 },
  deleteBtn: { position: 'absolute', top: 6, right: 6 },
  tag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#f3f3f3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: { fontSize: 10, fontWeight: '600' },
  timeLabel: {
    alignSelf: 'center',
    marginTop: 6,
    fontSize: 12,
    backgroundColor: '#333',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  bottomButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  bottomButtonText: { color: 'white', fontWeight: '600' },
  modalBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingTop: 50,   // add space at top!
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
  },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#555', marginBottom: 16, textAlign: 'center' },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalOptionText: { fontSize: 14, fontWeight: '600', marginLeft: 12 },
  modalOptionSub: { fontSize: 12, color: '#555', marginLeft: 12 },
});
