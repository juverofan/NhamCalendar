import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert, Share } from 'react-native';
import { scheduleEventNotifications } from './notifications';

const STORAGE_KEY = '@nham_calendar_data_final';
const LEGACY_STORAGE_KEYS = ['@nham_calendar_events'];

export interface CalendarEvent {
  id: string; title: string; type: 'solar' | 'lunar'; day: number; month: number;
}

const isValidEvent = (event: any): event is CalendarEvent => {
  return event
    && typeof event.title === 'string'
    && event.title.trim().length > 0
    && (event.type === 'solar' || event.type === 'lunar')
    && Number.isInteger(Number(event.day))
    && Number(event.day) >= 1
    && Number(event.day) <= 31
    && Number.isInteger(Number(event.month))
    && Number(event.month) >= 1
    && Number(event.month) <= 12;
};

const normalizeEvents = (data: any): CalendarEvent[] | null => {
  if (!Array.isArray(data)) return null;

  const events = data
    .filter(isValidEvent)
    .map((event, index) => ({
      id: typeof event.id === 'string' && event.id ? event.id : `${Date.now()}-${index}`,
      title: event.title.trim(),
      type: event.type,
      day: Number(event.day),
      month: Number(event.month),
    }));

  return events.length === data.length ? events : null;
};

const mergeEvents = (primary: CalendarEvent[], secondary: CalendarEvent[]) => {
  const seen = new Set(primary.map(event => `${event.type}-${event.day}-${event.month}-${event.title.toLowerCase()}`));
  const merged = [...primary];

  for (const event of secondary) {
    const key = `${event.type}-${event.day}-${event.month}-${event.title.toLowerCase()}`;
    if (seen.has(key)) continue;

    seen.add(key);
    merged.push(event);
  }

  return merged;
};

export const loadEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const content = await AsyncStorage.getItem(STORAGE_KEY);
    let events = content ? normalizeEvents(JSON.parse(content)) ?? [] : [];

    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacyContent = await AsyncStorage.getItem(legacyKey);
      if (!legacyContent) continue;

      const legacyEvents = normalizeEvents(JSON.parse(legacyContent));
      if (legacyEvents) {
        events = mergeEvents(events, legacyEvents);
      }
    }

    if (events.length > 0) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }

    return events;
  } catch (e) {
    return [];
  }
};

export const saveEvents = async (events: CalendarEvent[], syncNotifications = true) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    if (syncNotifications) await scheduleEventNotifications(events);
    return true;
  } catch (e) {
    return false;
  }
};

export const exportBackup = async () => {
  try {
    const data = await loadEvents();
    if (data.length === 0) {
      Alert.alert("Thông báo", "Không có sự kiện nào để xuất!");
      return;
    }

    const jsonString = JSON.stringify(data, null, 2);

    await Clipboard.setStringAsync(jsonString);

    await Share.share({
      message: jsonString,
      title: 'NhamCalendar Backup',
    });

    Alert.alert("Đã sao chép", "Dữ liệu backup đã được sao chép vào clipboard và mở chia sẻ. Bạn có thể dán vào file ghi chú, Zalo, Messenger, email... để lưu trữ.");
  } catch (e: any) {
    Alert.alert("Lỗi hệ thống Export", e.message || String(e));
  }
};

const restoreFromJson = (jsonString: string): CalendarEvent[] | null => {
  try {
    const parsed = JSON.parse(jsonString);
    const data = normalizeEvents(parsed);
    return data;
  } catch {
    return null;
  }
};

const applyRestoredEvents = async (data: CalendarEvent[]): Promise<CalendarEvent[] | null> => {
  const success = await saveEvents(data);
  if (success) {
    Alert.alert("Thành công", `Đã khôi phục ${data.length} sự kiện!`);
    return data;
  } else {
    Alert.alert("Lỗi", "Đọc được dữ liệu nhưng lưu vào bộ nhớ máy thất bại.");
    return null;
  }
};

export const importBackup = async () => {
  try {
    const res = await DocumentPicker.getDocumentAsync({
      type: '*/*', 
      copyToCacheDirectory: true
    });

    if (res.canceled) return null;

    if (res.assets && res.assets.length > 0) {
      const content = await FileSystem.readAsStringAsync(res.assets[0].uri);
      const data = restoreFromJson(content);

      if (data) {
        return await applyRestoredEvents(data);
      } else {
        Alert.alert("Sai cấu trúc", "File JSON này không chứa danh sách sự kiện hợp lệ.");
      }
    }
    return null;
  } catch (e: any) {
    Alert.alert("Lỗi đọc file", "Không thể đọc file. Hãy thử dùng phương thức 'Dán từ clipboard'.");
    return null;
  }
};

export const importFromClipboard = async () => {
  try {
    const hasString = await Clipboard.hasStringAsync();
    if (!hasString) {
      Alert.alert("Clipboard trống", "Hãy sao chép nội dung JSON backup trước.");
      return null;
    }

    const text = await Clipboard.getStringAsync();
    if (!text) {
      Alert.alert("Clipboard trống", "Không có nội dung trong clipboard.");
      return null;
    }

    const data = restoreFromJson(text);
    if (data) {
      return await applyRestoredEvents(data);
    } else {
      Alert.alert("Sai cấu trúc", "Nội dung clipboard không chứa danh sách sự kiện hợp lệ.");
      return null;
    }
  } catch (e: any) {
    Alert.alert("Lỗi hệ thống Import", e.message || String(e));
    return null;
  }
};
