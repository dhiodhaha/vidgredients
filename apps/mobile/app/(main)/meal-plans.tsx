import { router } from 'expo-router';
import { Calendar, Trash2 } from 'lucide-react-native';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { useMealPlanStore } from '../../stores/mealPlan';

export default function MealPlansScreen() {
  const { mealPlans, isLoading, deleteMealPlan } = useMealPlanStore();
  const mealPlansList = Object.values(mealPlans);

  const handleDelete = useCallback(
    (id: string) => {
      deleteMealPlan(id);
    },
    [deleteMealPlan]
  );

  const handlePressCard = useCallback((id: string) => {
    router.push(`/meal-plans/${id}`);
  }, []);

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Calendar size={56} color={COLORS.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No meal plans yet</Text>
      <Text style={styles.emptySubtitle}>
        Generate a plan from your saved recipes to get started
      </Text>
      <Pressable
        onPress={() => router.push('/')}
        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
      >
        <Text style={styles.ctaText}>Generate Meal Plan</Text>
      </Pressable>
    </View>
  );

  const MealPlanCard = ({ id, name, duration, createdAt }: (typeof mealPlansList)[number]) => {
    const date = new Date(createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Pressable
        onPress={() => handlePressCard(id)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{name}</Text>
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Calendar size={14} color={COLORS.textMuted} strokeWidth={1.5} />
              <Text style={styles.metaText}>{duration} days</Text>
            </View>
            <Text style={styles.metaDate}>{formattedDate}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => handleDelete(id)}
          style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
          hitSlop={8}
        >
          <Trash2 size={18} color={COLORS.error} strokeWidth={2} />
        </Pressable>
      </Pressable>
    );
  };

  if (isLoading && mealPlansList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Meal Plans</Text>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Meal Plans</Text>
      {mealPlansList.length > 0 ? (
        <FlatList
          data={mealPlansList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MealPlanCard {...item} />}
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.displayMedium,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
  },
  metaDate: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.textMuted,
  },
  deleteButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.md,
  },
  deleteButtonPressed: {
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.headingLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.bodyMedium,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  ctaButtonPressed: {
    opacity: 0.8,
  },
  ctaText: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
