import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius, FontSizes } from '../constants/theme';

interface CalendarPickerProps {
  value: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
  label?: string;
  placeholder?: string;
}

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CalendarPicker({ value, onSelect, label, placeholder }: CalendarPickerProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const selectedDay = value ? new Date(value + 'T00:00:00') : null;

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];

    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const pickDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onSelect(`${viewYear}-${m}-${d}`);
    setVisible(false);
  };

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const isSelected = (day: number) =>
    selectedDay && selectedDay.getFullYear() === viewYear && selectedDay.getMonth() === viewMonth && selectedDay.getDate() === day;

  const isToday = (day: number) => {
    const t = new Date();
    return t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === day;
  };

  return (
    <View style={{ marginBottom: Spacing.md }}>
      {label && <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: colors.textSecondary, marginBottom: Spacing.xs }}>{label}</Text>}
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: colors.grayLight }}
        onPress={() => setVisible(true)}
        data-testid="calendar-picker-btn"
      >
        <Ionicons name="calendar-outline" size={20} color={colors.primary} style={{ marginRight: Spacing.sm }} />
        <Text style={{ flex: 1, fontSize: FontSizes.md, color: displayValue ? colors.text : colors.gray }}>
          {displayValue || placeholder || 'Seleccionar fecha'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.gray} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={[s.calendarBox, { backgroundColor: colors.white }]} onStartShouldSetResponder={() => true}>
            {/* Month nav */}
            <View style={s.nav}>
              <TouchableOpacity onPress={prevMonth} style={s.navBtn} data-testid="cal-prev-month">
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </TouchableOpacity>
              <Text style={[s.navTitle, { color: colors.text }]}>{MONTHS_ES[viewMonth]} {viewYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={s.navBtn} data-testid="cal-next-month">
                <Ionicons name="chevron-forward" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={s.row}>
              {DAYS_ES.map(d => (
                <Text key={d} style={[s.dayHeader, { color: colors.textSecondary }]}>{d}</Text>
              ))}
            </View>

            {/* Day cells */}
            <View style={s.grid}>
              {days.map((day, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.cell,
                    day && isSelected(day) && { backgroundColor: colors.primary, borderRadius: 20 },
                    day && isToday(day) && !isSelected(day) && { borderWidth: 1.5, borderColor: colors.primary, borderRadius: 20 },
                  ]}
                  onPress={() => day && pickDay(day)}
                  disabled={!day}
                  data-testid={day ? `cal-day-${day}` : undefined}
                >
                  {day && (
                    <Text style={[s.cellText, { color: isSelected(day) ? '#FFF' : colors.text }]}>{day}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Today shortcut */}
            <TouchableOpacity
              style={[s.todayBtn, { borderColor: colors.primary }]}
              onPress={() => {
                const t = new Date();
                setViewYear(t.getFullYear());
                setViewMonth(t.getMonth());
                pickDay(t.getDate());
              }}
              data-testid="cal-today-btn"
            >
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: FontSizes.sm }}>Hoy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  calendarBox: { width: '100%', maxWidth: 360, borderRadius: 16, padding: 16, elevation: 8 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', marginBottom: 8 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  cellText: { fontSize: 14, fontWeight: '500' },
  todayBtn: { alignSelf: 'center', marginTop: 8, paddingVertical: 6, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1.5 },
});
