import React from 'react';
import { Image, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function splitIngredients(food) {
  const recipe = String(food?.recipe || '').trim();
  if (!recipe) return [];
  return recipe
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 16);
}

export default function DietFoodDetailModal({ visible, food, rawDetail, foodGlyph, onClose }) {
  const [imageFailed, setImageFailed] = React.useState(false);
  React.useEffect(() => {
    setImageFailed(false);
  }, [food?.foodId, food?.imageUrl, food?.imageId]);

  if (!food) return null;
  const ingredients = splitIngredients(food);
  const imageUri = String(food.imageUrl || food.imageId || rawDetail?.item?.imageUrl || rawDetail?.item?.imageId || '').trim();
  const macroCards = [
    { label: 'Fiber', value: `${Number(food.fiber || 0).toFixed(1)}g` },
    { label: 'Carbs', value: `${Number(food.carbs || 0).toFixed(1)}g` },
    { label: 'Protein', value: `${Number(food.protein || 0).toFixed(1)}g` },
    { label: 'Fat', value: `${Number(food.fat || 0).toFixed(1)}g` },
  ];
  const healthTags = [
    ...(Array.isArray(food.avoidIn) ? food.avoidIn.map((item) => `Avoid: ${item}`) : []),
    ...(Array.isArray(food.recommendedIn) ? food.recommendedIn.map((item) => `Recommended: ${item}`) : []),
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Food Details</Text>
              {!!food.foodType && <Text style={styles.headerSub}>{food.foodType}</Text>}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.heroImage}>
              {imageUri && !imageFailed ? (
                <Image source={{ uri: imageUri }} style={styles.heroImageAsset} onError={() => setImageFailed(true)} resizeMode="cover" />
              ) : (
                <Text style={styles.heroGlyph}>{foodGlyph || '🥕'}</Text>
              )}
            </View>

            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{food.name}</Text>
                <Text style={styles.summary}>
                  {food.portion || 1}{food.portionUnit ? ` ${food.portionUnit}` : ''} · {Math.round(food.calories || 0)} kcal
                </Text>
              </View>
              {(food.hasRecipe || Number(food.score || 0) >= 70) ? (
                <View style={styles.choiceBadge}>
                  <Text style={styles.choiceBadgeText}>{food.hasRecipe ? 'Recipe' : 'Best choice'}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.macroGrid}>
              {macroCards.map((item) => (
                <View key={item.label} style={styles.macroCard}>
                  <Text style={styles.macroLabel}>{item.label}</Text>
                  <Text style={styles.macroValue}>{item.value}</Text>
                </View>
              ))}
            </View>

            {!!food.brandName && <Text style={styles.line}>Brand: {food.brandName}</Text>}
            {!!food.nutriScore && <Text style={styles.line}>NutriScore: {food.nutriScore}</Text>}

            {!!food.remark && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Remarks</Text>
                <Text style={styles.paragraph}>{food.remark}</Text>
              </View>
            )}

            {!!ingredients.length && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                <View style={styles.ingredientGrid}>
                  {ingredients.map((item, index) => (
                    <View key={`${food.foodId}-ingredient-${index}`} style={styles.ingredientCard}>
                      <Text style={styles.ingredientText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {!!food.steps?.length && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preparation</Text>
                {food.steps.map((step, index) => (
                  <View key={`${food.foodId}-${index}`} style={styles.stepRow}>
                    <View style={styles.stepDot}>
                      <Text style={styles.stepDotText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}

            {!!food.video && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Video</Text>
                <TouchableOpacity onPress={() => Linking.openURL(food.video).catch(() => null)}>
                  <Text style={styles.videoLink}>Open recipe video</Text>
                </TouchableOpacity>
              </View>
            )}

            {!!healthTags.length && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Health Tags</Text>
                <View style={styles.tagWrap}>
                  {healthTags.map((tag) => (
                    <View key={tag} style={styles.tagPill}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.3)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fcfcfe', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16, maxHeight: '92%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#22252b' },
  headerSub: { marginTop: 4, color: '#9b9fb0', fontSize: 14 },
  closeButton: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, borderColor: '#e8e8ef', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  close: { color: '#9b9fb0', fontSize: 20, lineHeight: 20 },
  heroImage: { height: 190, borderRadius: 22, backgroundColor: '#f7f0eb', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroImageAsset: { width: '100%', height: '100%', borderRadius: 18 },
  heroGlyph: { fontSize: 84 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 16 },
  title: { fontSize: 17, fontWeight: '700', color: '#22252b', flex: 1, paddingRight: 8 },
  choiceBadge: { backgroundColor: '#dbf9e7', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  choiceBadgeText: { color: '#22a75b', fontSize: 12, fontWeight: '800' },
  summary: { color: '#7d8596', fontSize: 15, marginTop: 4 },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  macroCard: { width: '22%', minWidth: 74, flexGrow: 1, borderWidth: 1, borderColor: '#e8e8ef', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center', backgroundColor: '#fff' },
  macroLabel: { color: '#9b9fb0', fontSize: 12 },
  macroValue: { color: '#22252b', fontSize: 14, fontWeight: '900', marginTop: 8 },
  line: { marginTop: 10, color: '#334155' },
  section: { marginTop: 18, paddingTop: 18, borderTopWidth: 1, borderTopColor: '#edf0f5' },
  sectionTitle: { fontWeight: '900', color: '#8b8e97', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.4 },
  paragraph: { color: '#334155', lineHeight: 22, fontSize: 15 },
  ingredientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ingredientCard: { width: '48%', minWidth: 150, borderWidth: 1, borderColor: '#e8e8ef', borderRadius: 14, padding: 12, backgroundColor: '#fff' },
  ingredientText: { color: '#334155', fontSize: 14, lineHeight: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f15b7b', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepDotText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  stepText: { flex: 1, color: '#22252b', fontSize: 16, lineHeight: 24 },
  videoLink: { color: '#f15b7b', fontWeight: '800', fontSize: 16 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagPill: { backgroundColor: '#f3f4f8', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  tagText: { color: '#334155', fontSize: 14 },
});
