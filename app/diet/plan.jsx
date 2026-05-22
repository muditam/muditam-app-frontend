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
  fetchFoodDetail,
  fetchHealthProfile,
  fetchPlanById,
  fetchPlansByLead,
  fetchSwapOptions,
  getDailyTotals,
  getDietIdentity,
  getLatestActivePlan,
  searchFoods,
  swapFood,
  toggleFoodLogged,
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

function getWeekMeta(planDays = []) {
  const baseDate = new Date();
  return planDays.map((day, index) => {
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + index);
    return {
      label: day.dayLabel.slice(0, 3),
      date: nextDate.getDate(),
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

function SummaryHero({ profile, plan, totals, targetMacros, compact, onBack }) {
  const calorieProgress = clamp((totals.calories / Math.max(1, plan?.calorieTarget || 1)) * 100, 0, 100);
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
          <Text style={styles.heroTargetPillText}>{Math.round(plan?.calorieTarget || 0)} kcal target</Text>
        </View>
      </View>

      <View style={styles.summaryPanel}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Consumed today</Text>
            <Text style={styles.summaryValue}>{Math.round(totals.calories)} kcal</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={styles.summaryValueMuted}>{Math.max(0, Math.round((plan?.calorieTarget || 0) - totals.calories))} kcal</Text>
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.dayStrip, compact && styles.dayStripCompact]}>
      {weekMeta.map((day, index) => {
        const active = index === selectedDayIndex;
        const isToday = index === 0;
        return (
          <TouchableOpacity key={`${day.label}-${day.date}`} style={[styles.dayPill, active && styles.dayPillActive]} onPress={() => onSelect(index)}>
            <Text style={[styles.dayPillLabel, (active || isToday) && styles.dayPillLabelActive]}>{isToday ? 'Today' : day.label}</Text>
            <View style={[styles.dayPillCircle, active && styles.dayPillCircleActive]}>
              <Text style={[styles.dayPillDate, active && styles.dayPillDateActive]}>{day.date}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
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

function FoodCard({ food, slot, dayIndex, profileDietType, loggingKey, onToggleLogged, onOpenSwap, onOpenDetail, compact }) {
  const actionKey = `${dayIndex}-${slot.slotIndex}-${food.source}-${food.foodId}`;
  const logging = loggingKey === actionKey;

  return (
    <View style={[styles.foodCard, food.isConsumed && styles.foodCardLogged]}>
      <View style={styles.foodThumbWrap}>
        <View style={styles.foodThumbShell}>
          <FoodThumb food={food} />
        </View>
      </View>

      <View style={styles.foodBody}>
        <View style={[styles.foodTopMeta, compact && styles.foodTopMetaCompact]}>
          <View style={styles.foodBadgeWrap}>
            {food.score >= 70 || food.hasRecipe ? (
              <View style={styles.recommendBadge}>
                <Text style={styles.recommendBadgeText}>{food.hasRecipe ? 'Recipe' : 'Best choice'}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.dietPill}>
            <Text style={styles.dietPillText}>{formatDietBadge(food.foodType, profileDietType)}</Text>
          </View>
        </View>

        <Text style={styles.foodName}>{food.name}</Text>
        <Text style={styles.foodCopy}>{formatFoodSubtitle(food)}</Text>

        <View style={[styles.cardActions, compact && styles.cardActionsCompact]}>
          <TouchableOpacity
            style={[styles.primaryAction, food.isConsumed && styles.primaryActionLogged, logging && styles.actionDisabled]}
            disabled={logging}
            onPress={() => onToggleLogged(slot.slotIndex, food)}
          >
            <Text style={styles.primaryActionText}>{logging ? 'Saving…' : food.isConsumed ? 'Logged' : 'Log +'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction} onPress={() => onOpenSwap(slot.slotIndex, food, dayIndex)}>
            <Text style={styles.secondaryActionText}>Options ›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tertiaryAction} onPress={() => onOpenDetail(food)}>
            <Text style={styles.tertiaryActionText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function MealSection({ slot, dayIndex, profileDietType, loggingKey, onToggleLogged, onOpenSwap, onOpenDetail, compact }) {
  return (
    <View style={styles.mealSection}>
      <View style={styles.mealRail} />
      <View style={styles.mealHeader}>
        <View>
          <Text style={styles.mealTitle}>{slot.slotName}</Text>
          <Text style={styles.mealTime}>{slot.mealTime}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.mealCalories}>{Math.round(slot.totalCalories || 0)} kcal</Text>
          <Text style={styles.mealSmart}>SC {Math.round(slot.totalSmartCalories || 0)}</Text>
        </View>
      </View>

      <View style={styles.mealFoodStack}>
        {slot.foods.map((food) => (
          <FoodCard
            key={`${food.source}-${food.foodId}`}
            food={food}
            slot={slot}
            dayIndex={dayIndex}
            profileDietType={profileDietType}
            loggingKey={loggingKey}
            onToggleLogged={onToggleLogged}
            onOpenSwap={onOpenSwap}
            onOpenDetail={onOpenDetail}
            compact={compact}
          />
        ))}
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
  const [swapState, setSwapState] = useState({ loading: false, options: [], context: null });
  const [addFoodState, setAddFoodState] = useState({ visible: false, food: null, loadingSlotKey: null });
  const [loggingKey, setLoggingKey] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const identity = await getDietIdentity();
        const nextProfile = await fetchHealthProfile(identity.leadId);
        setProfile(nextProfile);
        const nextPlan = params.planId
          ? await fetchPlanById(params.planId)
          : getLatestActivePlan(await fetchPlansByLead(identity.leadId));

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
  const totals = useMemo(() => getDailyTotals(selectedDay), [selectedDay]);
  const weekMeta = useMemo(() => getWeekMeta(plan?.planDays || []), [plan?.planDays]);
  const targetMacros = useMemo(
    () => ({
      carbs: Math.round((Number(plan?.calorieTarget || 0) * 0.5) / 4),
      protein: Math.round((Number(plan?.calorieTarget || 0) * 0.25) / 4),
      fat: Math.round((Number(plan?.calorieTarget || 0) * 0.25) / 9),
    }),
    [plan?.calorieTarget]
  );

  const filteredSlots = useMemo(
    () => (selectedDay?.slots || []).filter((slot) => slot.isActive).map((slot) => ({ ...slot })),
    [selectedDay]
  );

  const hasSearchMode = Boolean(searchQuery.trim());
  const isCompact = width < 390;
  const isVerySmall = width < 350;
  const shellWidth = Math.min(width - (isCompact ? 16 : 28), 720);
  const horizontalPad = isCompact ? 8 : 12;
  const scrollBottomPad = Math.max(28, insets.bottom + 18);

  const openFoodDetail = async (food) => {
    setFoodModal({ visible: true, food, detail: null });
    try {
      const detail = await fetchFoodDetail(food.foodId, food.source);
      setFoodModal({ visible: true, food, detail });
    } catch {
      setFoodModal((current) => ({ ...current }));
    }
  };

  const openSwap = async (slotIndex, food, dayIndex) => {
    setSwapState({ loading: true, options: [], context: { slotIndex, food, dayIndex } });
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
          <SummaryHero profile={profile} plan={plan} totals={totals} targetMacros={targetMacros} compact={isCompact} onBack={() => router.back()} />

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

            {!!plan.validationWarnings?.length && !hasSearchMode ? (
              <View style={styles.notesBanner}>
                <Text style={styles.notesTitle}>Plan notes</Text>
                <Text style={styles.notesText}>{plan.validationWarnings[0]}</Text>
              </View>
            ) : null}

            <View style={[styles.timelineWrap, hasSearchMode && styles.timelineWrapDimmed]}>
              {filteredSlots.map((slot) => (
                <MealSection
                  key={`${selectedDay.dayIndex}-${slot.slotIndex}`}
                  slot={slot}
                  dayIndex={selectedDay.dayIndex}
                  profileDietType={profile?.dietType}
                  loggingKey={loggingKey}
                  onToggleLogged={handleToggleLogged}
                  onOpenSwap={openSwap}
                  onOpenDetail={openFoodDetail}
                  compact={isVerySmall}
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
        onClose={() => setFoodModal({ visible: false, food: null, detail: null })}
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

      <Modal visible={Boolean(swapState.context)} animationType="slide" transparent onRequestClose={() => setSwapState({ loading: false, options: [], context: null })}>
        <View style={styles.modalOverlay}>
          <View style={[styles.addSheet, styles.swapHalfSheet, { paddingBottom: Math.max(24, insets.bottom + 16) }]}>
            <View style={styles.addSheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.addSheetTitle}>Swap Food</Text>
                <Text style={styles.addSheetCopy}>
                  Choose an option for <Text style={styles.addSheetName}>{swapState.context?.food?.name}</Text>
                </Text>
              </View>
              <TouchableOpacity style={styles.addSheetClose} onPress={() => setSwapState({ loading: false, options: [], context: null })}>
                <Text style={styles.addSheetCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            {swapState.loading ? <ActivityIndicator color="#6f6ee8" style={{ marginTop: 16 }} /> : null}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.addSheetList}
              style={styles.swapSheetScroll}
            >
              {(swapState.options || []).map((item) => (
                <TouchableOpacity key={`${item.source}-${item.foodId}`} style={styles.swapSheetRow} onPress={() => handleSwap(item)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.swapOptionName}>{item.name}</Text>
                    <Text style={styles.swapOptionMeta}>{Math.round(item.calories || 0)} kcal · P {Math.round(item.protein || 0)}g · C {Math.round(item.carbs || 0)}g</Text>
                  </View>
                  <View style={styles.swapUsePill}>
                    <Text style={styles.swapUsePillText}>Use</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {!swapState.loading && !swapState.options.length ? (
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

  dayStrip: { paddingVertical: 16, gap: 12 },
  dayStripCompact: { gap: 10 },
  dayPill: {
    alignItems: 'center',
    minWidth: 58,
    paddingHorizontal: 8,
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

  timelineWrap: { gap: 16 },
  timelineWrapDimmed: { opacity: 0.38 },
  mealSection: { position: 'relative', paddingLeft: 16 },
  mealRail: { position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 999, backgroundColor: '#e4e8f1' },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  mealTitle: { color: '#1d2939', fontSize: 17, fontWeight: '900' },
  mealTime: { color: '#8a93a3', fontSize: 13, marginTop: 3 },
  mealCalories: { color: '#6f6ee8', fontSize: 15, fontWeight: '900' },
  mealSmart: { color: '#8a93a3', fontSize: 12, marginTop: 3 },
  mealFoodStack: { gap: 10 },

  foodCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#eceff5', padding: 12, flexDirection: 'row', gap: 12 },
  foodCardLogged: { borderColor: '#c9efd4', backgroundColor: '#fbfffc' },
  foodThumbWrap: { paddingTop: 2 },
  foodThumbShell: { width: 58, height: 58, borderRadius: 14, backgroundColor: '#f7f0eb', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  foodThumbImage: { width: '100%', height: '100%' },
  foodThumbFallback: { fontSize: 28 },
  foodBody: { flex: 1, minWidth: 0 },
  foodTopMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  foodTopMetaCompact: { flexWrap: 'wrap' },
  foodBadgeWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  recommendBadge: { backgroundColor: '#def7e6', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  recommendBadgeText: { color: '#1f9d55', fontSize: 11, fontWeight: '800' },
  dietPill: { backgroundColor: '#f3fff6', borderWidth: 1, borderColor: '#bfecc8', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  dietPillText: { color: '#1f9d55', fontSize: 11, fontWeight: '800' },
  foodName: { color: '#1d2939', fontSize: 16, fontWeight: '900', marginTop: 8 },
  foodCopy: { color: '#8a93a3', fontSize: 13, lineHeight: 19, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  cardActionsCompact: { flexWrap: 'wrap' },
  primaryAction: { flex: 1, minWidth: 0, backgroundColor: '#f15b7b', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  primaryActionLogged: { backgroundColor: '#16a34a' },
  primaryActionText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  secondaryAction: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: '#e6e9f0', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  secondaryActionText: { color: '#344054', fontSize: 14, fontWeight: '800' },
  tertiaryAction: { width: 40, minWidth: 40, borderWidth: 1, borderColor: '#eceff5', backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  tertiaryActionText: { color: '#f15b7b', fontSize: 21, fontWeight: '900' },
  actionDisabled: { opacity: 0.65 },

  emptyText: { color: '#8a93a3', textAlign: 'center', marginTop: 14, fontSize: 14 },

  swapOptionName: { color: '#1d2939', fontWeight: '800', fontSize: 14 },
  swapOptionMeta: { color: '#8a93a3', fontSize: 13, marginTop: 4 },
  swapSheetRow: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eceff5', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  swapUsePill: { backgroundColor: '#eef1ff', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  swapUsePillText: { color: '#4f46e5', fontWeight: '900', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.24)', justifyContent: 'flex-end' },
  addSheet: { backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 16 },
  swapHalfSheet: { maxHeight: '52%' },
  swapSheetScroll: { marginTop: 4 },
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
