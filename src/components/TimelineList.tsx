// ============================================================
// TIMELINE LIST — SectionList agrupado por día
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
import TaskRow from './TaskRow';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import type { SectionData, Task } from '../types';
import type { FilterValue } from './FilterBar';

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

function buildSections(tasks: Task[], filterValue: FilterValue, calendarDay?: string | null): SectionData[] {
  const grouped: Record<string, Task[]> = {};
  const todayKey = format(new Date(), 'yyyy-MM-dd');

  for (const task of tasks) {
    if (task.status === 'done' && filterValue !== 'all') continue; 
    
    if (calendarDay && task.dayKey !== calendarDay) continue; 
    
    if (filterValue === 'today' && task.dayKey !== todayKey) continue;
    if (filterValue === 'pending' && task.status === 'done') continue;
    if (filterValue.startsWith('area:')) {
      const targetArea = filterValue.split(':')[1];
      if (task.area !== targetArea) continue;
    }

    if (!grouped[task.dayKey]) grouped[task.dayKey] = [];
    grouped[task.dayKey].push(task);
  }

  return Object.keys(grouped)
    .sort()
    .map((dayKey) => ({
      title: getDayLabel(dayKey),
      dayKey,
      data: grouped[dayKey].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
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
  filterValue,
  calendarDay,
  onScroll,
}: {
  listRef?: React.RefObject<SectionList<Task, SectionData> | null>;
  filterValue: FilterValue;
  calendarDay?: string | null;
  onScroll?: (event: any) => void;
}) {
  const tasks = useAppStore((s) => s.tasks);
  const setActiveEditTaskId = useAppStore((s) => s.setActiveEditTaskId);

  const sections = useMemo(() => buildSections(tasks, filterValue, calendarDay), [tasks, filterValue, calendarDay]);

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

  const renderItem: SectionListRenderItem<Task, SectionData> = useCallback(
    ({ item }) => <TaskRow task={item} onPress={() => setActiveEditTaskId(item.id)} />,
    []
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

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
    backgroundColor: Colors.dark.bg, // Notion strict dark
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
});
