import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';

export type FilterValue = 'all' | 'today' | 'pending' | `area:${string}`;

interface FilterBarProps {
  selectedFilter: FilterValue;
  onSelectFilter: (filter: FilterValue) => void;
}

export default function FilterBar({ selectedFilter, onSelectFilter }: FilterBarProps) {
  const tasks = useAppStore((s) => s.tasks);

  const filterOptions = useMemo(() => {
    // Determine unique areas from the active tasks
    const areas = new Set<string>();
    tasks.forEach(task => {
      if (task.area) {
        areas.add(task.area);
      }
    });

    const baseFilters: { label: string; value: FilterValue }[] = [
      { label: 'Todo', value: 'all' },
      { label: 'Hoy', value: 'today' },
      { label: 'Pendientes', value: 'pending' },
    ];

    const areaFilters = Array.from(areas).sort().map(area => ({
      label: area,
      value: `area:${area}` as FilterValue,
    }));

    return [...baseFilters, ...areaFilters];
  }, [tasks]);

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filterOptions.map((option) => {
          const isActive = selectedFilter === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelectFilter(option.value)}
              style={[
                styles.pill,
                isActive && styles.pillActive,
              ]}
              activeOpacity={0.7}
            >
              <Text 
                style={[
                  styles.pillText,
                  isActive && styles.pillTextActive
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.dark.bg, // Strict dark mode
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark.surfaceHigh,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: Colors.text.primary, // white background for active
    borderColor: Colors.text.primary,
  },
  pillText: {
    color: Colors.text.secondary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  pillTextActive: {
    color: Colors.dark.bg, // text becomes black
    fontFamily: Typography.fontFamily.semiBold,
  },
});
