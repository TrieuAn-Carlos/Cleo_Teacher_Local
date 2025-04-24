# Hướng dẫn Thiết lập Dự án Firebase Riêng và Chạy Cục bộ

Hướng dẫn này giúp bạn tạo dự án Firebase của riêng mình, cấu hình ứng dụng Next.js này để sử dụng dự án đó khi chạy cục bộ với Firebase Emulator, và lấy thông tin cần thiết để chia sẻ lại cho người quản lý dự án chính.

## 1. Yêu cầu cài đặt (Nếu chưa có)

*   **Node.js & npm:** Tải từ [nodejs.org](https://nodejs.org/).
*   **Git:** Tải từ [git-scm.com](https://git-scm.com/).
*   **Firebase CLI:** Cài đặt bằng `npm install -g firebase-tools`.
*   **Tài khoản Google:** Để tạo dự án Firebase.

## 2. Tạo Dự án Firebase Mới

1.  **Truy cập Firebase Console:** Mở trình duyệt và vào [Firebase Console](https://console.firebase.google.com/). Đăng nhập bằng tài khoản Google của bạn.
2.  **Tạo Dự án Mới:**
    *   Nhấp vào "Add project" hoặc "Tạo dự án".
    *   Đặt tên cho dự án của bạn (ví dụ: `my-cleo-demo`).
    *   Làm theo các bước để tạo dự án (bạn có thể bỏ qua Google Analytics nếu chỉ dùng để demo).
3.  **Ghi lại Project ID:** Sau khi tạo xong, bạn sẽ được chuyển đến trang tổng quan dự án. Hãy tìm và ghi lại **Project ID** (Thường giống tên bạn đặt nhưng có thể có thêm số ngẫu nhiên, ví dụ: `my-cleo-demo-a1b2c`). Bạn sẽ cần nó sau này.

## 3. Đăng ký Ứng dụng Web và Lấy Cấu hình

1.  **Thêm Ứng dụng Web:**
    *   Trong trang tổng quan dự án Firebase của bạn, tìm biểu tượng Web (`</>`).
    *   Nhấp vào đó để "Add an app to get started" (Thêm ứng dụng).
    *   Chọn "Web".
    *   Đặt tên cho ứng dụng (ví dụ: "Cleo Teacher Web Demo").
    *   **Quan trọng:** *Không* cần chọn "Also set up Firebase Hosting for this app" ở bước này.
    *   Nhấp "Register app".
2.  **Lấy Firebase SDK Snippet:**
    *   Sau khi đăng ký, Firebase sẽ hiển thị một đoạn mã JavaScript chứa thông tin cấu hình (`firebaseConfig`). Nó trông giống như thế này:
      ```javascript
      const firebaseConfig = {
        apiKey: "...",
        authDomain: "...",
        projectId: "...", // ID dự án của BẠN sẽ ở đây
        storageBucket: "...",
        messagingSenderId: "...",
        appId: "...",
        measurementId: "..." // Có thể có hoặc không
      };
      ```
    *   **Sao chép toàn bộ đối tượng `firebaseConfig` này.** Bạn sẽ cần nó ở bước sau. Nhấp "Continue to console".

## 4. Kích hoạt Dịch vụ Firebase Cần thiết

Trong Firebase Console của dự án mới tạo:

1.  **Authentication:**
    *   Vào mục "Build" > "Authentication".
    *   Nhấp "Get started".
    *   Chọn phương thức đăng nhập bạn muốn dùng (ví dụ: "Email/Password") và kích hoạt nó.
2.  **Firestore Database:**
    *   Vào mục "Build" > "Firestore Database".
    *   Nhấp "Create database".
    *   Chọn **"Start in test mode"** (Chế độ kiểm thử) - Điều này quan trọng để emulator hoạt động dễ dàng cục bộ. *Cảnh báo: Chế độ này không an toàn cho sản phẩm thật.*
    *   Chọn vị trí Cloud Firestore (chọn vùng gần bạn nhất).
    *   Nhấp "Enable".

## 5. Cập nhật Cấu hình trong Mã nguồn Cục bộ (Hoặc có thể nhờ AI trong VScode làm giùm phần NÀY)

Bây giờ, bạn cần cập nhật mã nguồn dự án đã clone trên máy tính của mình để sử dụng thông tin từ dự án Firebase *mới* của bạn.

1.  **Mở thư mục dự án** trong trình soạn thảo mã (như VS Code).
2.  **Cập nhật `lib/firebaseConfig.ts`:**
    *   Mở tệp `lib/firebaseConfig.ts`.
    *   Tìm đối tượng `firebaseConfig` hiện có.
    *   **Thay thế toàn bộ** giá trị của đối tượng đó bằng `firebaseConfig` bạn đã sao chép từ Firebase Console ở Bước 3.2.
    *   Lưu tệp.
3.  **Cập nhật `lib/firebaseAdminConfig.ts`:**
    *   Mở tệp `lib/firebaseAdminConfig.ts`.
    *   Tìm dòng `const projectId = '...'`.
    *   Thay thế giá trị trong dấu nháy đơn bằng **Project ID** của dự án Firebase mới mà bạn đã ghi lại ở Bước 2.3 (ví dụ: `'my-cleo-demo-a1b2c'`).
    *   Lưu tệp.
4.  **Cập nhật `.firebaserc` (Quan trọng cho CLI):**
    *   Mở tệp `.firebaserc` ở thư mục gốc dự án.
    *   Tìm dòng `"default": "..."`.
    *   Thay thế giá trị trong dấu ngoặc kép bằng **Project ID** của dự án Firebase mới của bạn.
    *   Nó sẽ trông giống như:
      ```json
      {
        "projects": {
          "default": "my-cleo-demo-a1b2c" // Thay bằng Project ID của bạn
        }
      }
      ```
    *   Lưu tệp.

## 6. Chạy Ứng dụng Cục bộ với Emulator

1.  **Đăng nhập Firebase CLI (Nếu chưa):** Mở terminal trong thư mục dự án và chạy:
    ```bash
    firebase login
    ```
    Đăng nhập bằng tài khoản Google bạn đã dùng để tạo dự án Firebase mới.
2.  **Khởi chạy Emulator và Server:** Chạy lệnh:
    ```bash
    npm run dev-with-emulator
    ```
    Lệnh này sẽ khởi động emulator và server Next.js. Emulator bây giờ sẽ sử dụng Project ID *mới* của bạn.
3.  **Truy cập ứng dụng:** Mở trình duyệt và vào `http://localhost:3000`.
4.  **Truy cập Emulator UI:** Mở `http://localhost:4000` để xem dữ liệu emulator (Auth, Firestore) liên kết với Project ID mới của bạn.

## 7. Chia sẻ Thông tin Cấu hình

Khi bạn đã thiết lập và chạy thành công, hãy **cung cấp các thông tin sau** cho người quản lý dự án chính (người đã yêu cầu bạn làm việc này):

1.  **Toàn bộ đối tượng `firebaseConfig`** mà bạn đã sao chép từ Firebase Console (Bước 3.2).
2.  **Project ID** của dự án Firebase bạn đã tạo (Bước 2.3).

Thông tin này sẽ được dùng để cập nhật cấu hình chung của dự án khi cần thiết.

---
Chúc bạn thành công!
