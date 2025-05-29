import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function MyProfile() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [selectedTab, setSelectedTab] = useState('diabetes');

    useEffect(() => {
        const loadUser = async () => {
            try {
                const stored = await AsyncStorage.getItem('userDetails');
                if (stored) {
                    setUser(JSON.parse(stored));
                }
            } catch (e) {
                console.error("Failed to load user details", e);
            }
        };
        loadUser();
    }, []);

    const diagnoses = [
        'Male Pattern Hair Loss, Stage-2',
        'Male Pattern Hair Loss, Stage-2',
        'Male Pattern Hair Loss, Stage-2',
    ];

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/me')}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity onPress={() => router.push('/editprofile')}>
                    <Feather name="edit-2" size={20} color="black" />
                </TouchableOpacity>
            </View>

            {/* Avatar + User Info */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarPlaceholder} />
                <Text style={styles.name}>{user?.name || 'Guest'}</Text>
                <Text style={styles.ageGender}>
                    {user?.yearOfBirth ? `${new Date().getFullYear() - user.yearOfBirth}, ${user?.gender}` : ''}
                </Text>
            </View>

            {/* Info Boxes */}
            <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email ID</Text>
                    <Text style={styles.infoValue}>{user?.email || '-'}</Text>
                </View>
            </View>
            <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone No.</Text>
                    <Text style={styles.infoValue}>{user?.phone || '-'}</Text>
                </View>
            </View>
            <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Preferred Language</Text>
                    <Text style={styles.infoValue}>English</Text>
                </View>
            </View>


            {/* Tabs */}
            <View style={styles.tabsRow}>
                <TouchableOpacity
                    style={selectedTab === 'diabetes' ? styles.activeTab : styles.inactiveTab}
                    onPress={() => setSelectedTab('diabetes')}
                >
                    <Text style={selectedTab === 'diabetes' ? styles.activeTabText : styles.inactiveTabText}>
                        My Diabetes Profile
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={selectedTab === 'diet' ? styles.activeTab : styles.inactiveTab}
                    onPress={() => setSelectedTab('diet')}
                >
                    <Text style={selectedTab === 'diet' ? styles.activeTabText : styles.inactiveTabText}>
                        My Diet Profile
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {selectedTab === 'diabetes' ? (
                diagnoses.map((item, idx) => (
                    <View key={idx} style={styles.diagnosisBox}>
                        <View style={styles.diagnosisHeader}>
                            <Ionicons name="medical-outline" size={16} color="#A855F7" />
                            <Text style={styles.diagnosisLabel}>Current Diagnosis</Text>
                        </View>
                        <Text style={styles.diagnosisText}>{item}</Text>
                    </View>
                ))
            ) : (
                <View style={styles.dietProfileBox}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827' }}>
                        This is your diet profile.
                    </Text>
                </View>
            )}

            {/* Delete Account */}
            <TouchableOpacity style={styles.deleteAccount}>
                <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingTop: 24, 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16, 
        marginTop: 20,
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E5E7EB',
        marginBottom: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    ageGender: {
        fontSize: 14,
        color: '#555',
    },
    infoBox: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontSize: 12,
        color: '#555',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    tabsRow: {
        flexDirection: 'row',
        marginVertical: 16,
    },
    activeTab: {
        flex: 1,
        backgroundColor: '#111827',
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    activeTabText: {
        textAlign: 'center',
        color: 'white',
        fontWeight: '600',
        fontSize: 13,
    },
    inactiveTab: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    inactiveTabText: {
        textAlign: 'center',
        color: '#111827',
        fontWeight: '600',
        fontSize: 13,
    },
    diagnosisBox: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    diagnosisHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    diagnosisLabel: {
        marginLeft: 6,
        fontSize: 12,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        color: '#111827',
    },
    diagnosisText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    dietProfileBox: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    deleteAccount: {
        alignSelf: 'left',
        marginTop: 4,
    },
    deleteText: {
        color: '#DC2626',
        fontWeight: '600',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});
