# Automagical Attendance Checking

## Hướng dẫn sau khi Clone Project

### Cấu hình Firebase Emulator

Dùng git bash để clone project cho lẹ

#### Bước 1: Cài đặt Dependencies

Mở terminal trong thư mục dự án và chạy lệnh:

```bash
npm install
```

#### Bước 2: Cài đặt Firebase CLI

Nếu chưa cài đặt Firebase CLI, hãy cài đặt nó bằng lệnh:

```bash
npm install -g firebase-tools
```

#### Bước 3: Đăng nhập vào Firebase

```bash
firebase login
login quá ez r
```

#### Bước 4: Khởi tạo Firebase Emulator

```bash
firebase init emulators
```

Trong quá trình setup:

- Chọn các emulators cần thiết (Authentication, Firestore, Functions nếu cần)
- Chọn các cổng mặc định hoặc tùy chỉnh theo ý muốn
- Khi được hỏi về việc tải Firestore rules, indexes và Extensions, hãy chọn Yes
- Khi được hỏi về việc lưu dữ liệu emulator, chọn Yes và chọn thư mục mặc định hoặc chỉ định thư mục `saved-emulator-data`

#### Bước 5: Khởi động Firebase Emulator

```bash
firebase emulators:start
```


mấy trang được provided trong terminal

#### Bước 6: Chạy ứng dụng web 

Để chạy ứng dụng web với emulator, mở một terminal mới và chạy:

```bash
npm run dev
```

Dự án sẽ khởi chạy tại địa chỉ [http://localhost:3000](http://localhost:3000)

## Lỗi thường gặp và cách khắc phục

### Lỗi khi chạy emulator

Ask An nếu có bug

### Lỗi khi chạy ứng dụng

Nếu gặp lỗi khi chạy ứng dụng, hãy thử các bước sau:

- Xóa thư mục `.next` và thử build lại project:

```bash
rm -rf .next
npm run dev
```

- Đảm bảo đã cài đặt đầy đủ dependencies:

```bash
npm install
```

## Note
Nếu có lỗi thì thử xóa file .next rồi 'npm run dev', 
