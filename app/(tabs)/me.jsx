import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, FontAwesome5, Entypo } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [reminderType, setReminderType] = useState('water');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [showTimePicker, setShowTimePicker] = useState(false); 

  const saveReminder = async (type, time) => { 
  try {
    const res = await fetch('http://192.168.1.32:3001/api/reminder', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ type, time, userId: user._id }),
    });
    if (res.ok) console.log('Reminder saved');
  } catch (e) {
    console.error('Saving reminder failed', e);
  }
};

useEffect(() => {
  const init = async () => {
    try {
      const stored = await AsyncStorage.getItem('userDetails');
      if (!stored) return;

      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      registerForPush(parsedUser._id);

      const res = await fetch(`http://192.168.1.32:3001/api/reminder/${parsedUser._id}`);
      if (res.ok) {
        const reminders = await res.json();
        const match = reminders.find(r => r.type === reminderType);
        setReminderTime(match?.time || '08:00');
      }
    } catch (err) {
      console.error("Error loading user/reminder", err);
    }
  };

  init();
}, [reminderType]);



const registerForPush = async (userId) => {
  if (!Device.isDevice) {
    console.warn("⚠️ Not a physical device");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn("🚫 Permission not granted for push notifications");
    return;
  }

  // ✅ Create Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // ✅ Get Expo token
  const token = (await Notifications.getExpoPushTokenAsync()).data; 

  // ✅ Send token to backend
  try {
    const res = await fetch('http://192.168.1.32:3001/api/user/save-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      await AsyncStorage.removeItem('userDetails');
      setShowLogoutModal(false);
      router.replace('/login');
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
          onPress={() => router.push('/myprofile')}
        >
          <View style={styles.profileAvatar} />
          <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
          <Entypo name="chevron-right" size={22} color="black" />
        </TouchableOpacity>

        {/* Buy Kit Box */}
        <View style={styles.buyKitBox}>
          <Ionicons name="cart-outline" size={28} color="white" style={{ marginBottom: 8 }} />
          <Text style={styles.buyKitHeaderText}>Once you buy your kit</Text>
          <Text style={styles.buyKitDescription}>
            Muditam Exerts will approve your plan and build a detailed prescription.
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
            onPress={() => router.push('/sugardrop')} // navigate to Sugar Drop page
          >
            <FontAwesome5 name="tint" size={20} color="#543087" />
            <Text style={styles.buttonText}>Sugar Drop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonItem}
            onPress={() => router.push({
              pathname: '/needHelpContent/NeedHelpFullScreen',
              params: { title: 'FAQs' }
            })}
          >
            <Ionicons name="help-circle-outline" size={22} color="#543087" />
            <Text style={styles.buttonText}>Help & Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonItem}>
            <FontAwesome5 name="whatsapp" size={20} color="#543087" />
            <Text style={styles.buttonText}>Chat With Us</Text>
          </TouchableOpacity>
          
        </View>

        {/* Links */}
        {[
          { title: 'All Products', route: '/products' },
          { title: 'Terms & Policies', route: '/terms' },
          { title: 'Read More', route: '/read-more' },
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

        {/* Logout */}
        <TouchableOpacity onPress={() => setShowLogoutModal(true)} style={styles.linkRow}>
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
      <Text style={styles.sheetTitle}>Set Daily Reminder</Text>

      <View style={styles.optionGroup}>
        {[
          { key: 'water', icon: 'water', label: 'Water 💧' },
          { key: 'food', icon: 'restaurant', label: 'Food 🍱' },
          { key: 'walk', icon: 'walk', label: 'Walk 🚶‍♂️' }
        ].map(({ key, icon, label }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.typeButton,
              reminderType === key && styles.typeButtonSelected
            ]}
            onPress={() => setReminderType(key)}
          >
            <Ionicons name={icon} size={20} color={reminderType === key ? '#fff' : '#543087'} />
            <Text style={[styles.typeButtonText, reminderType === key && { color: '#fff' }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time Picker */}
      <TouchableOpacity
        style={styles.timeSelector}
        onPress={() => setShowTimePicker(true)}
      >
        <Ionicons name="time-outline" size={18} color="#543087" />
        <Text style={styles.timeSelectorText}>Time: {reminderTime}</Text>
      </TouchableOpacity>

      {/* Save button */}
      <TouchableOpacity
        style={styles.sheetSaveButton}
        onPress={() => {
          saveReminder(reminderType, reminderTime);
          setShowReminderSheet(false);
        }}
      >
        <Text style={styles.sheetSaveButtonText}>Save Reminder</Text>
      </TouchableOpacity>
    </View>
  </View>

  {/* Native Time Picker */}
  {showTimePicker && (
    <DateTimePicker
      value={new Date(`1970-01-01T${reminderTime}:00`)}
      mode="time"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={(event, selectedDate) => {
        setShowTimePicker(false);
        if (selectedDate) {
          const hours = selectedDate.getHours().toString().padStart(2, '0');
          const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
          setReminderTime(`${hours}:${minutes}`);
        }
      }}
    />
  )}
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
              <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
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
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? 25 : 0, // handle Android status bar
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16, 
  },
  profileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F0FF',
    padding: 16,
    marginBottom: 24,
    marginHorizontal: -16,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#A78BFA',
    borderRadius: 20,
    marginRight: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  buyKitBox: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  buyKitHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  buyKitDescription: {
    color: 'white',
    fontSize: 12,
    textAlign: 'left',
    marginBottom: 12,
  },
  buyNowButton: {
    backgroundColor: '#DDD6FE',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  buyNowText: {
    color: '#5B21B6',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  buttonItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#E4D0FF',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  buttonText: {
    marginTop: 6,
    fontSize: 12,
    color: '#543087',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  linkText: {
    fontSize: 14,
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  modalMessage: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#A78BFA',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  modalCancelText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '600',
  },
  modalLogoutButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#A78BFA',
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalLogoutText: {
    textAlign: 'center',
    color: '#A78BFA',
    fontWeight: '600',
  },
  sheetOverlay: { flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.5)' },
sheetContainer: { backgroundColor:'white', padding:16, borderTopLeftRadius:12, borderTopRightRadius:12 },
sheetTitle: { fontSize:18, fontWeight:'600', marginBottom:12 },
sheetOption: { padding:10 },
sheetOptionSelected: { backgroundColor:'#E4D0FF', borderRadius:8 },
sheetOptionText: { fontSize:16 },
timePickerContainer: { paddingVertical:12, alignItems:'center' },
sheetSaveButton: { marginTop:20, backgroundColor:'#A78BFA', padding:12, borderRadius:8, alignItems:'center' },
optionGroup: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 16,
},
typeButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderColor: '#DDD6FE',
  borderWidth: 1,
  borderRadius: 8,
  paddingVertical: 10,
  marginHorizontal: 4,
  backgroundColor: '#F3E8FF',
},
typeButtonSelected: {
  backgroundColor: '#7C3AED',
  borderColor: '#7C3AED',
},
typeButtonText: {
  marginLeft: 8,
  fontSize: 14,
  color: '#543087',
  fontWeight: '600',
},
timeSelector: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 12,
  borderWidth: 1,
  borderColor: '#DDD6FE',
  borderRadius: 8,
  marginBottom: 20,
},
timeSelectorText: {
  marginLeft: 8,
  fontSize: 16,
  color: '#543087',
  fontWeight: '500',
},
sheetSaveButtonText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 16,
},

});
