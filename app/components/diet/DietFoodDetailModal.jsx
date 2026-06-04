import React from 'react';
import { Image, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function splitIngredients(food) {
  const recipe = String(food?.recipe || '').trim();
  if (!recipe) return [];
  return recipe
    .split(/\n|,/)
    .map((item) => item.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 24);
}

function splitSteps(food) {
  if (Array.isArray(food?.steps) && food.steps.length) return food.steps;
  const raw = String(food?.steps || '').trim();
  if (!raw) return [];
  return raw
    .split(/Step\s+\d+/i)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function DietFoodDetailModal({ visible, food, rawDetail, foodGlyph, canLog, saving, onApply, onClose }) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    setImageFailed(false);
  }, [food?.foodId, food?.imageUrl, food?.imageId]);

  React.useEffect(() => {
    setQuantity(Math.max(1, Number(food?.quantity || 1)));
  }, [food?.foodId, food?.source, food?.quantity]);

  if (!food) return null;

  const ingredients = splitIngredients(rawDetail?.item || food);
  const steps = splitSteps(rawDetail?.item || food);
  const imageUri = String(food.imageUrl || food.imageId || rawDetail?.item?.imageUrl || rawDetail?.item?.imageId || '').trim();
  const macroCards = [
    { label: 'Fiber', value: `${(Number(food.fiber || 0) * quantity).toFixed(1)} g`, icon: '🫛' },
    { label: 'Carbs', value: `${(Number(food.carbs || 0) * quantity).toFixed(1)} g`, icon: '🌿' },
    { label: 'Protein', value: `${(Number(food.protein || 0) * quantity).toFixed(1)} g`, icon: '💪' },
    { label: 'Fats', value: `${(Number(food.fat || 0) * quantity).toFixed(1)} g`, icon: '🧀' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.heroWrap}>
            {imageUri && !imageFailed ? (
              <Image source={{ uri: imageUri }} style={styles.heroImage} onError={() => setImageFailed(true)} resizeMode="cover" />
            ) : (
              <View style={styles.heroFallback}>
                <Text style={styles.heroGlyph}>{foodGlyph || '🥕'}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            <Text style={styles.noteText}>
              Note: Nutrition is based on standard portions; recipes are for reference only.
            </Text>

            <View style={styles.topActionRow}>
              <View style={styles.qtyPill}>
                <TouchableOpacity disabled={quantity <= 1 || saving || !canLog} onPress={() => setQuantity((current) => Math.max(1, current - 1))}>
                  <Text style={[styles.qtyAction, (quantity <= 1 || !canLog) && styles.qtyActionDisabled]}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyCount}>{quantity}</Text>
                <TouchableOpacity disabled={saving || !canLog} onPress={() => setQuantity((current) => Math.min(9, current + 1))}>
                  <Text style={[styles.qtyAction, !canLog && styles.qtyActionDisabled]}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.portionText}>
                {quantity > 1 ? `${quantity} × ` : ''}{food.portionUnit || '1 serving'}
              </Text>
              <TouchableOpacity
                style={[styles.logButton, (!canLog || saving) && styles.logButtonDisabled]}
                disabled={!canLog || saving}
                onPress={() => onApply?.({ quantity, isConsumed: !food.isConsumed })}
              >
                <Text style={styles.logButtonText}>
                  {saving ? 'Saving…' : !canLog ? 'Locked' : food.isConsumed ? 'Logged ✓' : 'Log +'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.foodTitle}>{food.name}</Text>
            <Text style={styles.calorieText}>Calories: {Math.round((food.calories || 0) * quantity)} Kcal</Text>
            {(food.hasRecipe || Number(food.score || 0) >= 8) ? (
              <Text style={styles.bestChoiceText}>Best Choice</Text>
            ) : null}

            <View style={styles.macroRow}>
              {macroCards.map((item) => (
                <View key={item.label} style={styles.macroItem}>
                  <Text style={styles.macroIcon}>{item.icon}</Text>
                  <Text style={styles.macroLabel}>{item.label}</Text>
                  <Text style={styles.macroValue}>{item.value}</Text>
                </View>
              ))}
            </View>

            {!!ingredients.length && (
              <View style={styles.sectionWrap}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.ingredientRow}>
                    {ingredients.map((item, index) => (
                      <View key={`${food.foodId}-ingredient-${index}`} style={styles.ingredientCard}>
                        <Text style={styles.ingredientTitle}>{item.split(':')[0] || item}</Text>
                        <Text style={styles.ingredientValue}>{item.split(':').slice(1).join(':').trim() || ''}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {!!steps.length && (
              <View style={styles.sectionWrap}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                <View style={styles.instructionsList}>
                  {steps.map((step, index) => (
                    <View key={`${food.foodId}-step-${index}`} style={styles.stepRow}>
                      <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {!!food.video && (
              <TouchableOpacity style={styles.videoLinkWrap} onPress={() => Linking.openURL(food.video).catch(() => null)}>
                <Text style={styles.videoLinkText}>Open recipe video</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#fff' },
  sheet: { flex: 1, backgroundColor: '#fff' },
  heroWrap: { position: 'relative', height: 320, backgroundColor: '#f6eee6' },
  heroImage: { width: '100%', height: '100%' },
  heroFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroGlyph: { fontSize: 96 },
  closeButton: { position: 'absolute', top: 18, right: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  closeIcon: { color: '#4b5563', fontSize: 26, lineHeight: 26, fontWeight: '700' },
  body: { padding: 16, paddingBottom: 32 },
  noteText: { color: '#6b7280', fontSize: 14, lineHeight: 18, fontStyle: 'italic' },
  topActionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
  qtyPill: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#ff4f73', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  qtyAction: { color: '#fff', fontSize: 24, fontWeight: '700', lineHeight: 24 },
  qtyActionDisabled: { opacity: 0.5 },
  qtyCount: { color: '#fff', fontSize: 20, fontWeight: '700' },
  portionText: { flex: 1, color: '#333841', fontSize: 15, fontWeight: '500' },
  logButton: { backgroundColor: '#ff4f73', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
  logButtonDisabled: { opacity: 0.6 },
  logButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  foodTitle: { marginTop: 18, color: '#1f2937', fontSize: 32, fontWeight: '800' },
  calorieText: { marginTop: 10, color: '#5b616a', fontSize: 18, textDecorationLine: 'underline' },
  bestChoiceText: { marginTop: 4, color: '#2c9b45', fontSize: 18, fontWeight: '700' },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 28, gap: 10 },
  macroItem: { flex: 1, alignItems: 'center' },
  macroIcon: { fontSize: 24 },
  macroLabel: { marginTop: 10, color: '#474c55', fontSize: 16, fontWeight: '500' },
  macroValue: { marginTop: 10, color: '#717680', fontSize: 16 },
  sectionWrap: { marginTop: 26, borderWidth: 1.5, borderColor: '#ff5d7c', borderRadius: 18, padding: 14 },
  sectionTitle: { position: 'absolute', top: -14, left: 14, backgroundColor: '#fff', paddingHorizontal: 6, color: '#ff4f73', fontSize: 16, fontWeight: '700' },
  ingredientRow: { flexDirection: 'row', gap: 0, paddingTop: 14 },
  ingredientCard: { width: 112, paddingHorizontal: 12, paddingVertical: 8, borderRightWidth: 1, borderRightColor: '#eceef3' },
  ingredientTitle: { color: '#111827', fontSize: 15, fontWeight: '700' },
  ingredientValue: { marginTop: 8, color: '#6b7280', fontSize: 14 },
  instructionsList: { marginTop: 18, gap: 18 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ff4f73', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepBadgeText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  stepText: { flex: 1, color: '#6b7280', fontSize: 16, lineHeight: 22 },
  videoLinkWrap: { marginTop: 20, alignSelf: 'flex-start' },
  videoLinkText: { color: '#ff4f73', fontSize: 16, fontWeight: '700' },
});
