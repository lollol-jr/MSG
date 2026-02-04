// 실기기 테스트: 로컬 네트워크 IP 사용 (같은 Wi-Fi 필요)
export const API_BASE = __DEV__
  ? "http://192.168.50.2:4000"
  : "http://localhost:4000";
