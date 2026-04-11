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

  // Derivar markedDates dinámicamente
  const markedDates = useMemo(() => {
    const marks: any = {};

    events.forEach(event => {
      // Omitimos marcar tareas finalizadas para mantener el calendario limpio o las marcamos en gris?
      // Las tareas completadas aportan "racha", vamos a mostrarlas.
      if (!marks[event.dayKey]) {
        marks[event.dayKey] = {
          marked: true,
          dotColor: event.status === 'listo' ? Colors.text.muted : Colors.brand.primaryLight,
        };
      }
    });

    if (selectedDate) {
      // Fusionar o sobreescribir con el styling del seleccionado
      if (marks[selectedDate]) {
        marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: 'rgba(124, 58, 237, 0.4)' };
      } else {
        marks[selectedDate] = { selected: true, selectedColor: 'rgba(124, 58, 237, 0.4)' };
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
          markedDates={markedDates}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: Colors.text.muted,
            selectedDayBackgroundColor: 'rgba(124, 58, 237, 0.4)',
            selectedDayTextColor: Colors.text.primary,
            todayTextColor: Colors.brand.accentLight,
            dayTextColor: Colors.text.primary,
            textDisabledColor: Colors.text.muted + '40',
            dotColor: Colors.brand.primaryLight,
            selectedDotColor: Colors.text.primary,
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
