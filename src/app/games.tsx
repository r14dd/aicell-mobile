import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Clock, GameController, Info, MagnifyingGlass, Users, X } from '@/components/icons';
import { useToast } from '@/components/Toast';
import { AppText, tabular } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Tap } from '@/components/ui/Tap';
import { errorMessage } from '@/api/client';
import { getGames, searchGames, type GamesCatalog } from '@/api/games';
import { useQuery } from '@/api/query';
import { games as seedGames, rewardGames as seedRewardGames, tournament as seedTournament } from '@/data/games';
import { colors, layout } from '@/theme/tokens';

const TOURNAMENT_MS = (3 * 3600 + 17 * 60 + 2) * 1000;

const seed: GamesCatalog = { games: seedGames, rewardGames: seedRewardGames, tournament: seedTournament };

const pad = (n: number) => String(n).padStart(2, '0');

/** `6708` → `6 708`. */
const spaced = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function formatLeft(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${pad(Math.floor(total / 3600))}h ${pad(Math.floor((total % 3600) / 60))}m ${pad(total % 60)}s`;
}

export default function GamesScreen() {
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { data } = useQuery('content/games/', getGames, seed);
  const { games, rewardGames, tournament } = data ?? seed;
  const [left, setLeft] = useState(TOURNAMENT_MS);

  useEffect(() => {
    const endsAt = tournament.endsAt ?? Date.now() + TOURNAMENT_MS;
    const id = setInterval(() => setLeft(endsAt - Date.now()), 1000);
    return () => clearInterval(id);
  }, [tournament.endsAt]);

  // Search answers 501 for now, and the notice it carries is what the user should read.
  const search = () => searchGames('').catch((e: unknown) => toast(errorMessage(e)));

  const openGame = (name: string) => toast(`${name} opens in the games portal, not part of this prototype yet`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: Math.max(insets.top, 14) }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: insets.bottom + 32 }}>
        <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <GameController size={22} color={colors.accentIcon} />
          <AppText variant="bodySemibold" style={{ fontSize: 17, flex: 1 }}>
            Games
          </AppText>
          <Tap
            hitSlop={10}
            haptic={false}
            accessibilityRole="button"
            accessibilityLabel="Search games"
            onPress={() => void search()}>
            <MagnifyingGlass size={22} color={colors.text} />
          </Tap>
          <Tap
            hitSlop={10}
            haptic={false}
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
            <X size={22} color={colors.text} />
          </Tap>
        </View>

        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="heading" style={{ fontSize: 18 }}>
            Tournaments
          </AppText>
          <Tap accessibilityRole="button" accessibilityLabel="Rules" onPress={() => toast('Tournament rules are not part of this prototype yet')}>
            <Pill tone="glass" label="Rules" icon={<Info size={14} color={colors.text} />} />
          </Tap>
        </View>

        <Card style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <AppText variant="caption" tone="secondary">
                {tournament.title}
              </AppText>
              <AppText variant="bodyMedium">{tournament.game}</AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="small" tone="secondary">
                Until the end of the tournament:
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Clock size={14} color={colors.textSecondary} />
                <AppText variant="captionMedium" style={tabular}>
                  {formatLeft(left)}
                </AppText>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <AppText variant="title" style={{ fontSize: 22 }}>
                {tournament.prize}
              </AppText>
              <AppText variant="caption" tone="secondary">
                for 1 place
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Users size={16} color={colors.textSecondary} />
              <AppText variant="captionMedium" style={tabular}>
                {spaced(tournament.participants)}
              </AppText>
            </View>
          </View>
          <Button
            variant="gradient"
            size="md"
            label={tournament.cta}
            style={{ marginTop: 16 }}
            onPress={() => toast('Tournaments are not part of this prototype yet')}
          />
        </Card>

        <View style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="heading" style={{ fontSize: 18 }}>
            All
          </AppText>
          <Tap accessibilityRole="button" accessibilityLabel="All games" onPress={() => toast('The full games list is not part of this prototype yet')}>
            <AppText variant="bodyMedium" tone="link">
              All
            </AppText>
          </Tap>
        </View>

        <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 }}>
          {games.map((g) => (
            <Tap key={g.id} accessibilityRole="button" accessibilityLabel={g.name} onPress={() => openGame(g.name)} style={{ width: '25%', alignItems: 'center' }}>
              <Image source={g.image} contentFit="cover" style={{ width: 72, height: 72, borderRadius: 16, backgroundColor: colors.card }} />
              <AppText variant="small" numberOfLines={2} style={{ textAlign: 'center', marginTop: 6, paddingHorizontal: 4 }}>
                {g.name}
              </AppText>
            </Tap>
          ))}
        </View>

        <AppText variant="heading" style={{ fontSize: 18, marginTop: 24 }}>
          Games with rewards
        </AppText>
        <View style={{ marginTop: 12, flexDirection: 'row', gap: 12 }}>
          {rewardGames.map((g) => (
            <Tap key={g.id} accessibilityRole="button" accessibilityLabel={g.name} onPress={() => openGame(g.name)}>
              <Image source={g.image} contentFit="cover" style={{ width: 96, height: 96, borderRadius: 16, backgroundColor: colors.card }} />
            </Tap>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
