import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseJsonSafely } from './safeJson';

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://muditam-app-backend-ca1c8b03db09.herokuapp.com';

export const activityOptions = [
  { code: 'AC1', label: 'Sedentary', emoji: '🪑' },
  { code: 'AC2', label: 'Lightly active', emoji: '🚶' },
  { code: 'AC3', label: 'Moderately active', emoji: '🏃' },
  { code: 'AC4', label: 'Very active', emoji: '🏋️' },
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

export const healthConditionOptions = [
  { value: 'hypertension', label: 'High blood pressure' },
  { value: 'thyroid', label: 'Hypothyroidism' },
  { value: 'inflammation', label: 'Inflammation' },
  { value: 'proteinDeficiency', label: 'Protein Deficiency' },
  { value: 'vitaminB12Deficiency', label: 'Vitamin B12 Deficiency' },
  { value: 'pcos', label: 'PCOS' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'sleepDisorder', label: 'Sleep disorder' },
  { value: 'prediabetes', label: 'Prediabetes' },
  { value: 'anemia', label: 'Anemia' },
  { value: 'fattyLiver', label: 'Fatty Liver' },
  { value: 'calciumDeficiency', label: 'Calcium Deficiency' },
  { value: 'vitaminDDeficiency', label: 'Vitamin D Deficiency' },
  { value: 'uricAcid', label: 'Uric Acid Problem' },
  { value: 'cholesterol', label: 'High Cholestrol/ Heart' },
  { value: 'ibs', label: 'Digestion / Acidity / Constipation' },
  { value: 'ironDeficiency', label: 'Iron Deficiency' },
];

export const allergyOptions = [
  { code: 'G', label: 'Gluten Allergy' },
  { code: 'E', label: 'Eggs Allergy' },
  { code: 'ML', label: 'Milk/Lactose Allergy' },
  { code: 'SF', label: 'Sea Food Allergy' },
  { code: 'N', label: 'Nut allergy' },
  { code: 'F', label: 'Fish Allergy' },
  { code: 'SO', label: 'Soya Allergy' },
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

export function hasDuplicateCoreMealFoods(plan) {
  const firstDay = plan?.planDays?.[0];
  if (!firstDay?.slots?.length) return false;

  const coreSlots = [2, 4, 7]
    .map((slotIndex) => firstDay.slots.find((slot) => slot.slotIndex === slotIndex && slot.isActive))
    .filter(Boolean);

  const seen = new Set();
  for (const slot of coreSlots) {
    for (const food of slot.foods || []) {
      const key = `${food.source}::${food.foodId}`;
      if (seen.has(key)) return true;
      seen.add(key);
    }
  }

  return false;
}

export function hasInsufficientSuggestedCalories(plan) {
  const firstDay = plan?.planDays?.[0];
  const target = Number(plan?.calorieTarget || 0);
  if (!firstDay?.slots?.length || !target) return false;

  const suggestedCalories = firstDay.slots.reduce((sum, slot) => {
    if (!slot?.isActive) return sum;
    return sum + Number(slot.totalCalories || 0);
  }, 0);

  return suggestedCalories > 0 && suggestedCalories < target * 0.75;
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

export async function logSlotFoods(planId, payload) {
  return request(`/api/smart-diet-plan/${planId}/log-slot`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function updateFoodInPlan(planId, payload) {
  return request(`/api/smart-diet-plan/${planId}/update-food`, {
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
  const normalizedHealthConditions = (profile?.healthConditions || []).map((value) => {
    if (value === 'heartDisease') return 'cholesterol';
    if (value === 'liverDisease') return 'fattyLiver';
    if (value === 'osteoporosis') return 'calciumDeficiency';
    if (value === 'uricAcidProblem') return 'uricAcid';
    return value;
  });
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
    healthConditions: normalizedHealthConditions,
    allergies: profile?.allergies || [],
    mealsPerDay: profile?.mealsPerDay ? String(profile.mealsPerDay) : '3',
  };
}

export function formatGoalLabel(value) {
  return String(value || '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function formatHealthConditionLabel(value) {
  if (value === 'heartDisease') value = 'cholesterol';
  if (value === 'liverDisease') value = 'fattyLiver';
  if (value === 'osteoporosis') value = 'calciumDeficiency';
  if (value === 'uricAcidProblem') value = 'uricAcid';
  return healthConditionOptions.find((item) => item.value === value)?.label || formatGoalLabel(value);
}

export function formatAllergyLabel(value) {
  return allergyOptions.find((item) => item.code === value)?.label || value || '-';
}

export function getDailyTotals(day) {
  return (day?.slots || []).reduce(
    (acc, slot) => {
      if (!slot.isActive) return acc;
      for (const food of slot.foods || []) {
        if (!food.isConsumed) continue;
        const quantity = Number(food.quantity || 1);
        acc.calories += Number(food.calories || 0) * quantity;
        acc.smartCalories += Number(food.smartCalories || 0) * quantity;
        acc.protein += Number(food.protein || 0) * quantity;
        acc.carbs += Number(food.carbs || 0) * quantity;
        acc.fat += Number(food.fat || 0) * quantity;
        acc.fiber += Number(food.fiber || 0) * quantity;
      }
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

function getMacroRatioProfile(goal = '') {
  const normalizedGoal = String(goal || '').trim();
  if (normalizedGoal === 'muscleGain') {
    return { carbs: 0.5, protein: 0.23, fat: 0.27 };
  }
  if (normalizedGoal === 'weightMaintenance') {
    return { carbs: 0.54, protein: 0.2, fat: 0.26 };
  }
  return { carbs: 0.565, protein: 0.185, fat: 0.25 };
}

export function calculateMacroPreview(calorieTarget = 0, goal = '') {
  const total = Number(calorieTarget || 0);
  const ratios = getMacroRatioProfile(goal);
  return {
    carbs: Math.round((total * ratios.carbs) / 4),
    protein: Math.round((total * ratios.protein) / 4),
    fat: Math.round((total * ratios.fat) / 9),
  };
}

export function calculateCalorieTargetPreview(profile = {}) {
  const age = Number(profile.age || 0);
  const weightKg = Number(profile.weightKg || 0);
  const heightCm = Number(profile.heightCm || 0);
  const multiplier =
    {
      AC1: 1.2,
      AC2: 1.375,
      AC3: 1.55,
      AC4: 1.7,
    }[profile.activityCode] || 1.375;

  const baseBmr =
    String(profile.gender || '').toLowerCase() === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  const tdee = baseBmr * multiplier;

  let calorieTarget = tdee;
  if (profile.goal === 'weightLoss') calorieTarget = tdee - 500;
  if (profile.goal === 'fatShredding') calorieTarget = tdee - 650;
  if (profile.goal === 'muscleGain') calorieTarget = tdee + 250;
  if (!['weightLoss', 'fatShredding', 'muscleGain', 'weightMaintenance'].includes(profile.goal)) calorieTarget = tdee - 250;

  return Math.max(1200, Math.round(calorieTarget));
}

export function calculateNutritionPreview(profile = {}) {
  const calorieTarget = calculateCalorieTargetPreview(profile);
  return {
    bmi: calculateBmi(profile.heightCm, profile.weightKg),
    calorieTarget,
    macros: calculateMacroPreview(calorieTarget, profile.goal),
  };
}
