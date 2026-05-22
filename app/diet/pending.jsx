import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchHealthProfile, fetchPlansByLead, getDietIdentity, getLatestActivePlan } from '../../utils/diet';
import DietProfileSummaryModal from '../components/diet/DietProfileSummaryModal';

export default function DietPendingState() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const load = async () => {
      const identity = await getDietIdentity();
      const nextProfile = await fetchHealthProfile(identity.leadId);
      const plans = await fetchPlansByLead(identity.leadId);
      const activePlan = getLatestActivePlan(plans);
      setProfile(nextProfile);
      setLoading(false);
      if (activePlan) router.replace({ pathname: '/diet/plan', params: { planId: activePlan._id } });
    };
    load();
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0f766e" />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Smart Diet Planner</Text>
          <Text style={styles.title}>Your diet plan is being prepared</Text>
          <Text style={styles.copy}>
            Our team is reviewing your profile and building your weekly plan. You can review or update your profile while you wait.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setShowProfile(true)}>
            <Text style={styles.primaryText}>Review profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push({ pathname: '/diet/onboarding', params: { mode: 'edit' } })}>
            <Text style={styles.secondaryText}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostButton} onPress={() => router.replace('/diet')}>
            <Text style={styles.ghostText}>Check again</Text>
          </TouchableOpacity>
        </View>
      )}
      <DietProfileSummaryModal
        visible={showProfile}
        profile={profile}
        onClose={() => setShowProfile(false)}
        onEdit={() => {
          setShowProfile(false);
          router.push({ pathname: '/diet/onboarding', params: { mode: 'edit' } });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f2', justifyContent: 'center', padding: 20 },
  center: { alignItems: 'center' },
  card: { backgroundColor: '#fff', padding: 22, borderRadius: 28, borderWidth: 1, borderColor: '#e2e8f0' },
  eyebrow: { color: '#0f766e', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 },
  title: { marginTop: 10, fontSize: 28, fontWeight: '900', color: '#10261d' },
  copy: { marginTop: 10, lineHeight: 22, color: '#475569' },
  primaryButton: { backgroundColor: '#153c31', marginTop: 20, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800' },
  secondaryButton: { backgroundColor: '#ecfeff', marginTop: 10, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  secondaryText: { color: '#155e75', fontWeight: '800' },
  ghostButton: { marginTop: 10, alignItems: 'center', paddingVertical: 12 },
  ghostText: { color: '#475569', fontWeight: '700' },
});
