import { useState } from 'react';
import { RefreshControl, StatusBar, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { House } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { HomeHeader } from '../components/home/HomeHeader';
import { HomeScrollContext } from '../components/home/HomeScrollContext';
import { HomeSkeleton } from '../components/home/HomeSkeleton';
import { RevealOnScroll } from '../components/home/RevealOnScroll';
import { useSectionTextColor } from '../components/home/SectionBackground';
import {
  isKnownSection,
  SectionRenderer,
} from '../components/home/SectionRenderer';
import { StateView } from '../components/StateView';
import { useConfig } from '../hooks/useConfig';
import { useTheme } from '../hooks/useTheme';
import type { SectionBackground } from '../types/api';

// Scroll distance after which the header has its solid backdrop.
const HEADER_SOLID_AFTER = 60;

/** Home tab: renders the sections of the remote config, in config order, under a collapsing header. */
export function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { config, source, isLoading, isFetching, refetch } = useConfig();
  const isFocused = useIsFocused();
  const scrollY = useSharedValue(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [headerSolid, setHeaderSolid] = useState(false);

  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });
  // Crosses to the JS thread only when the threshold flips, not on every frame.
  useAnimatedReaction(
    () => scrollY.value > HEADER_SOLID_AFTER,
    (solid, previous) => {
      if (solid !== previous) scheduleOnRN(setHeaderSolid, solid);
    },
  );

  const sections = config.sections.filter(isKnownSection);
  const pageBackground: SectionBackground = {
    kind: 'color',
    value: colors.background,
  };
  const topRowColor = useSectionTextColor(
    sections[0]?.background ?? pageBackground,
  );
  // Light status-bar icons only while a dark first section shows behind them.
  const lightStatusBar = !headerSolid && topRowColor === colors.surface;

  if (isLoading) return <HomeSkeleton />;

  return (
    <HomeScrollContext.Provider value={scrollY}>
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        {isFocused ? (
          <StatusBar
            barStyle={lightStatusBar ? 'light-content' : 'dark-content'}
          />
        ) : null}
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressViewOffset={headerHeight}
            />
          }
        >
          {sections.length === 0 ? (
            <View style={[styles.flex, { paddingTop: headerHeight }]}>
              <StateView
                icon={House}
                title={t('home.emptyTitle')}
                message={t('home.emptyMessage')}
                actionLabel={t('common.retry')}
                onAction={refetch}
              />
            </View>
          ) : (
            sections.map((section, index) =>
              index === 0 ? (
                // The first section runs up behind the header; minHeight keeps later sections clear of it
                // even if this one has no valid items and renders nothing.
                <View key={section.id} style={{ minHeight: headerHeight }}>
                  <SectionRenderer section={section} topInset={headerHeight} />
                </View>
              ) : (
                <RevealOnScroll key={section.id}>
                  <SectionRenderer section={section} />
                </RevealOnScroll>
              ),
            )
          )}
        </Animated.ScrollView>
        <HomeHeader
          scrollY={scrollY}
          topRowColor={topRowColor}
          isStale={source !== undefined && source !== 'network'}
          onRetry={refetch}
          onHeight={setHeaderHeight}
        />
      </View>
    </HomeScrollContext.Provider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1 },
});
