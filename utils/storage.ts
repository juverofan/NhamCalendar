import AsyncStorage from '@react-native-async-storage/async-storage';
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

  return data
    .filter(isValidEvent)
    .map((event, index) => ({
      id: typeof event.id === 'string' && event.id ? event.id : `${Date.now()}-${index}`,
      title: event.title.trim(),
      type: event.type,
      day: Number(event.day),
      month: Number(event.month),
    }));
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

const removeDuplicateEvents = (events: CalendarEvent[]) => mergeEvents([], events);

export const loadEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const content = await AsyncStorage.getItem(STORAGE_KEY);
    const events = removeDuplicateEvents(content ? normalizeEvents(JSON.parse(content)) ?? [] : []);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    await AsyncStorage.multiRemove(LEGACY_STORAGE_KEYS);
    return events;
  } catch (e) {
    return [];
  }
};

export const saveEvents = async (events: CalendarEvent[], syncNotifications = true) => {
  try {
    const normalized = removeDuplicateEvents(events);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    
    if (syncNotifications) {
      try {
        await scheduleEventNotifications(normalized);
      } catch (notificationError) {
        console.error("Lỗi lập lịch thông báo nhưng vẫn lưu data:", notificationError);
      }
    }
    return true;
  } catch (e) {
    console.error("Lỗi lưu dữ liệu:", e);
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

    await Share.share({
      message: jsonString,
      title: 'NhamCalendar Backup',
    });

    Alert.alert("Thành công", "Đã mở menu chia sẻ. Hãy chọn một ứng dụng ghi chú hoặc tin nhắn để lưu lại nội dung backup này.");
  } catch (e: any) {
    Alert.alert("Lỗi hệ thống Export", e.message || String(e));
  }
};

export const importBackupFromText = async (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString);
    const data = normalizeEvents(parsed);

    if (data === null) {
      Alert.alert("Sai cấu trúc", "Nội dung JSON này không phải là một danh sách sự kiện.");
      return null;
    }

    if (data.length === 0) {
      Alert.alert("Thông báo", "Nội dung JSON hợp lệ nhưng không chứa sự kiện nào.");
      return null;
    }

    const success = await saveEvents(data);
    if (success) {
      Alert.alert("Thành công", `Đã khôi phục ${data.length} sự kiện!`);
      return data;
    } else {
      Alert.alert("Lỗi", "Lưu vào bộ nhớ máy thất bại.");
      return null;
    }
  } catch (e: any) {
    Alert.alert("Lỗi Parse JSON", "Nội dung bị hỏng hoặc không phải chuẩn JSON.");
    return null;
  }
};
