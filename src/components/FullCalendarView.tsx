// ============================================================
// FULL CALENDAR VIEW — Vista satelital tipo Notion / Bento
// Usa react-native-calendars
// ============================================================
import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useAppStore } from '../store/useAppStore';
import { Colors, Spacing, Radius, Typography, Shadows } from '../constants/theme';

// Configurando Español
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

interface Props {
  selectedDate: string | null;
  onSelectDate: (dayKey: string | null) => void;
}

export default function FullCalendarView({ selectedDate, onSelectDate }: Props) {
  const events = useAppStore((s) => s.events);

  // Derivar markedDates dinámicamente con Dots de Carga
  const markedDates = useMemo(() => {
    const marks: any = {};
    const eventsPerDay: Record<string, typeof events> = {};

    // Agrupar
    events.forEach(event => {
      if (!eventsPerDay[event.dayKey]) eventsPerDay[event.dayKey] = [];
      eventsPerDay[event.dayKey].push(event);
    });

    // Crear dots (máx 3 para legibilidad)
    Object.keys(eventsPerDay).forEach(dayKey => {
      const dayEvents = eventsPerDay[dayKey];
      const pendingCount = dayEvents.filter(e => e.status !== 'listo').length;
      
      let dots = [];
      for (let i = 0; i < Math.min(pendingCount, 3); i++) {
        dots.push({ key: `dot-${i}`, color: Colors.brand.primary });
      }

      // Si todo está completado pero hay eventos, mostramos 1 gris
      if (pendingCount === 0 && dayEvents.length > 0) {
        dots.push({ key: 'done', color: Colors.text.muted });
      }

      marks[dayKey] = { dots };
    });

    if (selectedDate) {
      if (marks[selectedDate]) {
        marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#FFFFFF' };
      } else {
        marks[selectedDate] = { selected: true, selectedColor: '#FFFFFF' };
      }
    }

    return marks;
  }, [events, selectedDate]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Calendario Mensual</Text>
        {selectedDate && (
          <TouchableOpacity onPress={() => onSelectDate(null)} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Ver todo</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.calendarWrapper}>
        <Calendar
          current={selectedDate || undefined}
          onDayPress={(day: any) => {
            onSelectDate(day.dateString === selectedDate ? null : day.dateString);
          }}
          markingType="multi-dot"
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: Colors.text.muted,
            selectedDayBackgroundColor: '#FFFFFF',
            selectedDayTextColor: '#000000',
            todayTextColor: Colors.brand.primary,
            dayTextColor: Colors.text.primary,
            textDisabledColor: Colors.text.muted + '40',
            dotColor: Colors.brand.primary,
            selectedDotColor: '#000000',
            arrowColor: Colors.text.secondary,
            monthTextColor: Colors.text.primary,
            textDayFontFamily: Typography.fontFamily.medium,
            textMonthFontFamily: Typography.fontFamily.bold,
            textDayHeaderFontFamily: Typography.fontFamily.semiBold,
            textMonthFontSize: 16,
            textDayFontSize: 14,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearBtn: {
    backgroundColor: Colors.dark.surfaceHigh,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  clearBtnText: {
    color: Colors.text.secondary,
    fontSize: 11,
    fontFamily: Typography.fontFamily.medium,
  },
  calendarWrapper: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    overflow: 'hidden',
    paddingBottom: Spacing.xs,
    ...Shadows.card,
  }
});
