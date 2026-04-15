import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../types';
import { useAppStore } from '../store/useAppStore';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';

interface TaskRowProps {
  task: Task;
  onPress: () => void;
}

export default function TaskRow({ task, onPress }: TaskRowProps) {
  const updateTaskStatus = useAppStore((s) => s.updateTaskStatus);

  const handleStatusToggle = () => {
    let nextStatus: 'todo' | 'in-progress' | 'done' = 'todo';
    if (task.status === 'todo') nextStatus = 'in-progress';
    else if (task.status === 'in-progress') nextStatus = 'done';
    else nextStatus = 'todo';
    
    updateTaskStatus(task.id, nextStatus);
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'done': return Colors.brand.primary;
      case 'in-progress': return Colors.brand.warning;
      case 'todo': 
      default:
        return 'transparent';
    }
  };

  const priorityIcon = {
    low: '!',
    medium: '!!',
    high: '!!!',
  }[task.priority || 'low'];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        task.status === 'done' && styles.containerDone,
      ]}
    >
      {/* STATUS INDICATOR */}
      <TouchableOpacity 
        style={[
          styles.statusCircle,
          { backgroundColor: getStatusColor() },
          task.status === 'done' && styles.statusCircleDone
        ]}
        onPress={handleStatusToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {task.status === 'done' && <Text style={styles.checkIcon}>✓</Text>}
      </TouchableOpacity>

      {/* TITLE */}
      <View style={styles.titleContainer}>
        <Text
          style={[
            styles.title,
            task.status === 'done' && styles.titleDone,
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
      </View>

      {/* METADATA PILLS */}
      <View style={styles.metadata}>
        {task.area ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{task.area}</Text>
          </View>
        ) : null}
        
        {task.priority ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{priorityIcon}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface, // #121212
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    minHeight: 52,
  },
  containerDone: {
    opacity: 0.6,
  },
  statusCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.text.muted,
    marginRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCircleDone: {
    borderColor: Colors.brand.primary,
  },
  checkIcon: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.medium,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: Colors.text.muted,
  },
  metadata: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  pill: {
    backgroundColor: Colors.dark.surfaceHigh, // Slightly lighter than surface
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
  },
  pillText: {
    color: Colors.text.secondary,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
  },
});
