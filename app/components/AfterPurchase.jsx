import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import SupportCard from '../components/SupportCard';
import NeedHelpSection from '../components/NeedHelpSection';
import KitProgressSection from '../components/KitProgressSection';
import { fetchKitProgress } from '../utils/fetchKitProgress';

export default function AfterPurchase() {
  const router = useRouter();
  const [name, setName] = useState('User');
  const [kitProgress, setKitProgress] = useState({ currentKit: 1, completedKits: [] });
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [gender, setGender] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    const loadName = async () => {
      const userData = await AsyncStorage.getItem('userDetails');
      const parsed = JSON.parse(userData || '{}');
      if (parsed?.name) setName(parsed.name);
      if (parsed?.gender) setGender(parsed.gender);
      if (parsed?.avatar) setAvatar(parsed.avatar);
    };
    loadName();
  }, []);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const result = await fetchKitProgress();
        setKitProgress(result);
      } catch (error) {
        console.error('Error loading kit progress:', error);
      } finally {
        setLoadingProgress(false);
      }
    };
    loadProgress();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#9C4DF4', '#7C4DFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.greetingBox1}
      >
        <View style={styles.header}>
          <Image
            source={{
              uri: 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/new_logo_orange_leaf_1_4e0e0f89-08a5-4264-9d2b-0cfe9535d553.png?v=1727508866',
            }}
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.profileIcon} onPress={() => router.push('/me')}>
            <Ionicons name="person-outline" size={20} color="white" />
            <Text style={styles.profileText}>You</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <LinearGradient
          colors={['#9C4DF4', '#7C4DFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.greetingBox}
        >
          <View style={styles.userRow}>
            <View style={styles.profileRow}>
             {avatar ? (
  <Image
    source={{ uri: avatar }}
    style={styles.profileImage}
    onError={() => {
      console.warn("Failed to load avatar:", avatar);
      setAvatar('');
    }}
  />
) : (
  <Image
    source={{
      uri: gender === 'Male'
        ? 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Male.png?v=1750153759'
        : 'https://cdn.shopify.com/s/files/1/0734/7155/7942/files/Female_8b0512eb-3582-4d53-9609-4924bd169c3a.png?v=1750153759',
    }}
    style={styles.profileImage}
  />
)}

              <View>
                <Text style={styles.userName}>Hi {name}</Text>
                <Text style={styles.userSubtitle}>Every day you’re a step closer to,{'\n'}healthier hair!</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>My Tasks</Text>  
          <TouchableOpacity style={styles.taskCard}> 
            <View style={styles.taskHighlight} />
            <Text style={styles.taskText}>Buy your next kit</Text>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.reorderWrapper}>
          <Text style={styles.reorderTitle}>Reorder Your Kit</Text>
          <View style={styles.reorderCard}>
            <Text style={styles.reorderHeading}>Want To See Results In{'\n'}Time?</Text>
            <Text style={styles.reorderSubtext}>Gaps can delay results.{'\n'}Order your kit now.</Text>
            <TouchableOpacity onPress={() => router.push('/products')} style={styles.orderBtn}>
              <Text style={styles.orderBtnText}>Order Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <SupportCard />
          <NeedHelpSection />
        </View>

        <View style={styles.line3} />
         <View style={{ marginHorizontal: 16 }}>
          <Text style={styles.sectionTitle}>Diet Plan</Text>
          <View style={styles.dietCard}>
            <Image style={{backgroundColor:"#000", borderRadius:8,height:123, width:141}}></Image>
            <View style={{display:"flex", flexDirection:"column"}}>
              <Text style={styles.dietText}>
              Drinking 8 glasses of water{"\n"}daily will improve your{"\n"}skin
              overnight
            </Text>
            <TouchableOpacity style={styles.planBtn} onPress={() => router.push('/my-plan')}>
              <Text style={styles.planBtnText}>View My Plan</Text>
            </TouchableOpacity>
            </View>
           
          </View>
        </View>
        <View style={styles.line4} />

        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Your Digital Prescription</Text>
          <View style={styles.prescriptionBox}>
            <Text style={styles.prescriptionText}>Your doctor recommended{'\n'}treatment plan</Text>
            <TouchableOpacity>
              <Text style={styles.prescriptionLink}>View Prescription</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.line4} />

        {loadingProgress ? (
          <ActivityIndicator size="large" color="#9C4DF4" style={{ marginTop: 16 }} />
        ) : (
          <KitProgressSection
            currentKit={kitProgress.currentKit}
            completedKits={kitProgress.completedKits}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  logo: {
    width: 120,
    height: 40,
  },
  profileIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileText: {
    color: 'white',
    marginLeft: 4,
    fontFamily: 'Poppins',
    fontSize: 14,
  },
  scrollContainer: {
    // Removed paddingBottom
  },
  greetingBox1: {
    padding: 1, 
  },
  greetingBox: {
    padding: 16, 
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 40,
  },
  profilePic: {
    width: 75,
    height: 75,
    borderRadius: 30,
    backgroundColor: 'white',
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Poppins',
  },
  userSubtitle: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  sectionBlock: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: -35,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Poppins',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: '#A3A3A3',
    borderWidth: 1, 
  },
  taskHighlight: {
    width: 90,
    height: '100%',
    backgroundColor: '#E0BBFF',
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    marginRight: 12,
  },
  taskText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    flex: 1,
    paddingVertical: 25,
  },
  reorderWrapper: {
    
    paddingHorizontal: 16,
    marginTop: 8,
  },
  reorderTitle: {
    fontSize: 19,
    fontWeight: '700',
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  reorderCard: {
    borderWidth: 0.5,
    borderColor: '#000000',
    borderRadius: 12,
    padding: 16,
  },
  reorderHeading: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins',
    marginBottom: 6,
  },
  reorderSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#333',
    marginBottom: 16,
  },
  orderBtn: {
    backgroundColor: '#E0BBFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 14,
    color: "#000",
  },
  dietCard: {
    borderWidth: 0.25,
    borderRadius: 8,
    padding: 16,
    paddingTop:20,
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between"
  },
  dietText: {
    fontSize: 14,
    color: "#000",
    lineHeight:18,
    marginBottom:10,
  },
  planBtn: {
    backgroundColor: "#9D57FF",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    width: 180,
  },
  planBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  prescriptionBox: {
    backgroundColor: '#F6F0FF',
    padding: 16,
    borderRadius: 12,
  },
  prescriptionText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#000',
    marginBottom: 8,
  },
  prescriptionLink: {
    color: '#543287',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  line3: {
    height: 7,
    backgroundColor: '#E9E9E9',
    marginVertical: 20,
    width: '100%',
  },
  line4: {
    height: 7,
    backgroundColor: '#E9E9E9',
    marginVertical: 20,
    marginTop: 35,
    width: '100%',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: '#fff',
  },
});
