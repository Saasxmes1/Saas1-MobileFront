// ============================================================
// TIMELINE LIST — SectionList agrupado por día
// FIX: Selecciona events (referencia estable) + useMemo para
// evitar el "getSnapshot infinite loop" de Zustand v5
// ============================================================
import React, { useCallback, useMemo } from 'react';
import {
  SectionList,
  View,
  Text,
  StyleSheet,
  SectionListRenderItem,
  RefreshControl,
} from 'react-native';
import { format } from 'date-fns';
import { useAppStore } from '../store/useAppStore';
import EventCard from './EventCard';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import type { SectionData, Event } from '../types';

// ── Helpers ────────────────────────────────────────────────
function getDayLabel(dayKey: string): string {
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
  if (dayKey === today) return 'Hoy';
  if (dayKey === tomorrow) return 'Mañana';

  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return `${dayNames[date.getDay()]} ${day} de ${monthNames[month - 1]}`;
}

function buildSections(events: Event[]): SectionData[] {
  const grouped: Record<string, Event[]> = {};
  for (const event of events) {
    if (event.isCompleted) continue; // Hide completed events from timeline
    if (!grouped[event.dayKey]) grouped[event.dayKey] = [];
    grouped[event.dayKey].push(event);
  }
  return Object.keys(grouped)
    .sort()
    .map((dayKey) => ({
      title: getDayLabel(dayKey),
      dayKey,
      data: grouped[dayKey].sort((a, b) => {
        if (!a.scheduledAt) return 1;
        if (!b.scheduledAt) return -1;
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      }),
    }));
}

// ── Sub-components ─────────────────────────────────────────
function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🌟</Text>
      <Text style={styles.emptyTitle}>¡Todo despejado!</Text>
      <Text style={styles.emptySubtitle}>
        Usa el Magic Input de arriba para agregar{'\n'}tu primera tarea o recordatorio.
      </Text>
      <View style={styles.emptyHintContainer}>
        <Text style={styles.emptyHint}>💡 Prueba escribir:</Text>
        <Text style={styles.emptyExample}>"Reunión el viernes a las 10am"</Text>
        <Text style={styles.emptyExample}>"Comprar leche mañana"</Text>
        <Text style={styles.emptyExample}>"Examen en 2 horas"</Text>
      </View>
    </View>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  const isToday = title === 'Hoy';
  const isTomorrow = title === 'Mañana';
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLabelRow}>
        <Text style={[styles.sectionTitle, isToday && styles.sectionTitleToday]}>
          {isToday ? '📅 ' : isTomorrow ? '🌅 ' : '📆 '}{title}
        </Text>
        <View style={[styles.countBadge, isToday && { backgroundColor: Colors.brand.primary }]}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      </View>
      <View style={[styles.sectionDivider, isToday && { backgroundColor: Colors.brand.primary }]} />
    </View>
  );
}

// ── Main component ─────────────────────────────────────────
export default function TimelineList({
  listRef,
  onScroll,
}: {
  listRef?: React.RefObject<SectionList<Event, SectionData> | null>;
  onScroll?: (event: any) => void;
}) {
  // ✅ Seleccionar el array primitivo (referencia estable en Zustand v5)
  const events = useAppStore((s) => s.events);

  // ✅ Calcular secciones en useMemo — solo recalcula cuando events cambia
  const sections = useMemo(() => buildSections(events), [events]);

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionData }) => (
      <SectionHeader title={section.title} count={section.data.length} />
    ),
    []
  );

  const renderItem: SectionListRenderItem<Event, SectionData> = useCallback(
    ({ item }) => <EventCard event={item} />,
    []
  );

  const keyExtractor = useCallback((item: Event) => item.id, []);

  return (
    <SectionList
      ref={listRef as any}
      sections={sections}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      renderSectionFooter={() => <View style={{ height: Spacing.sm }} />}
      ListEmptyComponent={EmptyState}
      contentContainerStyle={[styles.listContent, sections.length === 0 && styles.emptyList]}
      stickySectionHeadersEnabled
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.brand.primaryLight}
          colors={[Colors.brand.primary]}
        />
      }
    />
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  listContent: { paddingTop: Spacing.md, paddingBottom: 100 },
  emptyList: { flexGrow: 1 },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.dark.bg,
  },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs },
  sectionTitle: { color: Colors.text.secondary, fontSize: Typography.size.sm, fontFamily: Typography.fontFamily.semiBold, letterSpacing: 0.5, textTransform: 'uppercase' },
  sectionTitleToday: { color: Colors.brand.primaryLight },
  countBadge: { backgroundColor: Colors.dark.surfaceHigh, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  countText: { color: Colors.text.secondary, fontSize: Typography.size.xs, fontFamily: Typography.fontFamily.bold },
  sectionDivider: { height: 1, backgroundColor: Colors.dark.surfaceBorder, borderRadius: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxl, gap: Spacing.sm },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.sm },
  emptyTitle: { color: Colors.text.primary, fontSize: Typography.size.xxl, fontFamily: Typography.fontFamily.bold, textAlign: 'center' },
  emptySubtitle: { color: Colors.text.secondary, fontSize: Typography.size.md, fontFamily: Typography.fontFamily.regular, textAlign: 'center', lineHeight: 22 },
  emptyHintContainer: { marginTop: Spacing.lg, backgroundColor: Colors.dark.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.dark.surfaceBorder, gap: Spacing.xs, width: '100%' },
  emptyHint: { color: Colors.brand.primaryLight, fontSize: Typography.size.sm, fontFamily: Typography.fontFamily.semiBold, marginBottom: 4 },
  emptyExample: { color: Colors.text.muted, fontSize: Typography.size.sm, fontFamily: Typography.fontFamily.regular, fontStyle: 'italic' },
});
