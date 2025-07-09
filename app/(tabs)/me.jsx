import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Switch,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, FontAwesome5, Entypo } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import DateTimePicker from "@react-native-community/datetimepicker";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


export default function MeScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showReminderSheet, setShowReminderSheet] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderAllEnabled, setReminderAllEnabled] = useState(true);
  const [showConfirmOffModal, setShowConfirmOffModal] = useState(false);


  // new state
  const [reminderType, setReminderType] = useState("water");
  const [reminders, setReminders] = useState([]); // [{id, type, time, enabled}]
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newTime, setNewTime] = useState("08:00");
  const [editingReminderId, setEditingReminderId] = useState(null);


  const getStorageKey = (userId) => `reminders_${userId}`;


  const saveReminder = async (type, time) => {
    try {
      const res = await fetch("http://192.168.1.23:3001/api/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, time, userId: user._id }),
      });
      if (res.ok) console.log("Reminder saved");
    } catch (e) {
      console.error("Saving reminder failed", e);
    }
  };


  const saveRemindersToStorage = async (userId, reminders) => {
    try {
      await AsyncStorage.setItem(
        getStorageKey(userId),
        JSON.stringify(reminders)
      );
    } catch (e) {
      console.error("Failed to save reminders:", e);
    }
  };


  const getRemindersFromStorage = async (userId) => {
    try {
      const stored = await AsyncStorage.getItem(getStorageKey(userId));
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load reminders:", e);
      return [];
    }
  };


  const handleSaveAllReminders = () => {
    const filtered = reminders.filter((r) => r.type === reminderType);
    filtered.forEach((r) => saveReminder(r.type, r.time));
    saveRemindersToStorage(user._id, reminders);
    setShowReminderSheet(false);
  };


  const handleConfirmTurnOffReminders = () => {
    const turnedOffReminders = reminders.map((r) => ({
      ...r,
      enabled: false,
    }));


    setReminders(turnedOffReminders);
    saveRemindersToStorage(user._id, turnedOffReminders);
    setReminderAllEnabled(false);
    setShowConfirmOffModal(false);
    setShowReminderSheet(false);
  };


  useEffect(() => {
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem("userDetails");
        if (!stored) return;


        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        registerForPush(parsedUser._id);


        const localReminders = await getRemindersFromStorage(parsedUser._id);


        setReminders(localReminders);


        if (localReminders.length && localReminders.some((r) => r.enabled)) {
          setReminderAllEnabled(true);
        } else {
          setReminderAllEnabled(false);
        }
      } catch (err) {
        console.error("Error loading user/reminder", err);
      }
    };


    init();
  }, []);


  const registerForPush = async (userId) => {
    if (!Device.isDevice) {
      console.warn("⚠️ Not a physical device");
      return;
    }


    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;


    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }


    if (finalStatus !== "granted") {
      console.warn("🚫 Permission not granted for push notifications");
      return;
    }


    // ✅ Create Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }


    // ✅ Get Expo token
    const token = (await Notifications.getExpoPushTokenAsync()).data;


    // ✅ Send token to backend
    try {
      const res = await fetch("http://192.168.1.11:3001/api/user/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, expoPushToken: token }),
      });


      if (res.ok) {
        console.log("✅ Token saved to backend");
      } else {
        const errorText = await res.text();
        console.error("Failed to save token:", errorText);
      }
    } catch (err) {
      console.error("Error sending token to backend:", err);
    }
  };


  const handleLogoutConfirm = async () => {
    try {
      await AsyncStorage.removeItem("userDetails");
      setShowLogoutModal(false);
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Profile block */}
        <TouchableOpacity
          style={styles.profileBlock}
          onPress={() => router.push("/myprofile")}
        >
          <View style={styles.profileAvatar} />
          <Text style={styles.profileName}>{user?.name || "Guest"}</Text>
          <Entypo name="chevron-right" size={22} color="black" />
        </TouchableOpacity>


        {/* Buy Kit Box */}
        <View style={styles.buyKitBox}>
          <View style={styles.row2}>
            <Ionicons
              name="cart-outline"
              size={28}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.buyKitHeaderText}>Once you buy your kit</Text>
          </View>
          <Text style={styles.buyKitDescription}>
            Muditam Exerts will approve your plan and build a detailed
            prescription.
          </Text>
          <TouchableOpacity
            style={styles.buyNowButton}
            onPress={() => console.log("Buy Now clicked")}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>


        {/* Buttons Row */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.buttonItem}
            onPress={() => router.push("/sugardrop")}
          >
            <View style={styles.iconCircle}>
              <FontAwesome5 name="tint" size={24} color="white" />
            </View>
            <Text style={styles.buttonText}>Sugar Drop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonItem}
            onPress={() =>
              router.push({
                pathname: "/needHelpContent/NeedHelpFullScreen",
                params: { title: "FAQs" },
              })
            }
          >
            <View style={styles.iconCircle}>
              <Ionicons name="help-circle-outline" size={28} color="white" />
            </View>
            <Text style={styles.buttonText}>Help & Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonItem}
            onPress={() => {
              const phoneNumber = "8989174741";
              const url = `https://wa.me/91${phoneNumber}`;
              Linking.openURL(url).catch((err) =>
                console.error("Failed to open WhatsApp:", err)
              );
            }}
          >
            <View style={styles.iconCircle}>
              <FontAwesome5 name="whatsapp" size={24} color="white" />
            </View>
            <Text style={styles.buttonText}>Chat With Us</Text>
          </TouchableOpacity>
        </View>


        {/* Links */}
        {[
          { title: "All Products", route: "/products" },
          { title: "Terms & Policies", route: "/terms" },
          { title: "Read More", route: "/read-more" },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => router.push(item.route)}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>{item.title}</Text>
            <Entypo name="chevron-right" size={20} color="black" />
          </TouchableOpacity>
        ))}


        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => setShowReminderSheet(true)}
        >
          <Text style={styles.linkText}>Set Daily Reminder</Text>
          <Entypo name="chevron-right" size={20} color="black" />
        </TouchableOpacity>


        <TouchableOpacity
          onPress={() => setShowLogoutModal(true)}
          style={styles.linkRow}
        >
          <Text style={styles.linkText}>Logout</Text>
          <Entypo name="chevron-right" size={20} color="black" />
        </TouchableOpacity>


        <Modal
          visible={showReminderSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowReminderSheet(false)}
        >
          <View style={styles.sheetOverlay}>
            <View style={styles.sheetContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowReminderSheet(false)}
              >
                <Ionicons name="close" size={26} color="#543087" />
              </TouchableOpacity>


              <Text style={{ fontSize: 20, fontWeight: "600" }}>
                Set Settings 🔔
              </Text>
              <Text
                style={{
                  color: "gray",
                  marginTop: 5,
                  marginRight: 16,
                  fontSize: 16,
                }}
              >
                We will send you push notifications daily to log your medicines
              </Text>


              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "600" }}>
                  Set Reminder
                </Text>
                <Switch
                  value={reminderAllEnabled}
                  onValueChange={(val) => {
                    if (!val) {
                      setShowConfirmOffModal(true);
                    } else {
                      const updated = reminders.map((r) => ({
                        ...r,
                        enabled: true,
                      }));
                      setReminders(updated);
                      saveRemindersToStorage(user._id, updated);
                      setReminderAllEnabled(true);
                    }
                  }}
                  trackColor={{ false: "#ccc", true: "#9D57FF" }}
                  thumbColor={reminderAllEnabled ? "#fff" : "#eee"}
                />
              </View>


              {/* Type selector as tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.optionGroup}
              >
                {[
                  { key: "water", icon: "water", label: "Water" },
                  { key: "food", icon: "restaurant", label: "Food" },
                  { key: "walk", icon: "walk", label: "Walk" },
                  { key: "supplement", icon: "medkit", label: "Supplement" },
                ].map(({ key, icon, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.typeButton,
                      reminderType === key && styles.typeButtonSelected,
                    ]}
                    onPress={() => setReminderType(key)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        reminderType === key && { color: "#fff" },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>


              {/* List of reminders for selected type */}
              <View style={{ height: 200 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {reminders.filter((r) => r.type === reminderType).length ===
                  0 ? (
                    <Text
                      style={{
                        color: "gray",
                        textAlign: "center",
                        marginVertical: 8,
                        fontSize: 16,
                      }}
                    >
                      No reminders set.
                    </Text>
                  ) : (
                    reminders
                      .filter((r) => r.type === reminderType)
                      .map((reminder) => (
                        <View
                          key={reminder.id}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#F3E8FF",
                            borderColor: "#543087",
                            borderWidth: 0.25,
                            borderRadius: 6,
                            marginBottom: 8,
                            paddingHorizontal: 16,
                            justifyContent: "space-between",
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              setEditingReminderId(reminder.id);
                              setReminderTime(reminder.time);
                              setShowTimePicker(true);
                            }}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Ionicons
                              name="time-outline"
                              size={18}
                              color="#543087"
                            />
                            <Text
                              style={{
                                marginLeft: 8,
                                fontSize: 16,
                                fontWeight: "600",
                              }}
                            >
                              {reminder.time}
                            </Text>
                          </TouchableOpacity>
                          <View
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              flexDirection: "row",
                            }}
                          >
                            <Switch
                              value={reminder.enabled}
                              onValueChange={(val) => {
                                setReminders(
                                  reminders.map((r) =>
                                    r.id === reminder.id
                                      ? { ...r, enabled: val }
                                      : r
                                  )
                                );
                              }}
                              trackColor={{ false: "#ccc", true: "#543087" }}
                              thumbColor={reminder.enabled ? "#fff" : "#eee"}
                              ios_backgroundColor="#ccc"
                            />
                            <TouchableOpacity
                              onPress={() =>
                                setReminders(
                                  reminders.filter((r) => r.id !== reminder.id)
                                )
                              }
                              style={{
                                marginLeft: 10,
                                padding: 4,
                                justifyContent: "center",
                              }}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={20}
                                color="gray"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                  )}
                </ScrollView>
              </View>


              {/* Add Reminder Button */}
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  style={styles.sheetSaveButton}
                  onPress={() => {
                    setEditingReminderId(null);
                    setShowTimePicker(true);
                  }}
                >
                  <Text style={styles.sheetSaveButtonText}>+ ADD</Text>
                </TouchableOpacity>


                <TouchableOpacity
                  style={styles.sheetSaveButton}
                  onPress={handleSaveAllReminders}
                >
                  <Text style={styles.sheetSaveButtonText}>SAVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>


          {/* Time Picker for Add/Edit */}
          {showTimePicker && (
            <DateTimePicker
              value={new Date(`1970-01-01T${newTime}:00`)}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (selectedDate) {
                  const hours = selectedDate
                    .getHours()
                    .toString()
                    .padStart(2, "0");
                  const minutes = selectedDate
                    .getMinutes()
                    .toString()
                    .padStart(2, "0");
                  if (editingReminderId) {
                    setReminders(
                      reminders.map((r) =>
                        r.id === editingReminderId
                          ? { ...r, time: `${hours}:${minutes}` }
                          : r
                      )
                    );
                  } else {
                    const newId =
                      Date.now().toString() +
                      Math.random().toString(36).slice(2, 7);
                    setReminders([
                      ...reminders,
                      {
                        id: newId,
                        type: reminderType,
                        time: `${hours}:${minutes}`,
                        enabled: true,
                      },
                    ]);
                  }
                }
              }}
            />
          )}
        </Modal>


        <Modal
          visible={showConfirmOffModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirmOffModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "80%",
                backgroundColor: "#fff",
                padding: 20,
                borderRadius: 10,
                elevation: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 10,
                }}
              >
                Turn Off Reminder?
              </Text>
              <Text style={{ fontSize: 16, color: "gray", marginBottom: 20 }}>
                Are you sure you want to turn off reminders? You won't receive
                any alerts.
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 12,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setShowConfirmOffModal(false); // cancel
                  }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: "#ccc",
                  }}
                >
                  <Text style={{ fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirmTurnOffReminders}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 4,
                    backgroundColor: "#9D57FF",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16 }}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>


        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                style={styles.modalClose}
              >
                <Entypo name="cross" size={22} color="gray" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Logout?</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to log out?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalLogoutButton}
                  onPress={handleLogoutConfirm}
                >
                  <Text style={styles.modalLogoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  profileBlock: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 24,
    marginHorizontal: -16,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    backgroundColor: "#9D57FF",
    borderRadius: 20,
    marginRight: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  buyKitBox: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    marginTop: -20,
  },
  buyKitHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  buyKitDescription: {
    fontSize: 12,
    textAlign: "left",
    marginBottom: 12,
  },
  buyNowButton: {
    backgroundColor: "#9D57FF",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: "flex-start",
    width: "100%",
  },
  buyNowText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: -8,
  },
  buttonItem: {
    flex: 1,
    alignItems: "center",
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#9D57FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    marginTop: 6,
    fontSize: 12,
    color: "#222",
    textAlign: "center",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  linkText: {
    fontSize: 14,
    color: "#111827",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    width: "80%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  row2: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 12,
  },
  modalMessage: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#A78BFA",
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  modalCancelText: {
    textAlign: "center",
    color: "white",
    fontWeight: "600",
  },
  modalLogoutButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#A78BFA",
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalLogoutText: {
    textAlign: "center",
    color: "#A78BFA",
    fontWeight: "600",
  },


  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sheetContainer: {
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  sheetTitle: { fontSize: 20, fontWeight: "600", marginVertical: 12 },
  sheetOption: { padding: 10 },
  sheetOptionSelected: { backgroundColor: "#E4D0FF", borderRadius: 8 },
  sheetOptionText: { fontSize: 16 },
  timePickerContainer: { paddingVertical: 12, alignItems: "center" },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },


  sheetSaveButton: {
    marginTop: 10,
    backgroundColor: "#9D57FF",
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: "center",
  },
  optionGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#543087",
    borderWidth: 0.5,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  typeButtonSelected: {
    backgroundColor: "#9D57FF",
    borderColor: "#9D57FF",
    borderRadius: 20,
  },
  typeButtonText: {
    fontSize: 18,
    color: "#543087",
    fontWeight: "500",
  },
  timeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 0.5,
    borderColor: "#543087",
    borderRadius: 6,
  },
  timeSelectorText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#543087",
    fontWeight: "500",
  },
  sheetSaveButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
    paddingHorizontal: 50,
  },
});



