import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Entypo } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

const dateOptions = [
  'Last 7 days',
  'Last 30 days',
  'Last 60 days',
  'Last 90 days',
  'Custom',
];

const filters = ['All', 'Prescription', 'Medical Report', 'Lab Report'];

export default function Report() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Report');
  const [selectedDate, setSelectedDate] = useState('Last 7 days');
  const [showDateModal, setShowDateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showDotsMenu, setShowDotsMenu] = useState(null); // ID of the card showing the dots menu

  const [reports, setReports] = useState([]);

  const handleUpload = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false });
      if (result.canceled) {
        setShowUploadModal(false);
        return;
      }
      const now = new Date();
      const newReport = {
        id: Date.now(),
        type,
        title: result.assets[0]?.name || 'Untitled Report',
        date: now.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setReports((prev) => [...prev, newReport]);
      setShowUploadModal(false);
    } catch (error) {
      console.error('File pick error:', error);
      setShowUploadModal(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Report', 'Are you sure you want to delete this report?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setReports((prev) => prev.filter((item) => item.id !== id));
          setShowDotsMenu(null);
        },
      },
    ]);
  };

  const filteredReports =
    selectedFilter === 'All'
      ? reports
      : reports.filter((item) => item.type === selectedFilter);

  const groupedReports = filteredReports.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Timeline' && styles.activeTab]}
            onPress={() => router.push('/sugardrop')}
          >
            <Text style={[styles.tabText, activeTab === 'Timeline' && styles.activeTabText]}>
              Timeline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Report' && styles.activeTab]}
            onPress={() => setActiveTab('Report')}
          >
            <Text style={[styles.tabText, activeTab === 'Report' && styles.activeTabText]}>
              Report
            </Text>
          </TouchableOpacity>
        </View>

        {/* Choose Date */}
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDateModal(true)}
        >
          <Text style={styles.dateText}>Choose date</Text>
          <Text style={styles.dateValue}>{selectedDate}</Text>
          <Entypo name="chevron-down" size={20} color="#333" />
        </TouchableOpacity>

        {/* Filters */}
        <View style={styles.filterRow}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.activeFilter,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reports List */}
        {Object.keys(groupedReports).length === 0 ? (
          <Text style={styles.noReportsText}>No reports yet.</Text>
        ) : (
          Object.keys(groupedReports)
            .sort((a, b) => new Date(b) - new Date(a))
            .map((date) => (
              <View key={date}>
                <Text style={styles.sectionDate}>{date}</Text>
                <View style={styles.reportGrid}>
                  {groupedReports[date].map((item) => (
                    <View key={item.id} style={styles.reportCard}>
                      <View style={styles.reportTag}>
                        <Text style={styles.reportTagText}>{item.type}</Text>
                      </View>
                      <View style={styles.reportContent}>
                        <View style={styles.reportPlaceholder} />
                        <Text style={styles.reportTitle}>{item.title}</Text>
                        <Text style={styles.reportTime}>{item.time}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.moreBtn}
                        onPress={() =>
                          setShowDotsMenu(showDotsMenu === item.id ? null : item.id)
                        }
                      >
                        <Entypo name="dots-three-vertical" size={14} color="#333" />
                      </TouchableOpacity>

                      {showDotsMenu === item.id && (
                        <View style={styles.dotsMenu}>
                          <TouchableOpacity
                            style={styles.dotsMenuItem}
                            onPress={() => {
                              Alert.alert('Details', 'Feature coming soon!');
                              setShowDotsMenu(null);
                            }}
                          >
                            <Text style={styles.dotsMenuText}>View Details</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.dotsMenuItem}
                            onPress={() => handleDelete(item.id)}
                          >
                            <Text style={[styles.dotsMenuText, { color: 'red' }]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))
        )}
      </ScrollView>

      {/* Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => setShowUploadModal(true)}
      >
        <Ionicons name="add" size={18} color="white" />
        <Text style={styles.uploadButtonText}>Upload</Text>
      </TouchableOpacity>

      {/* Date Selection Modal */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose date</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Entypo name="cross" size={22} color="#333" />
              </TouchableOpacity>
            </View>
            {dateOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedDate(option);
                  setShowDateModal(false);
                }}
              >
                <View
                  style={[
                    styles.radioCircle,
                    selectedDate === option && styles.radioSelected,
                  ]}
                />
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Upload Type Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Type</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Entypo name="cross" size={22} color="#333" />
              </TouchableOpacity>
            </View>
            {['Prescription', 'Lab Report', 'Medical Report'].map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.modalOption}
                onPress={() => handleUpload(type)}
              >
                <Ionicons name="document-text-outline" size={20} color="#7C3AED" />
                <Text style={[styles.modalOptionText, { marginLeft: 10 }]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
  flex: 1,
  backgroundColor: '#fff',
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
}, 
  scrollContent: { paddingBottom: 100 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 30,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 30 },
  activeTab: { backgroundColor: '#543287' },
  tabText: { fontSize: 14, color: '#543287', fontWeight: '600' },
  activeTabText: { color: 'white' },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
  },
  dateText: { fontSize: 14, color: '#555', marginRight: 8 },
  dateValue: { flex: 1, fontSize: 14, fontWeight: '600', color: '#333' },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilter: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filterText: { fontSize: 12, color: '#555' },
  activeFilterText: { color: 'white' },
  sectionDate: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 16,
    marginBottom: 8,
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  reportCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    padding: 8,
    position: 'relative',
  },
  reportTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reportTagText: { fontSize: 10, fontWeight: '600' },
  reportContent: { alignItems: 'center', marginTop: 20 },
  reportPlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: '#ddd',
    borderRadius: 6,
    marginBottom: 8,
  },
  reportTitle: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  reportTime: { fontSize: 10, color: '#555' },
  moreBtn: { position: 'absolute', top: 6, right: 6 },
  dotsMenu: {
    position: 'absolute',
    top: 26,
    right: 6,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  dotsMenuItem: { paddingVertical: 6, paddingHorizontal: 12 },
  dotsMenuText: { fontSize: 12, color: '#333' },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  uploadButtonText: { color: 'white', fontWeight: '600', marginLeft: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#7C3AED',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: '#7C3AED',
  },
  modalOptionText: { fontSize: 14, color: '#333' },
  noReportsText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: '#999',
  },
});
