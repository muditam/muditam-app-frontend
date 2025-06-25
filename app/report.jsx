import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ScrollViewComponent,
  Animated,
  Dimensions,
  findNodeHandle,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Entypo } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";


const dateOptions = [
  "Last 7 days",
  "Last 30 days",
  "Last 60 days",
  "Last 90 days",
];


const filters = ["All", "Prescription", "Medical Report", "Lab Report"];
const { height } = Dimensions.get("window");


export default function Report() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Report");
  const [selectedDate, setSelectedDate] = useState("Last 7 days");
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [deleteOption, setDeleteOption] = useState(false);


  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedReportId, setSelectedReportId] = useState(null);


  const [slideAnim] = useState(new Animated.Value(height));


  const menuAnchorRefs = React.useRef({});


  const [reports, setReports] = useState([]);


  const openModal = (action) => {
    setShowMethodModal(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };


  const openMenu = (id) => {
    const ref = menuAnchorRefs.current[id];
    if (!ref) return;


    ref.measure((fx, fy, width, heightRef, px, py) => {
      const xOffset = 40;
      const yOffset = -43;


      setMenuPosition({
        x: px + xOffset,
        y: py + heightRef + yOffset,
      });
      setSelectedReportId(id);
      setMenuVisible(true);
    });
  };


  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedReportId(null);
  };


  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowMethodModal(false));
  };


  const filteredReports =
    selectedFilter === "All"
      ? reports
      : reports.filter((item) => item.type === selectedFilter);


  const groupedReports = filteredReports.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});


  const handleUpload = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: false,
      });
      if (result.canceled) {
        setShowUploadModal(false);
        return;
      }
      const now = new Date();
      const newReport = {
        id: Date.now(),
        type,
        title: result.assets[0]?.name || "Untitled Report",
        date: now.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setReports((prev) => [...prev, newReport]);
      setShowUploadModal(false);
    } catch (error) {
      console.error("File pick error:", error);
      setShowUploadModal(false);
    }
  };


  const handleDelete = (id) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setReports((prev) => prev.filter((item) => item.id !== id));
            setMenuVisible(false);
            setShowUploadModal(false);
          },
        },
      ]
    );
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} />
            </TouchableOpacity>
            <Text style={styles.heading}>Report</Text>
          </View>
          {/* Header Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "Timeline" && styles.activeTab]}
              onPress={() => router.push('/me')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Timeline" && styles.activeTabText,
                ]}
              >
                Timeline
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "Report" && styles.activeTab]}
              onPress={() => setActiveTab("Report")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Report" && styles.activeTabText,
                ]}
              >
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
            <Entypo name="chevron-down" size={24} color="#333" />
          </TouchableOpacity>


          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          </ScrollView>


          {/* Reports Grouped by Date */}


          {Object.entries(
            filteredReports.reduce((acc, report) => {
              if (!acc[report.date]) acc[report.date] = [];
              acc[report.date].push(report);
              return acc;
            }, {})
          ).map(([date, items]) => (
            <View key={date}>
              <Text style={styles.sectionDate}>{date}</Text>
              <View style={styles.reportGrid}>
                {items.map((item) => (
                  <View key={item.id} style={styles.reportCard}>
                    <View style={styles.reportTag}>
                      <Text style={styles.reportTagText}>{item.type}</Text>
                    </View>


                    <View style={styles.reportContent}>
                      <View style={styles.reportPlaceholder} />
                      <Text style={styles.reportTitle}>{item.title}</Text>
                      <Text style={styles.reportTime}>{item.time}</Text>


                      <TouchableOpacity
                        ref={(ref) => (menuAnchorRefs.current[item.id] = ref)}
                        onPress={() =>
                          setSelectedReportId((prevId) =>
                            prevId === item.id ? null : item.id
                          )
                        }
                      >
                        <Entypo
                          name="dots-three-vertical"
                          style={styles.moreBtn}
                        />
                      </TouchableOpacity>


                      {selectedReportId === item.id && (
                        <View style={styles.menuBox}>
                          <TouchableOpacity
                            onPress={() => handleDelete(selectedReportId)}
                          >
                            <Text style={{ fontSize: 18 }}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>


        {/* Date Selection Modal */}
        <Modal
          visible={showDateModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose date</Text>
                <TouchableOpacity onPress={() => setShowDateModal(false)}>
                  <Entypo
                    name="cross"
                    size={22}
                    backgroundColor="#D9D9D9"
                    borderRadius={50}
                  />
                </TouchableOpacity>
              </View>
              {/* <View style={styles.separator} /> */}
              {dateOptions.map((option, index) => (
                <React.Fragment key={option}>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => {
                      setSelectedDate(option);
                      setShowDateModal(false);
                    }}
                  >
                    <View style={styles.radioCircle}>
                      {selectedDate === option && (
                        <View style={styles.radioSelected} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedDate === option &&
                          styles.modalOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>
        </Modal>


        {/* Upload Button */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setShowUploadModal(true)}
        >
          <Ionicons name="add" size={22} color="white" />
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>


        <Modal
          visible={showUploadModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowUploadModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select report type</Text>


                <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                  <Entypo
                    name="cross"
                    size={22}
                    backgroundColor="#D9D9D9"
                    borderRadius={50}
                  />
                </TouchableOpacity>
              </View>
             
              {["Prescription", "Lab Report", "Medical Report"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.modalOption}
                  onPress={() => handleUpload(type)}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#7C3AED"
                  />
                  <Text style={[styles.modalOptionText, { marginLeft: 10 }]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  header: {
   flexDirection: 'row', alignItems: 'center', padding: 16, 
  },
  heading: { fontSize: 20, fontWeight: "600", marginLeft: 12,  },


  scrollContent: { paddingBottom: 100 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 50,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 2,
    borderColor: "#D9D9D9",
    borderWidth: 1,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 50 },
  activeTab: { backgroundColor: "#252525" },
  tabText: { fontSize: 16, color: "#D9D9D9" },
  activeTabText: { color: "white" },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 12,
  },
  dateText: { fontSize: 14, color: "#8B8B8B", marginRight: 8 },
  dateValue: { flex: 1, fontSize: 16, fontWeight: "600" },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#543087",
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilter: { backgroundColor: "#9D57FF", borderColor: "#9D57FF" },
  filterText: { fontSize: 14 },
  activeFilterText: { color: "white" },
  sectionDate: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 16,
    marginBottom: 10,
  },
  reportGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 16,
  },
  reportCard: {
    width: "47%",
    backgroundColor: "#f9f9f9",
    borderRadius: 9,
    marginBottom: 12,
    padding: 8,
    position: "relative",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  moreBtn: {
    position: "absolute",
    bottom: 8,
    right: 0,
    fontSize: 22,
  },


  menuBox: {
    position: "absolute",
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingVertical: 7,
    bottom: -25,
    right: 16,
    zIndex: 1,


    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },


  reportTag: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
    backgroundColor: "white",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reportTagText: { fontSize: 12, fontWeight: "500" },
  reportPlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#B2B2B2",
    marginBottom: 8,
  },
  reportTitle: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  reportTime: { fontSize: 14, color: "#969696" },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9D57FF",
    paddingVertical: 13,
    paddingHorizontal: 45,
    borderRadius: 4,
    position: "absolute",
    bottom: 25,
    right: 16,
 
  },
  uploadButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: 500,
    marginLeft: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingHorizontal: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "500" },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomColor: "#6C6C6C",
    borderTopWidth: 0.5,
  },
  modalOptionText: { fontSize: 16, color: "#6C6C6C" },


  modalOptionTextSelected: {
    color: "#000",
    fontWeight: "500",
  },


  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#727272",
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#543087",
    borderColor: "#543087",
  },


  separator: {
    height: 1,
    backgroundColor: "#D9D9D9",
    marginVertical: 4,
  },
});





