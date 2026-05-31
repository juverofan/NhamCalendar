import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
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
    const now = new Date();
    const fileName = `NhamCalendar_Backup_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.json`;
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonString);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Lưu file backup' });
      Alert.alert("Đã tạo file backup", "Hãy chọn Lưu vào tệp/Drive/Zalo hoặc ứng dụng bạn muốn trong màn chia sẻ để lưu file JSON.");
    } else {
      Alert.alert("Thông báo", "Thiết bị không hỗ trợ chia sẻ file backup.");
    }
  } catch (e: any) {
    Alert.alert("Lỗi hệ thống Export", e.message || String(e));
  }
};

// CÁCH TIẾP CẬN ĐÚNG CHUẨN CHO RESTORE
export const importBackup = async () => {
  try {
    const res = await DocumentPicker.getDocumentAsync({
      type: '*/*', 
      copyToCacheDirectory: true
    });

    if (res.canceled) return null;

    if (res.assets && res.assets.length > 0) {
      const content = await FileSystem.readAsStringAsync(res.assets[0].uri);

      try {
        const parsed = JSON.parse(content);
        const data = normalizeEvents(parsed);

        if (data) {
          const success = await saveEvents(data);
          if (success) {
            Alert.alert("Thành công", `Đã khôi phục ${data.length} sự kiện từ file!`);
            return data;
          } else {
            Alert.alert("Lỗi", "Đọc được file nhưng lưu vào bộ nhớ máy thất bại.");
          }
        } else {
          Alert.alert("Sai cấu trúc", "File JSON này không chứa danh sách sự kiện hợp lệ.");
        }
      } catch (parseError: any) {
        Alert.alert("Lỗi Parse JSON", "Nội dung file bị hỏng hoặc không phải chuẩn JSON.");
      }
    }
    return null;
  } catch (e: any) {
    Alert.alert("Lỗi hệ thống Import", e.message || String(e));
    return null;
  }
};
