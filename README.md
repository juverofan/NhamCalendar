# NhamCalendar

NhamCalendar là ứng dụng lịch âm dương Việt Nam được xây dựng bằng Expo/React Native. App tập trung vào xem ngày giờ, thông tin âm lịch, tiết khí, ngày đặc biệt và quản lý sự kiện cá nhân theo cả lịch dương lẫn lịch âm.

## Tính Năng Chính

- Xem ngày hiện tại, giờ hiện tại và can chi của giờ/ngày/tháng/năm.
- Xem lịch tháng, ngày dương và ngày âm.
- Chọn một ngày trong lịch tháng để xem chi tiết.
- Quay về ngày hiện tại nhanh bằng tab `Hôm nay` hoặc nút `Về hôm nay`.
- Hiển thị ngày lễ, tiết khí và ngày đặc biệt trong năm.
- Thêm/xóa sự kiện cá nhân theo lịch dương hoặc lịch âm.
- Báo sự kiện sắp tới trong vòng 7 ngày trên màn hình ngày.
- Nhắc thông báo lúc 08:00, từ trước 5 ngày đến đúng ngày sự kiện.
- Sao lưu danh sách sự kiện ra file JSON.
- Khôi phục danh sách sự kiện từ file JSON.
- Tự động đọc/merge dữ liệu cũ khi nâng cấp app để tránh mất cấu hình/sự kiện.

## Công Nghệ

- Expo SDK 54
- React Native 0.81
- React 19
- Expo Router
- AsyncStorage
- Expo Notifications
- Expo File System
- Expo Sharing
- Expo Document Picker
- vietnamese-lunar-calendar

## Cấu Trúc Chính

- `app/index.tsx`: màn hình ngày, hiển thị ngày dương/âm, can chi, sự kiện và nút về hôm nay.
- `app/month.tsx`: màn hình lịch tháng.
- `app/events.tsx`: quản lý sự kiện cá nhân.
- `app/settings.tsx`: thông tin bộ nhớ, backup/restore và test notification.
- `utils/lunar.ts`: tính thông tin âm lịch và can chi.
- `utils/storage.ts`: lưu/tải sự kiện, migration dữ liệu cũ, backup/restore.
- `utils/notifications.ts`: xin quyền, tạo channel và lập lịch notification.

## Dữ Liệu Và Nâng Cấp

App hiện lưu sự kiện trong AsyncStorage với key `@nham_calendar_data_final`.

Để đảm bảo cài đè bản mới không mất dữ liệu cũ, app vẫn đọc key cũ `@nham_calendar_events`, merge vào key mới và giữ lại dữ liệu hợp lệ. Không đổi `android.package`/`applicationId`: `com.nhamstudio.calendar`.

## Cài Đặt Môi Trường

```bash
npm install
```

Chạy app khi phát triển:

```bash
npm run start
```

Chạy trên Android development build:

```bash
npm run android
```

## Kiểm Tra

```bash
npm run lint
npx tsc --noEmit
```

## Build APK Release

Nếu chưa có native Android project:

```bash
npx expo prebuild --platform android
```

Build APK release:

```bash
cd android
.\gradlew.bat assembleRelease
```

APK universal release nằm tại:

```text
android/app/build/outputs/apk/release/app-universal-release.apk
```

Có thể copy ra thư mục gốc với tên:

```text
NhamCalendar.apk
```

Lưu ý: file APK là build artifact, không nên commit lên GitHub. Nếu cần phát hành APK, hãy đưa file lên GitHub Releases.

## Version Hiện Tại

- App version: `1.2.1`
- Android versionCode: `121`
- Android package: `com.nhamstudio.calendar`

## Ghi Chú Backup/Restore

Backup tạo file JSON từ dữ liệu sự kiện cá nhân. Trên Android, app tạo file tạm trong cache và mở bảng chia sẻ/lưu file của hệ thống để người dùng chọn nơi lưu.

Restore chỉ chấp nhận file JSON có danh sách sự kiện hợp lệ. Khi restore thành công, app sẽ lưu lại dữ liệu và lập lịch notification mới.
