import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { fetchHealthProfile, fetchPlansByLead, getDietIdentity, getLatestActivePlan } from '../../utils/diet';

export default function DietEntryResolver() {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, error: '' });

  const resolve = useCallback(async () => {
    try {
      setState({ loading: true, error: '' });
      const identity = await getDietIdentity();
      const profile = await fetchHealthProfile(identity.leadId);
      if (!profile) {
        router.replace('/diet/onboarding');
        return;
      }

      const plans = await fetchPlansByLead(identity.leadId);
      const activePlan = getLatestActivePlan(plans);
      if (!activePlan) {
        router.replace('/diet/pending');
        return;
      }

      router.replace({ pathname: '/diet/plan', params: { planId: activePlan._id } });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Failed to open Diet' });
    }
  }, [router]);

  useEffect(() => {
    resolve();
  }, [resolve]);

  useFocusEffect(
    useCallback(() => {
      resolve();
    }, [resolve])
  );

  return (
    <SafeAreaView style={styles.container}>
      {state.loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0f766e" />
          <Text style={styles.text}>Preparing your diet workspace...</Text>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.error}>{state.error}</Text>
          <TouchableOpacity style={styles.button} onPress={resolve}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { marginTop: 12, color: '#475569' },
  error: { color: '#b91c1c', textAlign: 'center', marginBottom: 12 },
  button: { backgroundColor: '#0f766e', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12 },
  buttonText: { color: '#fff', fontWeight: '800' },
});
