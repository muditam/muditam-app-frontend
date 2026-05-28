import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseJsonSafely } from './safeJson';

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://muditam-app-backend-ca1c8b03db09.herokuapp.com';

export const activityOptions = [
  { code: 'AC1', label: 'Sedentary' },
  { code: 'AC2', label: 'Lightly active' },
  { code: 'AC3', label: 'Moderately active' },
  { code: 'AC4', label: 'Very active' },
];

export const dietTypeOptions = [
  { code: 'V', label: 'Vegetarian' },
  { code: 'Ve', label: 'Vegan' },
  { code: 'NV', label: 'Non vegetarian' },
  { code: 'E', label: 'Eggetarian' },
];

export const goalOptions = [
  'weightLoss',
  'weightMaintenance',
  'muscleGain',
  'fatShredding',
  'diabetes',
  'pcos',
  'cholesterol',
  'hypertension',
  'thyroid',
  'ibs',
  'kidneyStonesOxalate',
  'pregnancy',
  'lactation',
  'glp1',
  'anemia',
  'osteoporosis',
  'uricAcid',
  'heartDisease',
  'liverDisease',
  'immunityBooster',
  'skinHealth',
  'hairHealth',
];

export const allergyOptions = [
  { code: 'SF', label: 'Shellfish' },
  { code: 'SO', label: 'Soy' },
  { code: 'ML', label: 'Milk' },
  { code: 'F', label: 'Fish' },
  { code: 'E', label: 'Egg' },
  { code: 'N', label: 'Nuts' },
  { code: 'G', label: 'Gluten' },
];

export const communityOptions = ['U', 'P', 'S', 'M', 'G', 'B', 'T', 'R', 'K', 'A', 'H', 'O', 'C'];
export const communityLabels = {
  U: 'North India',
  P: 'Punjab',
  S: 'South India',
  M: 'Maharashtra',
  G: 'Gujarat',
  B: 'Bengali',
  T: 'Tamil Nadu',
  R: 'Rajasthan',
  K: 'Karnataka',
  A: 'Andhra Pradesh',
  H: 'Haryana',
  O: 'Odisha',
  C: 'Central India',
};

export async function getCurrentUser() {
  const raw = await AsyncStorage.getItem('userDetails');
  return parseJsonSafely(raw, null);
}

export async function getDietIdentity() {
  const user = await getCurrentUser();
  if (!user?._id) throw new Error('User is not available');
  return {
    user,
    leadId: String(user._id),
    clientName: user.name || '',
    clientPhone: user.phone || '',
  };
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  let response;

  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Network request failed for ${url}: ${reason}`);
  }

  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (_error) {
      const preview = text.slice(0, 160);
      throw new Error(
        `Invalid JSON from ${url} (${response.status} ${response.statusText}): ${preview}`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        payload?.error ||
        `Request failed for ${url} (${response.status} ${response.statusText})`
    );
  }
  return payload;
}

export async function fetchHealthProfile(leadId) {
  try {
    return await request(`/api/smart-diet-plan/health-profile/${leadId}`);
  } catch (error) {
    if (/not found/i.test(error.message)) return null;
    throw error;
  }
}

export async function fetchPlansByLead(leadId) {
  return request(`/api/smart-diet-plan/by-lead/${leadId}`);
}

export async function fetchPlanById(planId) {
  return request(`/api/smart-diet-plan/${planId}`);
}

export function getLatestActivePlan(plans = []) {
  return [...plans]
    .filter((plan) => plan.status === 'active')
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))[0] || null;
}

export async function saveHealthProfile(payload) {
  return request('/api/smart-diet-plan/health-profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function generateDietPlan(payload) {
  return request('/api/smart-diet-plan/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchFoodDetail(foodId, source) {
  const query = new URLSearchParams({ foodId, source }).toString();
  return request(`/api/smart-diet-plan/food-detail?${query}`);
}

export async function searchFoods(params = {}) {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.slotIndex != null) query.set('slotIndex', String(params.slotIndex));
  if (params.dietType) query.set('dietType', params.dietType);
  if (params.communityCodes?.length) query.set('communityCodes', params.communityCodes.join(','));
  if (params.healthConditions?.length) query.set('healthConditions', params.healthConditions.join(','));
  if (params.allergies?.length) query.set('allergies', params.allergies.join(','));
  return request(`/api/smart-diet-plan/food-search?${query.toString()}`);
}

export async function fetchSwapOptions(slotIndex, currentFoodId, currentSource) {
  const query = new URLSearchParams({ currentFoodId, currentSource }).toString();
  return request(`/api/smart-diet-plan/swap-options/${slotIndex}?${query}`);
}

export async function addFoodToPlan(planId, payload) {
  return request(`/api/smart-diet-plan/${planId}/add-food`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function toggleFoodLogged(planId, payload) {
  return request(`/api/smart-diet-plan/${planId}/log-food`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function swapFood(planId, payload) {
  return request(`/api/smart-diet-plan/${planId}/swap`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function validateDietProfile(form) {
  const requiredKeys = ['clientName', 'gender', 'heightCm', 'weightKg', 'targetWeightKg', 'activityCode', 'goal', 'dietType', 'mealsPerDay'];
  const missing = requiredKeys.filter((key) => !String(form[key] ?? '').trim());
  if (!form.dateOfBirth && !String(form.age || '').trim()) missing.push('dateOfBirth');
  if (!form.communityCodes?.length) missing.push('communityCodes');
  return missing;
}

export function createInitialDietForm(identity, profile) {
  return {
    leadId: identity.leadId,
    clientName: profile?.clientName || identity.clientName,
    clientPhone: profile?.clientPhone || identity.clientPhone,
    gender: profile?.gender || 'female',
    dateOfBirth: profile?.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : '',
    age: profile?.age ? String(profile.age) : '',
    heightCm: profile?.heightCm ? String(profile.heightCm) : '',
    weightKg: profile?.weightKg ? String(profile.weightKg) : '',
    targetWeightKg: profile?.targetWeightKg ? String(profile.targetWeightKg) : '',
    activityCode: profile?.activityCode || 'AC1',
    goal: profile?.goal || 'weightLoss',
    dietType: profile?.dietType || 'V',
    communityCodes: profile?.communityCodes || [],
    healthConditions: profile?.healthConditions || [],
    allergies: profile?.allergies || [],
    mealsPerDay: profile?.mealsPerDay ? String(profile.mealsPerDay) : '3',
  };
}

export function formatGoalLabel(value) {
  return String(value || '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function getDailyTotals(day) {
  return (day?.slots || []).reduce(
    (acc, slot) => {
      if (!slot.isActive) return acc;
      acc.calories += Number(slot.totalCalories || 0);
      acc.smartCalories += Number(slot.totalSmartCalories || 0);
      acc.protein += Number(slot.totalProtein || 0);
      acc.carbs += Number(slot.totalCarbs || 0);
      acc.fat += Number(slot.totalFat || 0);
      acc.fiber += Number(slot.totalFiber || 0);
      return acc;
    },
    { calories: 0, smartCalories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

export function calculateBmi(heightCm, weightKg) {
  const heightMeters = Number(heightCm || 0) / 100;
  const weight = Number(weightKg || 0);
  if (!heightMeters || !weight) return 0;
  return weight / (heightMeters * heightMeters);
}

export function calculateMacroPreview(calorieTarget = 0) {
  const total = Number(calorieTarget || 0);
  return {
    carbs: Math.round((total * 0.5) / 4),
    protein: Math.round((total * 0.25) / 4),
    fat: Math.round((total * 0.25) / 9),
  };
}
