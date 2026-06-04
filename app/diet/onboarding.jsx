import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  activityOptions,
  calculateNutritionPreview,
  communityLabels,
  communityOptions,
  createInitialDietForm,
  dietTypeOptions,
  fetchHealthProfile,
  generateDietPlan,
  healthConditionOptions,
  hasDuplicateCoreMealFoods,
  hasInsufficientSuggestedCalories,
  getDietIdentity,
  saveHealthProfile,
  allergyOptions,
} from '../../utils/diet';

const STEP_COUNT = 6;
const goalCards = [
  { key: 'weightLoss', title: 'Weight Loss', subtitle: 'Lose weight, feel lighter', accent: '#ffd8de', emoji: '🚴' },
  { key: 'muscleGain', title: 'Muscle Building', subtitle: 'Pump and get stronger', accent: '#ffe2cf', emoji: '🏋️' },
  { key: 'fatShredding', title: 'Lean Body', subtitle: 'Maintain muscles and lose fat', accent: '#eadfff', emoji: '🤸' },
  { key: 'diabetes', title: 'Manage Diabetes', subtitle: 'Optimize blood glucose levels', accent: '#ffe1db', emoji: '🩺' },
  { key: 'pcos', title: 'Manage PCOS', subtitle: 'Build a stable hormone-friendly routine', accent: '#efe3ff', emoji: '📱' },
];

const healthConditionCards = [
  'hypertension',
  'thyroid',
  'inflammation',
  'proteinDeficiency',
  'vitaminB12Deficiency',
  'pcos',
  'diabetes',
  'sleepDisorder',
  'prediabetes',
  'anemia',
];

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function cmToFeetInches(heightCm) {
  const cm = Number(heightCm || 0);
  if (!cm) return { feet: '', inches: '' };
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);

  if (inches === 12) {
    return { feet: String(feet + 1), inches: '0' };
  }

  return { feet: String(feet), inches: String(inches) };
}

function feetInchesToCm(feetValue, inchesValue) {
  const feet = Number(feetValue || 0);
  const inches = Number(inchesValue || 0);
  if (!feet && !inches) return '';
  const totalInches = feet * 12 + inches;
  if (!totalInches) return '';
  return String(Math.round(totalInches * 2.54));
}

function normalizeSubmitPayload(form, identity) {
  const heightCm =
    form.heightUnit === 'ft'
      ? feetInchesToCm(form.heightFeet, form.heightInches)
      : String(form.heightCm || '').trim();

  return {
    ...form,
    leadId: identity.leadId,
    clientName: form.clientName || identity.clientName,
    clientPhone: form.clientPhone || identity.clientPhone,
    age: Number(form.age),
    heightCm: Number(heightCm),
    weightKg: Number(form.weightKg),
    targetWeightKg: Number(form.targetWeightKg),
    mealsPerDay: Number(form.mealsPerDay),
  };
}

export default function DietOnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [form, setForm] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState([]);
  const [showMoreConditions, setShowMoreConditions] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const nextIdentity = await getDietIdentity();
        const profile = await fetchHealthProfile(nextIdentity.leadId);
        const nextForm = createInitialDietForm(nextIdentity, profile);
        const heightPreset = cmToFeetInches(nextForm.heightCm);
        setIdentity(nextIdentity);
        setForm({
          ...nextForm,
          age: nextForm.age || '',
          heightCm: nextForm.heightCm || '',
          heightUnit: 'cm',
          heightFeet: heightPreset.feet,
          heightInches: heightPreset.inches,
          weightKg: nextForm.weightKg || '',
          targetWeightKg: nextForm.targetWeightKg || '',
          mealsPerDay: nextForm.mealsPerDay || '3',
          activityCode: nextForm.activityCode || 'AC2',
          clientName: nextForm.clientName || nextIdentity.clientName,
          gender: nextForm.gender || 'female',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const preview = useMemo(() => {
    if (!form) return { bmi: 0, calorieTarget: 1200, macros: { carbs: 170, protein: 56, fat: 33 } };
    const heightCm = Number(
      form.heightUnit === 'ft'
        ? feetInchesToCm(form.heightFeet, form.heightInches)
        : form.heightCm || 0
    );
    return calculateNutritionPreview({
      age: Number(form.age || 0),
      weightKg: Number(form.weightKg || 0),
      heightCm,
      activityCode: form.activityCode,
      gender: form.gender,
      goal: form.goal,
    });
  }, [form]);

  const currentGoalCard = goalCards.find((item) => item.key === form?.goal) || goalCards[0];
  const visibleConditions = useMemo(() => {
    if (showMoreConditions) return healthConditionOptions;
    return healthConditionOptions.filter((item) => healthConditionCards.includes(item.value));
  }, [showMoreConditions]);
  const isCompact = width < 380;
  const isTablet = width >= 768;
  const horizontalPadding = isCompact ? 12 : 16;
  const shellWidth = Math.min(width - horizontalPadding * 2, 720);
  const preferenceCardWidth = isTablet ? '23.5%' : '48%';
  const regionCardWidth = isTablet ? '31.5%' : '48%';
  const checkItemWidth = isTablet ? '33.33%' : '50%';
  const emojiBubbleSize = isCompact ? 64 : isTablet ? 104 : 84;
  const progressPadding = isCompact ? 14 : 20;
  const progressLineInset = progressPadding + 14;
  const progressLineWidth = Math.max(width - progressLineInset * 2, 0);
  const footerPaddingBottom = Math.max(insets.bottom + 8, height < 720 ? 10 : 16);

  const toggleListValue = (key, value) => {
    setForm((current) => {
      const currentValues = current[key] || [];
      return {
        ...current,
        [key]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const validateCurrentStep = () => {
    if (!form) return ['Form not ready'];
    if (stepIndex === 0 && !form.goal) return ['Select a goal'];
    if (stepIndex === 1) {
      const nextErrors = [];
      if (!form.age) nextErrors.push('Age');
      if (form.heightUnit === 'ft') {
        if (!feetInchesToCm(form.heightFeet, form.heightInches)) nextErrors.push('Height');
      } else if (!form.heightCm) {
        nextErrors.push('Height');
      }
      if (!form.weightKg) nextErrors.push('Current weight');
      if (!form.targetWeightKg) nextErrors.push('Target weight');
      return nextErrors;
    }
    if (stepIndex === 2) {
      const nextErrors = [];
      if (!form.dietType) nextErrors.push('Diet type');
      if (!form.communityCodes?.length) nextErrors.push('Regional preference');
      if (!form.mealsPerDay) nextErrors.push('Meals per day');
      return nextErrors;
    }
    if (stepIndex === 4) {
      const nextErrors = [];
      if (!form.clientName?.trim()) nextErrors.push('Name');
      if (!form.gender) nextErrors.push('Gender');
      if (!form.activityCode) nextErrors.push('Activity');
      return nextErrors;
    }
    return [];
  };

  const handleContinue = async () => {
    const nextErrors = validateCurrentStep();
    if (nextErrors.length) {
      setErrors(nextErrors);
      return;
    }
    setErrors([]);
    if (stepIndex < STEP_COUNT - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    try {
      setSaving(true);
      const payload = normalizeSubmitPayload(form, identity);
      await saveHealthProfile(payload);
      const generatedPlan = await generateDietPlan({
        leadId: identity.leadId,
        generatedBy: 'app-user',
        createdBy: 'app-user',
        archivePrevious: true,
      });
      const finalPlan = hasDuplicateCoreMealFoods(generatedPlan) || hasInsufficientSuggestedCalories(generatedPlan)
        ? await generateDietPlan({
            leadId: identity.leadId,
            generatedBy: 'app-user',
            createdBy: 'app-user',
            archivePrevious: true,
          })
        : generatedPlan;

      if (finalPlan?._id) {
        router.replace({ pathname: '/diet/plan', params: { planId: finalPlan._id } });
        return;
      }

      router.replace('/diet/pending');
    } catch (error) {
      setErrors([error.message || 'Could not save your diet profile']);
    } finally {
      setSaving(false);
    }
  };

  const renderGoalStep = () => (
    <View>
      <Text style={styles.stepTitle}>{`What's your goal?`}</Text>
      <Text style={styles.stepSubtitle}>Select the primary reason you want a diet plan.</Text>
      <View style={styles.goalList}>
        {goalCards.map((item) => {
          const active = form.goal === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.goalCard, active && styles.goalCardActive]}
              onPress={() => setForm((current) => ({ ...current, goal: item.key }))}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.goalCardTitle}>{item.title}</Text>
                <Text style={styles.goalCardSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={[styles.goalEmojiBubble, { backgroundColor: item.accent, width: emojiBubbleSize, height: emojiBubbleSize, borderRadius: emojiBubbleSize / 2 }]}>
                <Text style={[styles.goalEmoji, { fontSize: emojiBubbleSize * 0.42 }]}>{item.emoji}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderVitalsStep = () => (
    <View>
      <Text style={styles.stepTitle}>Quick vitals</Text>
      <Text style={styles.stepSubtitle}>Needed for accurate calorie and macro calculation.</Text>
      <View style={styles.softPanel}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricQuestion}>Age</Text>
            <Text style={styles.metricUnit}>years</Text>
          </View>
          <TextInput
            keyboardType="number-pad"
            value={String(form.age || '')}
            onChangeText={(value) => setForm((current) => ({ ...current, age: value.replace(/[^0-9]/g, '') }))}
            style={styles.metricInput}
            placeholder="Enter age"
          />
          <View style={styles.rangeRow}>
            <Text style={styles.rangeText}>12 years</Text>
            <Text style={styles.rangeText}>90 years</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricQuestion}>How tall are you?</Text>
            <Text style={styles.metricUnit}>height</Text>
          </View>
          <View style={styles.heightUnitRow}>
            {[
              ['cm', 'Centimeters'],
              ['ft', 'Feet / Inches'],
            ].map(([value, label]) => {
              const active = form.heightUnit === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.heightUnitButton, active && styles.heightUnitButtonActive]}
                  onPress={() =>
                    setForm((current) => {
                      if (value === 'ft') {
                        const converted = cmToFeetInches(current.heightCm);
                        return {
                          ...current,
                          heightUnit: 'ft',
                          heightFeet: current.heightFeet || converted.feet,
                          heightInches: current.heightInches || converted.inches,
                        };
                      }

                      return {
                        ...current,
                        heightUnit: 'cm',
                        heightCm: current.heightCm || feetInchesToCm(current.heightFeet, current.heightInches),
                      };
                    })
                  }
                >
                  <Text style={[styles.heightUnitButtonText, active && styles.heightUnitButtonTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {form.heightUnit === 'ft' ? (
            <View style={styles.heightFeetRow}>
              <TextInput
                keyboardType="number-pad"
                value={String(form.heightFeet || '')}
                onChangeText={(value) =>
                  setForm((current) => ({ ...current, heightFeet: value.replace(/[^0-9]/g, '') }))
                }
                style={[styles.metricInput, styles.heightFeetInput]}
                placeholder="Feet"
              />
              <TextInput
                keyboardType="number-pad"
                value={String(form.heightInches || '')}
                onChangeText={(value) =>
                  setForm((current) => ({ ...current, heightInches: value.replace(/[^0-9]/g, '') }))
                }
                style={[styles.metricInput, styles.heightFeetInput]}
                placeholder="Inches"
              />
            </View>
          ) : (
            <TextInput
              keyboardType="decimal-pad"
              value={String(form.heightCm || '')}
              onChangeText={(value) => setForm((current) => ({ ...current, heightCm: value.replace(/[^0-9.]/g, '') }))}
              style={styles.metricInput}
              placeholder="Enter height in cm"
            />
          )}
          <View style={styles.rangeRow}>
            <Text style={styles.rangeText}>{form.heightUnit === 'ft' ? `4'0"` : '120 cm'}</Text>
            <Text style={styles.rangeText}>{form.heightUnit === 'ft' ? `7'3"` : '220 cm'}</Text>
          </View>
        </View>

        {[
          ['Current weight', 'weightKg', 'kg', 30, 180],
          ['Target weight', 'targetWeightKg', 'kg', 30, 180],
        ].map(([label, key, unit, min, max]) => (
          <View key={key} style={[styles.metricCard, key === 'weightKg' && styles.metricCardHighlight]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricQuestion}>{label}</Text>
              <Text style={styles.metricUnit}>{unit}</Text>
            </View>
            <TextInput
              keyboardType="decimal-pad"
              value={String(form[key])}
              onChangeText={(value) => setForm((current) => ({ ...current, [key]: value.replace(/[^0-9.]/g, '') }))}
              style={styles.metricInput}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
            <View style={styles.rangeRow}>
              <Text style={styles.rangeText}>{min} {unit}</Text>
              <Text style={styles.rangeText}>{max} {unit}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPreferenceStep = () => (
    <View>
      <Text style={styles.stepTitle}>Diet preference</Text>
      <Text style={styles.stepSubtitle}>What kind of foods do you eat?</Text>

      <View style={styles.preferenceGrid}>
        {dietTypeOptions.map((item, index) => {
          const emojis = ['🥦', '🥩', '🥚', '🌱'];
          const active = form.dietType === item.code;
          return (
            <TouchableOpacity key={item.code} style={[styles.preferenceCard, { width: preferenceCardWidth }, active && styles.preferenceCardActive]} onPress={() => setForm((current) => ({ ...current, dietType: item.code }))}>
              <Text style={styles.preferenceEmoji}>{emojis[index]}</Text>
              <Text style={styles.preferenceTitle}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionMiniTitle}>Regional preference</Text>
      <Text style={styles.stepSubtitle}>Choose your major regional preference</Text>
      <View style={styles.regionGrid}>
        {communityOptions.slice(0, 8).map((code) => {
          const active = form.communityCodes.includes(code);
          return (
            <TouchableOpacity key={code} style={[styles.regionCard, { width: regionCardWidth }, active && styles.regionCardActive]} onPress={() => toggleListValue('communityCodes', code)}>
              <Text style={[styles.regionCardText, active && styles.regionCardTextActive]}>{communityLabels[code]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionMiniTitle}>Meals per day</Text>
      <Text style={styles.stepSubtitle}>How many times do you eat in a day?</Text>
      <View style={styles.mealsCard}>
        <Text style={styles.mealsCount}>{form.mealsPerDay}</Text>
        <Text style={styles.mealsLabel}>meals/day</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity style={styles.counterButtonWide} onPress={() => setForm((current) => ({ ...current, mealsPerDay: String(clampNumber(Number(current.mealsPerDay || 3) - 1, 2, 8)) }))}>
            <Text style={styles.counterButtonText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.counterButtonWide} onPress={() => setForm((current) => ({ ...current, mealsPerDay: String(clampNumber(Number(current.mealsPerDay || 3) + 1, 2, 8)) }))}>
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHealthStep = () => (
    <View>
      <Text style={styles.stepTitle}>Health & allergies</Text>
      <Text style={styles.stepSubtitle}>Select all that apply.</Text>

      <View style={styles.checkPanel}>
        <View style={styles.checkPanelHeader}>
          <Text style={styles.checkPanelTitle}>Health condition</Text>
          <Text style={styles.checkPanelEmoji}>🩺</Text>
        </View>
        <View style={styles.checkGrid}>
          {visibleConditions.map((item) => {
            const active = form.healthConditions.includes(item.value);
            return (
              <TouchableOpacity key={item.value} style={[styles.checkItem, { width: checkItemWidth }]} onPress={() => toggleListValue('healthConditions', item.value)}>
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active ? <Text style={styles.checkboxTick}>✓</Text> : null}
                </View>
                <Text style={styles.checkText}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {!showMoreConditions ? (
          <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowMoreConditions(true)}>
            <Text style={styles.showMoreText}>Show More</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.checkPanel}>
        <View style={styles.checkPanelHeader}>
          <Text style={styles.checkPanelTitle}>Allergies</Text>
          <Text style={styles.checkPanelEmoji}>🤧</Text>
        </View>
        <View style={styles.checkGrid}>
          {allergyOptions.map((item) => {
            const active = form.allergies.includes(item.code);
            return (
              <TouchableOpacity key={item.code} style={[styles.checkItem, { width: checkItemWidth }]} onPress={() => toggleListValue('allergies', item.code)}>
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active ? <Text style={styles.checkboxTick}>✓</Text> : null}
                </View>
                <Text style={styles.checkText}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  const renderLifestyleStep = () => (
    <View>
      <Text style={styles.stepTitle}>Tell us a bit more</Text>
      <Text style={styles.stepSubtitle}>These help us personalize the target and plan structure.</Text>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Your name</Text>
        <TextInput value={form.clientName} onChangeText={(value) => setForm((current) => ({ ...current, clientName: value }))} style={styles.textField} placeholder="Enter your name" />
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Gender</Text>
        <View style={styles.segmentRow}>
          {[
            ['female', 'Female'],
            ['male', 'Male'],
            ['other', 'Other'],
          ].map(([value, label]) => (
            <TouchableOpacity key={value} style={[styles.segmentButton, form.gender === value && styles.segmentButtonActive]} onPress={() => setForm((current) => ({ ...current, gender: value }))}>
              <Text style={[styles.segmentButtonText, form.gender === value && styles.segmentButtonTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Activity level</Text>
        <View style={styles.activityList}>
          {activityOptions.map((item) => {
            const active = form.activityCode === item.code;
            return (
              <TouchableOpacity key={item.code} style={[styles.activityCard, active && styles.activityCardActive]} onPress={() => setForm((current) => ({ ...current, activityCode: item.code }))}>
                <Text style={styles.activityEmoji}>{item.emoji || '🏃'}</Text>
                <Text style={styles.activityText}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  const renderSummaryStep = () => (
    <View>
      <Text style={styles.summaryIntro}>From the information provided, that is our basic analysis.</Text>

      <View style={styles.summaryCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryBig}>{preview.bmi.toFixed(2)}</Text>
          <Text style={styles.summaryCardTitle}>Your BMI</Text>
          <Text style={styles.summaryNote}>Healthy BMI range: 18.5 - 24.9</Text>
        </View>
        <Text style={styles.summaryIcon}>📊</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryCardTitle}>Current Weight: {Number(form.weightKg).toFixed(1)} kg</Text>
          <Text style={styles.summaryCardTitle}>Desired Weight: {Number(form.targetWeightKg).toFixed(1)} kg</Text>
          <Text style={styles.summaryNote}>
            Target/Ideal weight recommended: {Math.max(40, Number(form.targetWeightKg) - 5)} - {Number(form.targetWeightKg) + 5} kg
          </Text>
        </View>
        <Text style={styles.summaryIcon}>⚖️</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.summaryCardTitle}>Nutritional Requirement</Text>
          <Text style={styles.summaryNote}>(On daily basis)</Text>
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionMetric}>
              <Text style={styles.nutritionEmoji}>🔥</Text>
              <Text style={styles.nutritionLabel}>Daily calorie target</Text>
              <Text style={styles.nutritionValue}>{preview.calorieTarget} kcal</Text>
            </View>
            <View style={styles.nutritionMetric}>
              <Text style={styles.nutritionEmoji}>🍚</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
              <Text style={styles.nutritionValue}>{preview.macros.carbs}g</Text>
            </View>
            <View style={styles.nutritionMetric}>
              <Text style={styles.nutritionEmoji}>💪</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
              <Text style={styles.nutritionValue}>{preview.macros.protein}g</Text>
            </View>
            <View style={styles.nutritionMetric}>
              <Text style={styles.nutritionEmoji}>🧀</Text>
              <Text style={styles.nutritionLabel}>Fats</Text>
              <Text style={styles.nutritionValue}>{preview.macros.fat}g</Text>
            </View>
          </View>
        </View>
        <Text style={styles.summaryIcon}>🥗</Text>
      </View>

      <Text style={styles.journeyText}>{`Let's get you started with our journey`}</Text>
      <View style={styles.summaryGoalTag}>
        <Text style={styles.summaryGoalText}>{currentGoalCard.title}</Text>
      </View>
    </View>
  );

  if (loading || !form) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#f15b7b" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.progressWrap, { paddingTop: Math.max(insets.top + 8, 14), paddingHorizontal: progressPadding }]}>
        <View style={[styles.progressLineTrack, { left: progressLineInset, right: progressLineInset }]} />
        <View
          style={[
            styles.progressLineActive,
            {
              left: progressLineInset,
              width: progressLineWidth * (stepIndex / (STEP_COUNT - 1)),
            },
          ]}
        />
        {Array.from({ length: STEP_COUNT }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index < stepIndex && styles.progressDotDone,
              index === stepIndex && styles.progressDotCurrent,
            ]}
          >
            <Text
              style={[
                styles.progressDotText,
                index < stepIndex && styles.progressDotTextDone,
                index === stepIndex && styles.progressDotTextCurrent,
              ]}
            >
              {index + 1}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: isCompact ? 8 : 12,
            paddingBottom: 28,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.screenShell, { width: shellWidth }]}>
          {stepIndex === 0 && renderGoalStep()}
          {stepIndex === 1 && renderVitalsStep()}
          {stepIndex === 2 && renderPreferenceStep()}
          {stepIndex === 3 && renderHealthStep()}
          {stepIndex === 4 && renderLifestyleStep()}
          {stepIndex === 5 && renderSummaryStep()}

          {!!errors.length && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errors.join(', ')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footerWrap, { paddingLeft: horizontalPadding, paddingRight: horizontalPadding, paddingBottom: footerPaddingBottom, paddingTop: 10 }]}>
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.backButton, isCompact && styles.backButtonCompact]} onPress={() => (stepIndex === 0 ? router.back() : setStepIndex((current) => current - 1))} disabled={saving}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.continueButton, isCompact && styles.continueButtonCompact]} onPress={handleContinue} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.continueButtonText}>{stepIndex === STEP_COUNT - 1 ? 'Start Journey' : 'Continue →'}</Text>}
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  progressWrap: { backgroundColor: '#f15b7b', paddingBottom: 24, minHeight: 58, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative' },
  progressLineTrack: { position: 'absolute', top: 44, height: 2, backgroundColor: '#ffffff', borderRadius: 999, zIndex: 0 },
  progressLineActive: { position: 'absolute', top: 44, height: 2, backgroundColor: '#ffffff', borderRadius: 999, zIndex: 1 },
  progressDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f15b7b', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', zIndex: 3 },
  progressDotDone: { backgroundColor: '#ffffff', borderColor: '#ffffff' },
  progressDotCurrent: { backgroundColor: '#f15b7b', borderColor: '#ffffff' },
  progressDotText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  progressDotTextDone: { color: '#f15b7b' },
  progressDotTextCurrent: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  content: { alignItems: 'center' },
  screenShell: { alignSelf: 'center' },
  stepTitle: { fontSize: 23, fontWeight: '900', color: '#22252b', marginTop: 10 },
  stepSubtitle: { marginTop: 10, color: '#8b8e97', lineHeight: 22 },
  goalList: { gap: 14, marginTop: 24 },
  goalCard: { borderRadius: 20, borderWidth: 1, borderColor: '#ece6e6', backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 10 }, shadowRadius: 16, elevation: 3, minHeight: 112 },
  goalCardActive: { borderColor: '#f15b7b', borderWidth: 2 },
  goalCardTitle: { fontSize: 17, fontWeight: '900', color: '#22252b' },
  goalCardSubtitle: { marginTop: 6, color: '#535862', lineHeight: 20 },
  goalEmojiBubble: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
  goalEmoji: { fontSize: 40 },
  softPanel: { backgroundColor: '#fff1f3', borderRadius: 18, padding: 14, marginTop: 24, gap: 12 },
  metricCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#eee0e3' },
  metricCardHighlight: { borderColor: '#4e84ff', backgroundColor: '#edf3ff' },
  metricLabel: { color: '#99979f', textTransform: 'uppercase', fontSize: 12, fontWeight: '800' },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 26, marginTop: 14 },
  counterButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ece7e7', alignItems: 'center', justifyContent: 'center' },
  counterButtonWide: { width: 54, height: 44, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ece7e7', alignItems: 'center', justifyContent: 'center' },
  counterButtonText: { fontSize: 24, color: '#1f2937' },
  heightUnitRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  heightUnitButton: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: '#ece7e7', paddingVertical: 12, paddingHorizontal: 12, backgroundColor: '#fff' },
  heightUnitButtonActive: { borderColor: '#f15b7b', backgroundColor: '#fff7f8' },
  heightUnitButtonText: { textAlign: 'center', color: '#4b5563', fontWeight: '700', fontSize: 13 },
  heightUnitButtonTextActive: { color: '#f15b7b' },
  heightFeetRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  heightFeetInput: { flex: 1 },
  counterValue: { fontSize: 34, fontWeight: '900', color: '#9ca3af', minWidth: 72, textAlign: 'center' },
  metricHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricQuestion: { color: '#22252b', fontWeight: '800', fontSize: 15 },
  metricUnit: { color: '#9ca3af', fontSize: 16 },
  metricInput: { marginTop: 20, borderBottomWidth: 2, borderBottomColor: '#f15b7b', fontSize: 28, fontWeight: '900', color: '#22252b', paddingBottom: 8, textAlign: 'center' },
  rangeRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  rangeText: { color: '#99979f', fontSize: 13 },
  preferenceGrid: { marginTop: 22, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  preferenceCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#ece6e6', padding: 14, minHeight: 108, justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 8 }, shadowRadius: 12, elevation: 2 },
  preferenceCardActive: { borderColor: '#f15b7b', borderWidth: 2 },
  preferenceEmoji: { fontSize: 38, alignSelf: 'flex-end' },
  preferenceTitle: { fontSize: 15, fontWeight: '800', color: '#22252b', lineHeight: 20 },
  sectionMiniTitle: { marginTop: 22, fontSize: 16, fontWeight: '900', color: '#22252b' },
  regionGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  regionCard: { width: '47%', borderRadius: 14, borderWidth: 1, borderColor: '#ece6e6', backgroundColor: '#fff', paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center' },
  regionCardActive: { backgroundColor: '#f15b7b', borderColor: '#f15b7b' },
  regionCardText: { color: '#22252b', fontWeight: '700', textAlign: 'center' },
  regionCardTextActive: { color: '#fff' },
  mealsCard: { marginTop: 14, borderRadius: 18, borderWidth: 1, borderColor: '#ece6e6', backgroundColor: '#fff', padding: 20, alignItems: 'center' },
  mealsCount: { fontSize: 48, fontWeight: '900', color: '#f15b7b' },
  mealsLabel: { color: '#99979f', marginTop: -4 },
  checkPanel: { marginTop: 20, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#ece6e6', padding: 16 },
  checkPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#efefef' },
  checkPanelTitle: { fontSize: 16, fontWeight: '900', color: '#22252b' },
  checkPanelEmoji: { fontSize: 30 },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 18, marginTop: 18 },
  checkItem: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: '#f15b7b', backgroundColor: '#fff' },
  checkboxActive: { backgroundColor: '#f15b7b', alignItems: 'center', justifyContent: 'center' },
  checkboxTick: { color: '#fff', fontSize: 14, lineHeight: 16, fontWeight: '900' },
  checkText: { color: '#22252b', fontSize: 15 },
  showMoreButton: { marginTop: 20, borderRadius: 22, borderWidth: 2, borderColor: '#f15b7b', paddingVertical: 12, alignItems: 'center' },
  showMoreText: { color: '#f15b7b', fontWeight: '900', fontSize: 15 },
  inputCard: { marginTop: 20, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#ece6e6', padding: 16 },
  inputLabel: { fontSize: 15, fontWeight: '800', color: '#22252b', marginBottom: 10 },
  textField: { borderWidth: 1, borderColor: '#ebe4e5', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#22252b' },
  segmentRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  segmentButton: { flex: 1, minWidth: 88, borderRadius: 14, borderWidth: 1, borderColor: '#ece6e6', backgroundColor: '#fff', paddingVertical: 12, alignItems: 'center' },
  segmentButtonActive: { backgroundColor: '#f15b7b', borderColor: '#f15b7b' },
  segmentButtonText: { color: '#22252b', fontWeight: '800' },
  segmentButtonTextActive: { color: '#fff' },
  activityList: { gap: 10 },
  activityCard: { borderRadius: 14, borderWidth: 1, borderColor: '#ece6e6', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityCardActive: { borderColor: '#f15b7b', backgroundColor: '#fff1f3' },
  activityEmoji: { fontSize: 22, width: 32, textAlign: 'center' },
  activityText: { color: '#22252b', fontWeight: '700' },
  summaryIntro: { fontSize: 17, lineHeight: 30, color: '#30323a', marginTop: 8 },
  summaryCard: { marginTop: 14, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#ece6e6', padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  summaryBig: { fontSize: 44, fontWeight: '900', color: '#22252b' },
  summaryCardTitle: { fontSize: 15, fontWeight: '900', color: '#22252b', marginTop: 4, lineHeight: 28 },
  summaryNote: { marginTop: 8, color: '#8b8e97', lineHeight: 22 },
  summaryIcon: { fontSize: 38, marginTop: 8 },
  nutritionRow: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  nutritionMetric: { width: '44%' },
  nutritionEmoji: { fontSize: 18, marginBottom: 6 },
  nutritionLabel: { color: '#8b8e97', fontSize: 12, lineHeight: 18 },
  nutritionValue: { marginTop: 4, color: '#22252b', fontWeight: '900', fontSize: 16 },
  journeyText: { marginTop: 20, fontSize: 18, fontWeight: '900', color: '#22252b' },
  summaryGoalTag: { marginTop: 14, alignSelf: 'flex-start', backgroundColor: '#fff1f3', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  summaryGoalText: { color: '#f15b7b', fontWeight: '900' },
  errorBox: { backgroundColor: '#fff1f2', borderRadius: 14, padding: 12, marginTop: 18, borderWidth: 1, borderColor: '#fecdd3' },
  errorText: { color: '#be123c', fontWeight: '700' },
  footerWrap: { backgroundColor: '#fff' },
  footer: { flexDirection: 'row', gap: 12, backgroundColor: 'transparent' },
  backButton: { flex: 1, borderRadius: 30, borderWidth: 3, borderColor: '#f15b7b', backgroundColor: '#fff', paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  backButtonCompact: { paddingVertical: 14 },
  backButtonText: { color: '#7b7c82', fontWeight: '900', fontSize: 15 },
  continueButton: { flex: 1, borderRadius: 30, backgroundColor: '#f15b7b', paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  continueButtonCompact: { paddingVertical: 16 },
  continueButtonText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
