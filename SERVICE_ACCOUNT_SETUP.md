# Hướng dẫn thiết lập Service Account cho Firebase Admin SDK

Để Firebase Admin SDK hoạt động với project của bạn trong môi trường Cloud, bạn cần thiết lập thông tin xác thực Service Account. Dưới đây là các bước để thiết lập:

## Bước 1: Tạo Service Account Key

1. Đăng nhập vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project "cleo-dev-f31ac"
3. Đi tới **Project Settings** (biểu tượng bánh răng)
4. Chọn tab **Service accounts**
5. Nhấp vào **Generate new private key**
6. Tải xuống tệp JSON chứa thông tin xác thực

## Bước 2: Thiết lập cho môi trường phát triển

### Phương pháp 1: Sử dụng Application Default Credentials (Khuyến nghị)

1. Cài đặt [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Chạy lệnh sau để đăng nhập:
   ```
   gcloud auth application-default login
   ```
3. Chọn tài khoản Google có quyền truy cập vào dự án Firebase
4. Sau khi đăng nhập thành công, thông tin xác thực sẽ được lưu vào máy tính của bạn

### Phương pháp 2: Sử dụng biến môi trường

1. Đặt biến môi trường `GOOGLE_APPLICATION_CREDENTIALS` trỏ đến tệp JSON service account:

   **Windows:**

   ```
   set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account-file.json
   ```

   **MacOS/Linux:**

   ```
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-file.json
   ```

### Phương pháp 3: Sử dụng biến môi trường trực tiếp

Đối với môi trường NextJS, bạn có thể thêm biến môi trường vào tệp `.env.local`:

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"cleo-dev-f31ac","private_key_id":"xxx","private_key":"-----BEGIN PRIVATE KEY-----\nXXX\n-----END PRIVATE KEY-----\n","client_email":"xxx@cleo-dev-f31ac.iam.gserviceaccount.com","client_id":"xxx","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/xxx%40cleo-dev-f31ac.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```

Sao chép toàn bộ nội dung tệp JSON service account và đặt vào giá trị của biến môi trường `FIREBASE_SERVICE_ACCOUNT`.

## Bước 3: Kiểm tra thiết lập

Khởi động lại ứng dụng NextJS và kiểm tra logs để xác nhận kết nối:

```
npm run dev
```

Bạn sẽ thấy thông báo log như sau nếu kết nối thành công:

```
[Firebase Debug] Admin app initialized with application default credentials
```

hoặc

```
[Firebase Debug] Admin app initialized with service account from env var
```

## Các vấn đề thường gặp

1. **"Firebase permission denied"**: Tài khoản service account không có quyền truy cập đúng. Đảm bảo tài khoản có vai trò Owner hoặc Editor.

2. **"Firebase authentication failed"**: Thông tin xác thực không hợp lệ. Kiểm tra lại tệp service account và đảm bảo nó còn hiệu lực.

3. **"Error querying Firestore"**: Có thể do Firestore chưa được kích hoạt cho dự án. Vào Firebase Console và đảm bảo đã kích hoạt Firestore.
