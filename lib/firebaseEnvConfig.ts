// lib/firebaseEnvConfig.ts
// Cấu hình môi trường cho Firebase

// Đặt cờ để quyết định khi nào sử dụng Emulator hoặc Firebase Cloud
// true = sử dụng emulator, false = sử dụng Firebase Cloud
// Set to false to use Firebase Cloud services
export const USE_EMULATOR = true;

// Cấu hình cổng kết nối cho Emulator
export const EMULATOR_CONFIG = {
  authPort: 9098,
  firestorePort: 8002,
};

// Hàm helper để log môi trường hiện tại
export const logFirebaseEnvironment = () => {
  console.log(`[Firebase Environment] Using ${USE_EMULATOR ? 'EMULATOR' : 'CLOUD'} services`);
};