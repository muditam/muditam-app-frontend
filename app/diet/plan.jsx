import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DietFoodDetailModal from '../components/diet/DietFoodDetailModal';
import {
  addFoodToPlan,
  calculateMacroPreview,
  fetchFoodDetail,
  fetchHealthProfile,
  fetchPlanById,
  fetchPlansByLead,
  fetchSwapOptions,
  generateDietPlan,
  getDailyTotals,
  getDietIdentity,
  getLatestActivePlan,
  hasDuplicateCoreMealFoods,
  hasInsufficientSuggestedCalories,
  logSlotFoods,
  searchFoods,
  swapFood,
  toggleFoodLogged,
  updateFoodInPlan,
} from '../../utils/diet';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatDisplayName(value) {
  const clean = String(value || '').trim();
  if (!clean) return 'Smart Diet';
  return clean
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function formatDietBadge(foodType, fallbackDietType) {
  const code = String(foodType || fallbackDietType || '').trim();
  if (code === 'V') return 'Vegetarian';
  if (code === 'Ve') return 'Vegan';
  if (code === 'NV') return 'Non-Veg';
  if (code === 'E') return 'Veg + Egg';
  return 'Diet';
}

function formatFoodSubtitle(food) {
  const parts = [];
  if (food.portion) parts.push(`${food.portion}${food.portionUnit ? ` ${food.portionUnit}` : ''}`);
  parts.push(`${Math.round(food.calories || 0)} kcal`);
  parts.push(`P ${Math.round(food.protein || 0)}g`);
  parts.push(`C ${Math.round(food.carbs || 0)}g`);
  return parts.join(' · ');
}

function getFoodGlyph(food) {
  if (food.source === 'HomeBased') return '🍲';
  if (food.source === 'FoodRecipe') return '🥗';
  if (food.source === 'Restaurant') return '🍽️';
  if (food.source === 'Packaged') return '🥣';
  return '🥕';
}

function getFoodImageUri(food) {
  return String(food?.imageUrl || food?.imageId || '').trim();
}

function getSlotAccent(slotIndex) {
  const map = {
    0: '#e5f6ec',
    1: '#f8efe2',
    2: '#f7eafb',
    3: '#eef7fb',
    4: '#e9f6f2',
    5: '#f4eefc',
    6: '#f7eafb',
    7: '#eaf4fb',
    8: '#e7f5ee',
  };
  return map[slotIndex] || '#eef4f8';
}

function getSlotStatus(slot) {
  const foods = slot?.foods || [];
  if (!foods.length) return 'Log Slot';
  return foods.every((food) => food.isConsumed) ? 'Logged' : 'Log Slot';
}

function isCurrentPlanDay(dayIndex) {
  return Number(dayIndex) === 0;
}

function getFoodQualityLabel(food) {
  if (food.hasRecipe || Number(food.score || 0) >= 8) return 'Best Choice';
  if (Number(food.score || 0) >= 5) return 'Average Choice';
  return '';
}

function isNonVegetarianFood(food) {
  return String(food?.foodType || '').trim().toUpperCase() === 'NV';
}

function getSuggestedDayCalories(day) {
  return (day?.slots || []).reduce((sum, slot) => {
    if (!slot?.isActive) return sum;
    return sum + Number(slot.totalCalories || 0);
  }, 0);
}

function getWeekMeta(planDays = []) {
  const baseDate = new Date();
  return planDays.map((day, index) => {
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + index);
    const weekdayLabel = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      label: weekdayLabel,
      date: index + 1,
    };
  });
}

function FoodThumb({ food }) {
  const [failed, setFailed] = useState(false);
  const uri = getFoodImageUri(food);

  useEffect(() => {
    setFailed(false);
  }, [food?.foodId, uri]);

  if (uri && !failed) {
    return <Image source={{ uri }} style={styles.foodThumbImage} onError={() => setFailed(true)} resizeMode="cover" />;
  }

  return <Text style={styles.foodThumbFallback}>{getFoodGlyph(food)}</Text>;
}

function SummaryHero({ profile, dayTargetCalories, totals, targetMacros, compact, onBack }) {
  const calorieProgress = clamp((totals.calories / Math.max(1, dayTargetCalories || 1)) * 100, 0, 100);
  const hasConsumedFoods = totals.calories > 0;
  const macroRows = [
    { label: 'Carbs', current: totals.carbs, target: targetMacros.carbs },
    { label: 'Protein', current: totals.protein, target: targetMacros.protein },
    { label: 'Fat', current: totals.fat, target: targetMacros.fat },
  ];

  return (
    <View style={[styles.heroCard, compact && styles.heroCardCompact]}>
      <View style={styles.heroTopRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.heroEyebrowRow}>
            <TouchableOpacity style={styles.heroBackButton} onPress={onBack}>
              <Text style={styles.heroBackIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.heroEyebrow}>Smart Diet Plan</Text>
          </View>
          <Text style={styles.heroName}>{formatDisplayName(profile?.clientName?.split(' ')[0])}</Text>
          <Text style={styles.heroCopy}>Your daily nutrition snapshot.</Text>
        </View>
        <View style={styles.heroTargetPill}>
          <Text style={styles.heroTargetPillText}>{Math.round(dayTargetCalories || 0)} kcal target</Text>
        </View>
      </View>

      <View style={styles.summaryPanel}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Consumed today</Text>
            <Text style={styles.summaryValue}>{hasConsumedFoods ? `${Math.round(totals.calories)} kcal` : '--'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={styles.summaryValueMuted}>
              {hasConsumedFoods ? `${Math.max(0, Math.round((dayTargetCalories || 0) - totals.calories))} kcal` : '--'}
            </Text>
          </View>
        </View>

        <View style={styles.heroProgressTrack}>
          <View style={[styles.heroProgressFill, { width: `${calorieProgress}%` }]} />
        </View>

        <View style={styles.macroGroup}>
          {macroRows.map((item) => {
            const progress = clamp((item.current / Math.max(1, item.target || 1)) * 100, 0, 100);
            return (
              <View key={item.label} style={styles.macroCard}>
                <Text style={styles.macroLabel}>{item.label}</Text>
                <View style={styles.macroTrack}>
                  <View style={[styles.macroFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.macroValue}>
                  {Math.round(item.current)}/{Math.round(item.target)}g
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function DayStrip({ weekMeta, selectedDayIndex, onSelect, compact }) {
  return (
    <View style={[styles.dayStrip, compact && styles.dayStripCompact]}>
      {weekMeta.map((day, index) => {
        const active = index === selectedDayIndex;
        return (
          <TouchableOpacity key={`${day.label}-${day.date}`} style={[styles.dayPill, active && styles.dayPillActive]} onPress={() => onSelect(index)}>
            <Text style={[styles.dayPillLabel, active && styles.dayPillLabelActive]}>{day.label}</Text>
            <View style={[styles.dayPillCircle, active && styles.dayPillCircleActive]}>
              <Text style={[styles.dayPillDate, active && styles.dayPillDateActive]}>{day.date}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SearchResultsPanel({ visible, loading, results, onAdd }) {
  if (!visible) return null;

  return (
    <View style={styles.searchOverlayCard}>
      <View style={styles.searchOverlayHeader}>
        <Text style={styles.searchOverlayTitle}>Search Results</Text>
        <Text style={styles.searchOverlayCount}>{loading ? 'Searching…' : `${results.length} foods`}</Text>
      </View>

      {!loading && !results.length ? (
        <Text style={styles.searchOverlayEmpty}>No foods found in the uploaded food schemas.</Text>
      ) : null}

      {results.map((food) => (
        <View key={`${food.source}-${food.foodId}`} style={styles.searchResultRow}>
          <View style={styles.searchResultBody}>
            <Text style={styles.searchResultName}>{food.name}</Text>
            <Text style={styles.searchResultMeta}>{formatFoodSubtitle(food)}</Text>
          </View>
          <TouchableOpacity style={styles.searchResultAddButton} onPress={() => onAdd(food)}>
            <Text style={styles.searchResultAddText}>Add</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

function AlternativeCard({ food, onSelect }) {
  return (
    <TouchableOpacity style={styles.alternativeCard} onPress={() => onSelect(food)}>
      <View style={styles.alternativeImageShell}>
        <FoodThumb food={food} />
      </View>
      <View style={styles.alternativeBody}>
        <Text numberOfLines={2} style={styles.alternativeName}>{food.name}</Text>
        <Text style={styles.alternativeKcal}>{Math.round(food.calories || 0)} Kcal</Text>
        <View style={styles.alternativeFooter}>
          <View style={styles.alternativeKcalBarTrack}>
            <View
              style={[
                styles.alternativeKcalBarFill,
                { width: `${Math.min(100, Math.max(18, (Number(food.calories || 0) / 220) * 100))}%` },
              ]}
            />
          </View>
          <View style={styles.alternativeAddCircle}>
            <Text style={styles.alternativeAddPlus}>+</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FoodCard({ food, slot, dayIndex, profileDietType, loggingKey, onToggleLogged, onOpenSwap, onOpenDetail, compact, canLog }) {
  const actionKey = `${dayIndex}-${slot.slotIndex}-${food.source}-${food.foodId}`;
  const logging = loggingKey === actionKey;
  const qualityLabel = getFoodQualityLabel(food);
  const nonVeg = isNonVegetarianFood(food);

  return (
    <View style={[styles.foodCard, food.isConsumed && styles.foodCardLogged]}>
      <View style={styles.foodCardTop}>
        <View style={styles.foodThumbWrap}>
          <View style={styles.foodThumbShell}>
            <FoodThumb food={food} />
          </View>
          {qualityLabel ? (
            <View style={styles.qualityBadge}>
              <Text style={styles.qualityBadgeText}>{qualityLabel}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.foodBody}>
          <View style={styles.foodInfoTopRow}>
            <View style={[styles.foodVegMarker, nonVeg && styles.foodVegMarkerNonVeg]}>
              <View style={[styles.foodVegMarkerDot, nonVeg && styles.foodVegMarkerDotNonVeg]} />
            </View>
            <Text style={styles.foodName}>{food.name}</Text>
            <TouchableOpacity style={styles.foodArrowButton} onPress={() => onOpenDetail(food, slot, dayIndex, canLog)}>
              <Text style={styles.foodArrowText}>›</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.foodCopy}>
            {food.portion || 1}
            {food.portionUnit ? ` ${food.portionUnit}` : ''}
            {' / '}
            {Math.round(food.calories || 0)} Kcal, {Number(food.protein || 0).toFixed(2)} gms Protein
          </Text>
        </View>
      </View>

      <View style={[styles.cardActions, compact && styles.cardActionsCompact]}>
        <TouchableOpacity
          style={[styles.primaryAction, food.isConsumed && styles.primaryActionLogged, (logging || !canLog) && styles.actionDisabled]}
          disabled={logging || !canLog}
          onPress={() => onToggleLogged(slot.slotIndex, food)}
        >
          <Text style={styles.primaryActionText}>
            {logging ? 'Saving…' : !canLog ? 'Locked' : food.isConsumed ? 'Logged ✓' : 'Log +'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryAction} onPress={() => onOpenSwap(slot.slotIndex, food, dayIndex)}>
          <Text style={styles.secondaryActionText}>Options ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MealSection({
  slot,
  dayIndex,
  profileDietType,
  loggingKey,
  slotLoggingKey,
  onToggleLogged,
  onLogSlot,
  onOpenSwap,
  onOpenDetail,
  compact,
  canLog,
}) {
  const status = canLog ? getSlotStatus(slot) : 'Upcoming';
  const slotKey = `${dayIndex}-${slot.slotIndex}`;
  const slotLogging = slotLoggingKey === slotKey;
  const canLogSlot = canLog && (slot.foods || []).length > 0 && !slot.foods.every((food) => food.isConsumed);
  return (
    <View style={styles.mealSectionShell}>
      <View style={[styles.mealSectionHeader, { backgroundColor: getSlotAccent(slot.slotIndex) }]}>
        <Text style={styles.mealSectionHeaderTitle}>{slot.slotName}</Text>
        <TouchableOpacity
          style={[styles.mealStatusPill, (!canLogSlot || slotLogging) && styles.mealStatusPillDisabled]}
          disabled={!canLogSlot || slotLogging}
          onPress={() => onLogSlot(slot.slotIndex)}
        >
          <Text style={styles.mealStatusText}>{slotLogging ? 'Saving…' : status}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mealSectionBody}>
        {(slot.foods || []).map((food, index) => (
          <View key={`${food.source}-${food.foodId}`} style={[styles.mealFoodRowWrap, index > 0 && styles.mealFoodRowBorder]}>
            <FoodCard
              food={food}
              slot={slot}
              dayIndex={dayIndex}
              profileDietType={profileDietType}
              loggingKey={loggingKey}
              onToggleLogged={onToggleLogged}
              onOpenSwap={onOpenSwap}
              onOpenDetail={onOpenDetail}
              compact={compact}
              canLog={canLog}
            />
          </View>
        ))}
        {!slot.foods?.length ? (
          <View style={styles.emptySlotState}>
            <Text style={styles.emptyText}>No foods available for this slot yet.</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function SmartDietPlanView() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [foodModal, setFoodModal] = useState({ visible: false, food: null, detail: null });
  const [foodModalSaving, setFoodModalSaving] = useState(false);
  const [swapState, setSwapState] = useState({ loading: false, options: [], context: null });
  const [swapSearch, setSwapSearch] = useState('');
  const [addFoodState, setAddFoodState] = useState({ visible: false, food: null, loadingSlotKey: null });
  const [loggingKey, setLoggingKey] = useState('');
  const [slotLoggingKey, setSlotLoggingKey] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const identity = await getDietIdentity();
        const nextProfile = await fetchHealthProfile(identity.leadId);
        setProfile(nextProfile);
        let nextPlan = params.planId
          ? await fetchPlanById(params.planId)
          : getLatestActivePlan(await fetchPlansByLead(identity.leadId));

        if (nextPlan && (hasDuplicateCoreMealFoods(nextPlan) || hasInsufficientSuggestedCalories(nextPlan))) {
          nextPlan = await generateDietPlan({
            leadId: identity.leadId,
            generatedBy: 'app-user',
            createdBy: 'app-user',
            archivePrevious: true,
          });
        }

        if (!nextPlan) {
          router.replace('/diet/pending');
          return;
        }

        setPlan(nextPlan);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.planId, router]);

  const selectedDay = useMemo(() => plan?.planDays?.[selectedDayIndex] || null, [plan, selectedDayIndex]);
  const canLogSelectedDay = useMemo(() => isCurrentPlanDay(selectedDay?.dayIndex), [selectedDay?.dayIndex]);
  const totals = useMemo(() => getDailyTotals(selectedDay), [selectedDay]);
  const dayTargetCalories = useMemo(() => getSuggestedDayCalories(selectedDay), [selectedDay]);
  const weekMeta = useMemo(() => getWeekMeta(plan?.planDays || []), [plan?.planDays]);
  const targetMacros = useMemo(
    () => calculateMacroPreview(plan?.calorieTarget || 0, plan?.healthProfileSnapshot?.goal),
    [plan?.calorieTarget, plan?.healthProfileSnapshot?.goal]
  );

  const filteredSlots = useMemo(
    () => (selectedDay?.slots || []).filter((slot) => slot.isActive).map((slot) => ({ ...slot })),
    [selectedDay]
  );
  const filteredSwapOptions = useMemo(() => {
    const query = swapSearch.trim().toLowerCase();
    if (!query) return swapState.options || [];
    return (swapState.options || []).filter((item) => String(item.name || '').toLowerCase().includes(query));
  }, [swapSearch, swapState.options]);

  const hasSearchMode = Boolean(searchQuery.trim());
  const isCompact = width < 390;
  const isVerySmall = width < 350;
  const shellWidth = Math.min(width - (isCompact ? 16 : 28), 720);
  const horizontalPad = isCompact ? 8 : 12;
  const scrollBottomPad = Math.max(28, insets.bottom + 18);

  const openFoodDetail = async (food, slot, dayIndex, canLog) => {
    setFoodModal({ visible: true, food, detail: null, slotIndex: slot?.slotIndex, dayIndex, canLog });
    try {
      const detail = await fetchFoodDetail(food.foodId, food.source);
      setFoodModal((current) => ({ ...current, food, detail, slotIndex: slot?.slotIndex, dayIndex, canLog }));
    } catch {
      setFoodModal((current) => ({ ...current }));
    }
  };

  const handleDetailFoodUpdate = async ({ quantity, isConsumed }) => {
    if (!plan?._id || !foodModal?.food || foodModal?.slotIndex == null || foodModal?.dayIndex == null) return;
    try {
      setFoodModalSaving(true);
      const updated = await updateFoodInPlan(plan._id, {
        dayIndex: foodModal.dayIndex,
        slotIndex: foodModal.slotIndex,
        foodId: foodModal.food.foodId,
        source: foodModal.food.source,
        quantity,
        isConsumed,
      });
      setPlan(updated);
      const updatedDay = updated?.planDays?.find((day) => day.dayIndex === foodModal.dayIndex);
      const updatedSlot = updatedDay?.slots?.find((slot) => slot.slotIndex === foodModal.slotIndex);
      const updatedFood = updatedSlot?.foods?.find(
        (item) => String(item.foodId) === String(foodModal.food.foodId) && String(item.source) === String(foodModal.food.source)
      );
      if (updatedFood) {
        setFoodModal((current) => ({ ...current, food: updatedFood }));
      }
    } finally {
      setFoodModalSaving(false);
    }
  };

  const openSwap = async (slotIndex, food, dayIndex) => {
    setSwapState({ loading: true, options: [], context: { slotIndex, food, dayIndex } });
    setSwapSearch('');
    try {
      const response = await fetchSwapOptions(slotIndex, food.foodId, food.source);
      setSwapState({ loading: false, options: response.items || [], context: { slotIndex, food, dayIndex } });
    } catch {
      setSwapState({ loading: false, options: [], context: { slotIndex, food, dayIndex } });
    }
  };

  const handleSwap = async (nextFood) => {
    const context = swapState.context;
    if (!context || !plan?._id) return;

    const updated = await swapFood(plan._id, {
      dayIndex: context.dayIndex,
      slotIndex: context.slotIndex,
      removeFoodId: context.food.foodId,
      removeSource: context.food.source,
      nextFood: {
        ...nextFood,
        isConsumed: false,
        consumedAt: null,
      },
    });

    setPlan(updated);
    setSwapState({ loading: false, options: [], context: null });
  };

  useEffect(() => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      if (!profile) return;
      try {
        setSearchLoading(true);
        const response = await searchFoods({
          q: cleanQuery,
          dietType: profile.dietType,
          communityCodes: profile.communityCodes || [],
          healthConditions: profile.healthConditions || [],
          allergies: profile.allergies || [],
        });
        setSearchResults(response.items || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [profile, searchQuery]);

  const handleAddFoodToSlot = async (slotIndex) => {
    if (!plan?._id || !selectedDay || !addFoodState.food) return;
    const slotKey = `${selectedDay.dayIndex}-${slotIndex}`;

    try {
      setAddFoodState((current) => ({ ...current, loadingSlotKey: slotKey }));
      const updated = await addFoodToPlan(plan._id, {
        dayIndex: selectedDay.dayIndex,
        slotIndex,
        food: {
          ...addFoodState.food,
          isConsumed: false,
          consumedAt: null,
        },
      });
      setPlan(updated);
      setAddFoodState({ visible: false, food: null, loadingSlotKey: null });
      setSearchQuery('');
      setSearchResults([]);
    } catch {
      setAddFoodState((current) => ({ ...current, loadingSlotKey: null }));
    }
  };

  const handleToggleLogged = async (slotIndex, food) => {
    if (!plan?._id || !selectedDay) return;
    const key = `${selectedDay.dayIndex}-${slotIndex}-${food.source}-${food.foodId}`;
    try {
      setLoggingKey(key);
      const updated = await toggleFoodLogged(plan._id, {
        dayIndex: selectedDay.dayIndex,
        slotIndex,
        foodId: food.foodId,
        source: food.source,
        isConsumed: !food.isConsumed,
      });
      setPlan(updated);
    } finally {
      setLoggingKey('');
    }
  };

  const handleLogSlot = async (slotIndex) => {
    if (!plan?._id || !selectedDay) return;
    const slot = selectedDay.slots?.find((item) => item.slotIndex === Number(slotIndex));
    if (!slot?.foods?.length || slot.foods.every((food) => food.isConsumed)) return;
    const key = `${selectedDay.dayIndex}-${slotIndex}`;

    try {
      setSlotLoggingKey(key);
      const updated = await logSlotFoods(plan._id, {
        dayIndex: selectedDay.dayIndex,
        slotIndex,
        isConsumed: true,
      });
      setPlan(updated);
    } finally {
      setSlotLoggingKey('');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#6f6ee8" />
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No plan available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(10, insets.top > 0 ? 4 : 14),
            paddingBottom: scrollBottomPad,
            paddingHorizontal: horizontalPad,
          },
        ]}
      >
        <View style={[styles.shell, { width: shellWidth }]}>
          <SummaryHero
            profile={profile}
            dayTargetCalories={dayTargetCalories || plan?.calorieTarget || 0}
            totals={totals}
            targetMacros={targetMacros}
            compact={isCompact}
            onBack={() => router.back()}
          />

          <DayStrip weekMeta={weekMeta} selectedDayIndex={selectedDayIndex} onSelect={setSelectedDayIndex} compact={isCompact} />

          <View style={styles.mealZone}>
            <Text style={styles.mealZoneTitle}>Diet for Today</Text>

            <View style={styles.searchCard}>
              <View style={styles.searchInputWrap}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search foods to add"
                  placeholderTextColor="#98a2b3"
                  style={styles.searchInput}
                />
              </View>
            </View>

            <SearchResultsPanel
              visible={hasSearchMode}
              loading={searchLoading}
              results={searchResults}
              onAdd={(food) => setAddFoodState({ visible: true, food, loadingSlotKey: null })}
            />

            <View style={[styles.timelineWrap, hasSearchMode && styles.timelineWrapDimmed]}>
              {filteredSlots.map((slot) => (
                <MealSection
                  key={`${selectedDay.dayIndex}-${slot.slotIndex}`}
                  slot={slot}
                  dayIndex={selectedDay.dayIndex}
                  profileDietType={profile?.dietType}
                  loggingKey={loggingKey}
                  slotLoggingKey={slotLoggingKey}
                  onToggleLogged={handleToggleLogged}
                  onLogSlot={handleLogSlot}
                  onOpenSwap={openSwap}
                  onOpenDetail={openFoodDetail}
                  compact={isVerySmall}
                  canLog={canLogSelectedDay}
                />
              ))}

              {!filteredSlots.length ? <Text style={styles.emptyText}>No meals are scheduled for this day yet.</Text> : null}
            </View>
          </View>

        </View>
      </ScrollView>

      <DietFoodDetailModal
        visible={foodModal.visible}
        food={foodModal.food}
        rawDetail={foodModal.detail}
        foodGlyph={foodModal.food ? getFoodGlyph(foodModal.food) : '🥕'}
        canLog={Boolean(foodModal.canLog)}
        saving={foodModalSaving}
        onApply={handleDetailFoodUpdate}
        onClose={() => setFoodModal({ visible: false, food: null, detail: null, slotIndex: null, dayIndex: null, canLog: false })}
      />

      <Modal visible={addFoodState.visible} animationType="slide" transparent onRequestClose={() => setAddFoodState({ visible: false, food: null, loadingSlotKey: null })}>
        <View style={styles.modalOverlay}>
          <View style={[styles.addSheet, { paddingBottom: Math.max(24, insets.bottom + 16) }]}>
            <View style={styles.addSheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.addSheetTitle}>Add Food To Meal</Text>
                <Text style={styles.addSheetCopy}>
                  Choose where to add <Text style={styles.addSheetName}>{addFoodState.food?.name}</Text>
                </Text>
              </View>
              <TouchableOpacity style={styles.addSheetClose} onPress={() => setAddFoodState({ visible: false, food: null, loadingSlotKey: null })}>
                <Text style={styles.addSheetCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.addSheetList}>
              {filteredSlots.map((slot) => {
                const slotKey = `${selectedDay?.dayIndex}-${slot.slotIndex}`;
                const loadingSlot = addFoodState.loadingSlotKey === slotKey;
                return (
                  <View key={slotKey} style={styles.addSheetRow}>
                    <View>
                      <Text style={styles.addSheetRowTitle}>{slot.slotName}</Text>
                      <Text style={styles.addSheetRowTime}>{slot.mealTime}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.searchResultAddButton, loadingSlot && styles.actionDisabled]}
                      disabled={loadingSlot}
                      onPress={() => handleAddFoodToSlot(slot.slotIndex)}
                    >
                      <Text style={styles.searchResultAddText}>{loadingSlot ? 'Adding…' : 'Add'}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(swapState.context)}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setSwapSearch('');
          setSwapState({ loading: false, options: [], context: null });
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.alternativeSheet, { paddingBottom: Math.max(24, insets.bottom + 16) }]}>
            <View style={styles.alternativeHeaderRow}>
              <TouchableOpacity
                style={styles.alternativeBackButton}
                onPress={() => {
                  setSwapSearch('');
                  setSwapState({ loading: false, options: [], context: null });
                }}
              >
                <Text style={styles.alternativeBackIcon}>←</Text>
              </TouchableOpacity>
              <Text numberOfLines={1} style={styles.alternativeHeaderTitle}>
                Alternatives for "{swapState.context?.food?.name || ''}"
              </Text>
              <TouchableOpacity
                style={styles.alternativeCloseButton}
                onPress={() => {
                  setSwapSearch('');
                  setSwapState({ loading: false, options: [], context: null });
                }}
              >
                <Text style={styles.alternativeCloseIcon}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.alternativeSearchWrap}>
              <Text style={styles.alternativeSearchIcon}>⌕</Text>
              <TextInput
                value={swapSearch}
                onChangeText={setSwapSearch}
                placeholder="Search in Alternatives"
                placeholderTextColor="#a0a0a0"
                style={styles.alternativeSearchInput}
              />
            </View>

            {!swapState.loading ? (
              <Text style={styles.alternativeCountText}>{filteredSwapOptions.length} Alternatives available</Text>
            ) : null}

            {swapState.loading ? <ActivityIndicator color="#f15b7b" style={{ marginTop: 16 }} /> : null}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.alternativeGrid}
              style={styles.swapSheetScroll}
            >
              <View style={styles.alternativeGridRow}>
                {filteredSwapOptions.map((item) => (
                  <AlternativeCard key={`${item.source}-${item.foodId}`} food={item} onSelect={handleSwap} />
                ))}
              </View>

              {!swapState.loading && !filteredSwapOptions.length ? (
                <Text style={styles.emptyText}>No swap options available for this food right now.</Text>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f8fc' },
  content: { alignItems: 'center' },
  shell: { alignSelf: 'center' },

  heroCard: {
    backgroundColor: '#f1efff',
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0dcff',
  },
  heroCardCompact: {
    padding: 14,
    borderRadius: 22,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  heroEyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroBackButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0dcff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBackIcon: { color: '#475467', fontSize: 18, fontWeight: '900', lineHeight: 18 },
  heroEyebrow: { color: '#7c7ea1', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },
  heroName: { color: '#1d2939', fontSize: 24, fontWeight: '900', marginTop: 6 },
  heroCopy: { color: '#667085', fontSize: 14, marginTop: 4 },
  heroTargetPill: { backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  heroTargetPillText: { color: '#4b5565', fontSize: 12, fontWeight: '800' },
  summaryPanel: { marginTop: 14, backgroundColor: '#fff', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#ebeef5' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: '#8a93a3', fontSize: 12, fontWeight: '700' },
  summaryValue: { color: '#1d2939', fontSize: 20, fontWeight: '900', marginTop: 3 },
  summaryValueMuted: { color: '#475467', fontSize: 18, fontWeight: '800', marginTop: 3 },
  heroProgressTrack: { height: 8, borderRadius: 999, backgroundColor: '#eef1f7', overflow: 'hidden', marginTop: 14 },
  heroProgressFill: { height: 8, borderRadius: 999, backgroundColor: '#6f6ee8' },
  macroGroup: { flexDirection: 'row', gap: 10, marginTop: 14 },
  macroCard: { flex: 1 },
  macroLabel: { color: '#8a93a3', fontSize: 12, fontWeight: '700' },
  macroTrack: { height: 6, borderRadius: 999, backgroundColor: '#eef1f7', overflow: 'hidden', marginTop: 8 },
  macroFill: { height: 6, borderRadius: 999, backgroundColor: '#b8c0d4' },
  macroValue: { color: '#475467', fontSize: 12, fontWeight: '700', marginTop: 8 },

  dayStrip: { paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  dayStripCompact: {},
  dayPill: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 2,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dayPillActive: { backgroundColor: '#eef1ff' },
  dayPillLabel: { color: '#8a93a3', fontSize: 13, fontWeight: '700', marginBottom: 7 },
  dayPillLabelActive: { color: '#4f46e5' },
  dayPillCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#edeff4', alignItems: 'center', justifyContent: 'center' },
  dayPillCircleActive: { backgroundColor: '#6f6ee8' },
  dayPillDate: { color: '#667085', fontWeight: '900', fontSize: 13 },
  dayPillDateActive: { color: '#fff' },

  mealZone: { position: 'relative' },
  mealZoneTitle: { color: '#1d2939', fontSize: 24, fontWeight: '900', marginBottom: 14 },
  searchCard: { marginBottom: 14 },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e6e9f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: { color: '#98a2b3', fontSize: 20 },
  searchInput: { flex: 1, color: '#1d2939', fontSize: 15 },

  searchOverlayCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e6e9f0',
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchOverlayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  searchOverlayTitle: { color: '#1d2939', fontWeight: '900', fontSize: 16 },
  searchOverlayCount: { color: '#98a2b3', fontSize: 13 },
  searchOverlayEmpty: { color: '#8a93a3', paddingHorizontal: 16, paddingBottom: 16, fontSize: 14 },
  searchResultRow: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#edf0f5',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#fcfcfe',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchResultBody: { flex: 1, minWidth: 0 },
  searchResultName: { color: '#1d2939', fontSize: 15, fontWeight: '800' },
  searchResultMeta: { color: '#8a93a3', fontSize: 13, marginTop: 5 },
  searchResultAddButton: { backgroundColor: '#6f6ee8', borderRadius: 999, paddingHorizontal: 20, paddingVertical: 11, minWidth: 82, alignItems: 'center' },
  searchResultAddText: { color: '#fff', fontWeight: '900', fontSize: 14 },

  notesBanner: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#eceff5', paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14 },
  notesTitle: { color: '#1d2939', fontSize: 13, fontWeight: '900' },
  notesText: { color: '#667085', fontSize: 13, marginTop: 4, lineHeight: 18 },

  timelineWrap: { gap: 18 },
  timelineWrapDimmed: { opacity: 0.38 },
  mealSectionShell: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#e8e8ef', overflow: 'hidden', shadowColor: '#0f172a', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  mealSectionHeader: { paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealSectionHeaderTitle: { color: '#5b616a', fontSize: 15, fontWeight: '800' },
  mealStatusPill: { borderWidth: 1, borderColor: '#7c7cff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#f7f5ff' },
  mealStatusPillDisabled: { opacity: 0.6 },
  mealStatusText: { color: '#6b63ff', fontSize: 13, fontWeight: '700' },
  mealSectionBody: { backgroundColor: '#fff' },
  mealFoodRowWrap: { paddingHorizontal: 12, paddingVertical: 12 },
  mealFoodRowBorder: { borderTopWidth: 1, borderTopColor: '#efeff3' },
  emptySlotState: { padding: 14 },

  foodCard: { backgroundColor: '#fff' },
  foodCardLogged: {},
  foodCardTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  foodThumbWrap: { width: 62 },
  foodThumbShell: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f7f0eb', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  foodThumbImage: { width: '100%', height: '100%' },
  foodThumbFallback: { fontSize: 28 },
  qualityBadge: { marginTop: 4, backgroundColor: '#34a853', borderRadius: 4, paddingVertical: 3, paddingHorizontal: 4 },
  qualityBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700', textAlign: 'center' },
  foodBody: { flex: 1, minWidth: 0 },
  foodInfoTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  foodVegMarker: { width: 14, height: 14, borderWidth: 1.5, borderColor: '#1f9d55', alignItems: 'center', justifyContent: 'center' },
  foodVegMarkerDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#1f9d55' },
  foodVegMarkerNonVeg: { borderColor: '#e53935' },
  foodVegMarkerDotNonVeg: { backgroundColor: '#e53935' },
  foodName: { color: '#4f535b', fontSize: 16, fontWeight: '700', flex: 1 },
  foodArrowButton: { width: 26, alignItems: 'center', justifyContent: 'center' },
  foodArrowText: { color: '#ff5d7c', fontSize: 26, lineHeight: 24, fontWeight: '700' },
  foodCopy: { color: '#717680', fontSize: 13, lineHeight: 18, marginTop: 6 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12, marginLeft: 72, alignItems: 'center' },
  cardActionsCompact: { flexWrap: 'wrap' },
  primaryAction: { flex: 1, minWidth: 0, backgroundColor: '#ff4f73', borderRadius: 6, paddingVertical: 9, alignItems: 'center' },
  primaryActionLogged: { backgroundColor: '#16a34a' },
  primaryActionText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  secondaryAction: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: '#4f535b', backgroundColor: '#fff', borderRadius: 6, paddingVertical: 9, alignItems: 'center' },
  secondaryActionText: { color: '#4f535b', fontSize: 14, fontWeight: '500' },
  actionDisabled: { opacity: 0.65 },

  emptyText: { color: '#8a93a3', textAlign: 'center', marginTop: 14, fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.24)', justifyContent: 'flex-end' },
  addSheet: { backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 16 },
  alternativeSheet: { backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 16, paddingTop: 14, maxHeight: '68%' },
  alternativeHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alternativeBackButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  alternativeBackIcon: { color: '#f15b7b', fontSize: 24, fontWeight: '700' },
  alternativeHeaderTitle: { flex: 1, color: '#2a2b2f', fontSize: 16, fontWeight: '700' },
  alternativeCloseButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  alternativeCloseIcon: { color: '#2a2b2f', fontSize: 26, lineHeight: 26 },
  alternativeSearchWrap: { marginTop: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ff5d7c', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  alternativeSearchIcon: { color: '#8a8f98', fontSize: 20 },
  alternativeSearchInput: { flex: 1, color: '#20232a', fontSize: 15 },
  alternativeCountText: { marginTop: 14, color: '#2a2b2f', fontSize: 14, fontWeight: '600' },
  swapSheetScroll: { marginTop: 4 },
  alternativeGrid: { paddingTop: 14, paddingBottom: 6 },
  alternativeGridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  alternativeCard: { width: '48%', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e6e6e6', padding: 8, flexDirection: 'row', gap: 8, shadowColor: '#111827', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  alternativeImageShell: { width: 58, height: 58, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f6f0ea', alignItems: 'center', justifyContent: 'center' },
  alternativeBody: { flex: 1, minWidth: 0 },
  alternativeName: { color: '#5f636d', fontSize: 14, fontWeight: '600', lineHeight: 17 },
  alternativeKcal: { color: '#3b4049', fontSize: 13, marginTop: 12 },
  alternativeFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, gap: 8 },
  alternativeKcalBarTrack: { flex: 1, height: 4, borderRadius: 999, backgroundColor: '#ebecef', overflow: 'hidden' },
  alternativeKcalBarFill: { height: 4, borderRadius: 999, backgroundColor: '#e3c622' },
  alternativeAddCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#b8bcc4', alignItems: 'center', justifyContent: 'center' },
  alternativeAddPlus: { color: '#8f949d', fontSize: 16, fontWeight: '700', lineHeight: 16 },
  addSheetHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  addSheetTitle: { color: '#1d2939', fontSize: 24, fontWeight: '900' },
  addSheetCopy: { color: '#8a93a3', fontSize: 15, marginTop: 4, lineHeight: 21 },
  addSheetName: { color: '#1d2939', fontWeight: '800' },
  addSheetClose: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, borderColor: '#e6e9f0', alignItems: 'center', justifyContent: 'center' },
  addSheetCloseText: { color: '#98a2b3', fontSize: 20, lineHeight: 20 },
  addSheetList: { marginTop: 18, gap: 12 },
  addSheetRow: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eceff5', borderRadius: 18, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  addSheetRowTitle: { color: '#1d2939', fontSize: 16, fontWeight: '900' },
  addSheetRowTime: { color: '#8a93a3', fontSize: 13, marginTop: 4 },
});
