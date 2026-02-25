import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SecureStore } from '../utils/secureStore';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  dog_name: string | null;
  bones: number;
  level: number;
  xp: number;
  streak_days: number;
  exercises_completed: number;
  is_current_user: boolean;
}

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const MEDAL_ICONS = ['trophy', 'medal', 'ribbon'];

export default function LeaderboardScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) return;
      const response = await axios.get(`${BACKEND_URL}/api/gamification/leaderboard?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaderboard(response.data.leaderboard || []);
      setCurrentUserRank(response.data.current_user_rank);
    } catch (error) {
      console.log('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const renderPodium = () => {
    const top3 = leaderboard.slice(0, 3);
    if (top3.length === 0) return null;
    // Reorder: 2nd, 1st, 3rd for visual podium
    const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
    const heights = [100, 140, 80];

    return (
      <View style={styles.podiumContainer} data-testid="leaderboard-podium">
        {podiumOrder.map((entry, idx) => {
          const actualRank = entry.rank;
          const podiumHeight = top3.length >= 3 ? heights[idx] : 140;
          const isFirst = actualRank === 1;
          return (
            <View key={entry.user_id} style={[styles.podiumItem, { flex: isFirst ? 1.2 : 1 }]}>
              <View style={[styles.podiumAvatar, isFirst && styles.podiumAvatarFirst, entry.is_current_user && styles.podiumAvatarMe]}>
                <Ionicons name={MEDAL_ICONS[actualRank - 1] as any} size={isFirst ? 32 : 24} color={MEDAL_COLORS[actualRank - 1]} />
              </View>
              <Text style={[styles.podiumName, isFirst && styles.podiumNameFirst]} numberOfLines={1}>
                {entry.name.split(' ')[0]}
              </Text>
              {entry.dog_name && (
                <Text style={styles.podiumDog} numberOfLines={1}>{entry.dog_name}</Text>
              )}
              <View style={[styles.podiumBar, { height: podiumHeight, backgroundColor: MEDAL_COLORS[actualRank - 1] + '30' }]}>
                <Text style={[styles.podiumRank, { color: MEDAL_COLORS[actualRank - 1] }]}>#{actualRank}</Text>
                <Text style={styles.podiumBones}>{entry.bones}</Text>
                <Text style={styles.podiumBonesLabel}>{'🦴'}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} data-testid="leaderboard-back">
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('leaderboardTitle')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Podium */}
        {renderPodium()}

        {/* Current user rank if not in top */}
        {currentUserRank && currentUserRank > 3 && (
          <View style={styles.myRankCard} data-testid="leaderboard-my-rank">
            <Ionicons name="person" size={20} color={Colors.primary} />
            <Text style={styles.myRankText}>{t('yourPosition')}: </Text>
            <Text style={styles.myRankNumber}>#{currentUserRank}</Text>
          </View>
        )}

        {/* Rest of the list */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>{t('topTrainers')}</Text>
          {leaderboard.map((entry) => (
            <View
              key={entry.user_id}
              style={[styles.listItem, entry.is_current_user && styles.listItemMe]}
              data-testid={`leaderboard-entry-${entry.rank}`}
            >
              <View style={styles.rankBadge}>
                {entry.rank <= 3 ? (
                  <Ionicons name={MEDAL_ICONS[entry.rank - 1] as any} size={20} color={MEDAL_COLORS[entry.rank - 1]} />
                ) : (
                  <Text style={styles.rankNumber}>{entry.rank}</Text>
                )}
              </View>
              <View style={styles.listItemInfo}>
                <Text style={[styles.listItemName, entry.is_current_user && styles.listItemNameMe]}>
                  {entry.name} {entry.is_current_user ? '(Tu)' : ''}
                </Text>
                <Text style={styles.listItemSub}>
                  {entry.dog_name ? `${entry.dog_name} - ` : ''}{t('level')} {entry.level} - {entry.streak_days} {t('days')}
                </Text>
              </View>
              <View style={styles.listItemBones}>
                <Text style={styles.listItemBonesText}>{entry.bones}</Text>
                <Text style={styles.listItemBonesEmoji}>{'🦴'}</Text>
              </View>
            </View>
          ))}

          {leaderboard.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={48} color={Colors.gray} />
              <Text style={styles.emptyText}>{t('noRankYet')}</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text },
  scrollContent: { padding: Spacing.md },
  podiumContainer: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    marginBottom: Spacing.xl, paddingTop: Spacing.lg,
  },
  podiumItem: { alignItems: 'center', marginHorizontal: 4 },
  podiumAvatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.grayLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs,
    borderWidth: 2, borderColor: Colors.grayLight,
  },
  podiumAvatarFirst: { width: 64, height: 64, borderRadius: 32, borderColor: '#FFD700', borderWidth: 3 },
  podiumAvatarMe: { borderColor: Colors.primary, borderWidth: 3 },
  podiumName: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  podiumNameFirst: { fontSize: FontSizes.md, fontWeight: '700' },
  podiumDog: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 4 },
  podiumBar: {
    width: '100%', borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.sm, marginTop: 4,
  },
  podiumRank: { fontSize: FontSizes.xl, fontWeight: '800' },
  podiumBones: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  podiumBonesLabel: { fontSize: 16 },
  myRankCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primaryLight, padding: Spacing.md, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  myRankText: { fontSize: FontSizes.md, color: Colors.text, marginLeft: Spacing.sm },
  myRankNumber: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.primary },
  listContainer: { marginTop: Spacing.sm },
  listTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  listItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, ...Shadows.sm,
  },
  listItemMe: { backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary },
  rankBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.grayLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  rankNumber: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textSecondary },
  listItemInfo: { flex: 1 },
  listItemName: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text },
  listItemNameMe: { color: Colors.primary, fontWeight: '700' },
  listItemSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  listItemBones: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  listItemBonesText: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  listItemBonesEmoji: { fontSize: 16 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.md },
});
