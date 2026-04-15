import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { useHaptics } from '../../hooks/useHaptics';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AREAS = ['Estudio', 'Personal', 'Trabajo', 'Salud', 'Finanzas'];
const PRIORITIES = [
  { value: 'low', label: 'Baja', icon: '!' },
  { value: 'medium', label: 'Media', icon: '!!' },
  { value: 'high', label: 'Alta', icon: '!!!' },
] as const;

const STATUSES = [
  { value: 'todo', label: 'Por hacer' },
  { value: 'in-progress', label: 'En curso' },
  { value: 'done', label: 'Completado' },
] as const;

export default function TaskPageScreen() {
  const activeEditTaskId = useAppStore((s) => s.activeEditTaskId);
  const setActiveEditTaskId = useAppStore((s) => s.setActiveEditTaskId);
  const updateTaskProperties = useAppStore((s) => s.updateTaskProperties);
  const tasks = useAppStore((s) => s.tasks);
  const haptics = useHaptics();

  const task = tasks.find((t) => t.id === activeEditTaskId);
  
  const [visible, setVisible] = useState(false);
  const [localContent, setLocalContent] = useState('');
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Mount/Unmount hooks
  useEffect(() => {
    if (activeEditTaskId && task) {
      setLocalContent(task.content || '');
      setVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: SCREEN_HEIGHT * 0.1, // Leave 10% space at top, Notion style large sheet
          useNativeDriver: true,
          damping: 25,
          stiffness: 250,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
      haptics.impactLight();
    } else {
      closeAnim();
    }
  }, [activeEditTaskId]);

  const closeAnim = () => {
    // Save content on close
    if (task && localContent !== task.content) {
      updateTaskProperties(task.id, { content: localContent });
    }
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => setVisible(false));
    setActiveEditTaskId(null);
  };

  const handleUpdate = (partial: any) => {
    if (!task) return;
    haptics.selection();
    updateTaskProperties(task.id, partial);
  };

  if (!visible && !activeEditTaskId) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeAnim}
    >
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={closeAnim}>
          <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.dragHandle} />
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <TextInput
              style={styles.sheetTitle}
              value={task?.title}
              onChangeText={(text) => updateTaskProperties(task!.id, { title: text })}
              multiline
              placeholder="Título de la Tarea"
              placeholderTextColor={Colors.text.muted}
            />

            {/* PROPERTIES SECTION */}
            <View style={styles.propertiesContainer}>
              {/* STATUS */}
              <View style={styles.propertyRow}>
                <Text style={styles.propertyLabel}>Estado</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.propertyValues}>
                  {STATUSES.map(st => (
                    <TouchableOpacity
                      key={st.value}
                      style={[styles.pill, task?.status === st.value && styles.pillActive]}
                      onPress={() => handleUpdate({ status: st.value })}
                    >
                      <Text style={[styles.pillText, task?.status === st.value && styles.pillTextActive]}>
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* AREA */}
              <View style={styles.propertyRow}>
                <Text style={styles.propertyLabel}>Área</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.propertyValues}>
                  {AREAS.map(ar => (
                    <TouchableOpacity
                      key={ar}
                      style={[styles.pill, task?.area === ar && styles.pillActive]}
                      onPress={() => handleUpdate({ area: task?.area === ar ? undefined : ar })}
                    >
                      <Text style={[styles.pillText, task?.area === ar && styles.pillTextActive]}>
                        {ar}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* PRIORIDAD */}
              <View style={styles.propertyRow}>
                <Text style={styles.propertyLabel}>Prioridad</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.propertyValues}>
                  {PRIORITIES.map(pr => (
                    <TouchableOpacity
                      key={pr.value}
                      style={[styles.pill, task?.priority === pr.value && styles.pillActive]}
                      onPress={() => handleUpdate({ priority: pr.value })}
                    >
                      <Text style={[styles.pillText, task?.priority === pr.value && styles.pillTextActive]}>
                        {pr.icon} {pr.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.divider} />

            {/* CONTENT EDITOR (NOTION PAGE INTERIOR) */}
            <TextInput
              style={styles.contentInput}
              value={localContent}
              onChangeText={setLocalContent}
              multiline
              placeholder="Añade notas o detalles de la tarea..."
              placeholderTextColor={Colors.text.muted}
              textAlignVertical="top"
              autoCorrect={false}
            />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Ensure ScrollView is imported
import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.dark.overlay, // Deep overlay
  },
  sheet: {
    backgroundColor: Colors.dark.surface, // Notion uses strict surfaces
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    height: SCREEN_HEIGHT * 0.9, // Large 90% sheet
    ...Shadows.card,
    borderTopWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.text.muted,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  sheetTitle: {
    color: Colors.text.primary,
    fontSize: Typography.size.xxl,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.lg,
  },
  propertiesContainer: {
    gap: Spacing.md,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    width: 80, // Fixed width for alignment like Notion
  },
  propertyValues: {
    flex: 1,
    flexDirection: 'row',
  },
  pill: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md,
    marginRight: Spacing.sm,
  },
  pillActive: {
    backgroundColor: Colors.dark.surfaceHigh, // Active state is slightly raised
  },
  pillText: {
    color: Colors.text.secondary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  pillTextActive: {
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.surfaceBorder,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  contentInput: {
    color: Colors.text.primary,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.regular,
    minHeight: 300,
    lineHeight: 22,
  },
});
