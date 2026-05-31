# NhamCalendar

NhamCalendar la ung dung lich am duong Viet Nam duoc xay dung bang Expo/React Native. App tap trung vao xem ngay gio, thong tin am lich, tiet khi, ngay dac biet va quan ly su kien ca nhan theo ca lich duong lan lich am.

## Tinh Nang Chinh

- Xem ngay hien tai, gio hien tai va can chi cua gio/ngay/thang/nam.
- Xem lich thang, ngay duong va ngay am.
- Chon mot ngay trong lich thang de xem chi tiet.
- Quay ve ngay hien tai nhanh bang tab `Hom nay` hoac nut `Ve hom nay`.
- Hien thi ngay le, tiet khi va ngay dac biet trong nam.
- Them/xoa su kien ca nhan theo lich duong hoac lich am.
- Bao su kien sap toi trong vong 7 ngay tren man hinh ngay.
- Nhac thong bao luc 08:00, tu truoc 5 ngay den dung ngay su kien.
- Sao luu danh sach su kien ra file JSON.
- Khoi phuc danh sach su kien tu file JSON.
- Tu dong doc/merge du lieu cu khi nang cap app de tranh mat cau hinh/su kien.

## Cong Nghe

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

## Cau Truc Chinh

- `app/index.tsx`: man hinh ngay, hien thi ngay duong/am, can chi, su kien va nut ve hom nay.
- `app/month.tsx`: man hinh lich thang.
- `app/events.tsx`: quan ly su kien ca nhan.
- `app/settings.tsx`: thong tin bo nho, backup/restore va test notification.
- `utils/lunar.ts`: tinh thong tin am lich va can chi.
- `utils/storage.ts`: luu/tai su kien, migration du lieu cu, backup/restore.
- `utils/notifications.ts`: xin quyen, tao channel va lap lich notification.

## Du Lieu Va Nang Cap

App hien luu su kien trong AsyncStorage voi key `@nham_calendar_data_final`.

De dam bao cai de ban moi khong mat du lieu cu, app van doc key cu `@nham_calendar_events`, merge vao key moi va giu lai du lieu hop le. Khong doi `android.package`/`applicationId`: `com.nhamstudio.calendar`.

## Cai Dat Moi Truong

```bash
npm install
```

Chay app khi phat trien:

```bash
npm run start
```

Chay tren Android development build:

```bash
npm run android
```

## Kiem Tra

```bash
npm run lint
npx tsc --noEmit
```

## Build APK Release

Neu chua co native Android project:

```bash
npx expo prebuild --platform android
```

Build APK release:

```bash
cd android
.\gradlew.bat assembleRelease
```

APK universal release nam tai:

```text
android/app/build/outputs/apk/release/app-universal-release.apk
```

Co the copy ra thu muc goc voi ten:

```text
NhamCalendar.apk
```

Luu y: file APK la build artifact, khong nen commit len GitHub. Neu can phat hanh APK, hay dua file len GitHub Releases.

## Version Hien Tai

- App version: `1.2.1`
- Android versionCode: `121`
- Android package: `com.nhamstudio.calendar`

## Ghi Chu Backup/Restore

Backup tao file JSON tu du lieu su kien ca nhan. Tren Android, app tao file tam trong cache va mo bang chia se/luu file cua he thong de nguoi dung chon noi luu.

Restore chi chap nhan file JSON co danh sach su kien hop le. Khi restore thanh cong, app se luu lai du lieu va lap lich notification moi.
