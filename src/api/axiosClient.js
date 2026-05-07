import axios from "axios";

const normalizeBaseUrl = (baseUrl) => {
  if (!baseUrl) {
    return "http://localhost:8080/api/v1";
  }

  const normalized = baseUrl.replace(/\/+$/, "");
  return normalized.includes("/api/v1") ? normalized : `${normalized}/api/v1`;
};

const PUBLIC_ENDPOINTS = new Set(["/users/login", "/users/register"]);

const axiosClient = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
  timeout: 30000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const requestPath = config.url ?? "";
    const accessToken = localStorage.getItem("accessToken");
    const language = localStorage.getItem("i18nextLng") || "vi";

    config.headers["Accept-Language"] = language;

    if (PUBLIC_ENDPOINTS.has(requestPath)) {
      if (config.headers?.Authorization) {
        delete config.headers.Authorization;
      }

      return config;
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // DEBUG: Log Authorization header status
    console.log(`>>> [AXIOS] Method: ${config.method?.toUpperCase()}, URL: ${config.url}, Auth Header: ${config.headers.Authorization ? "PRESENT" : "MISSING"}`);

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let isLoggingOut = false;
let failedQueue = [];

const handleLogout = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  localStorage.clear();
  localStorage.setItem("sessionExpired", "true");
  window.location.replace("/login");
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => (response && response.data !== undefined ? response.data : response),
  async (error) => {
    const { config } = error;
    const status = error.response?.status;
    const originalRequest = config;

    const requestPath = originalRequest?.url ?? "";
    const isPublicEndpoint = Array.from(PUBLIC_ENDPOINTS).some(endpoint => requestPath.includes(endpoint));

    // Nếu gặp lỗi 401 (Unauthorized) và không phải endpoint public
    if (status === 401 && !isPublicEndpoint) {
      // Lập tức xử lý đăng xuất
      handleLogout();
      
      // Bắt buộc return Promise.reject(error) để component bắt được lỗi ngay lập tức, tránh treo timeout
      return Promise.reject(error);
    }

    console.error("Loi tu Server:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
