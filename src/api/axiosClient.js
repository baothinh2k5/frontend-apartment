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

    if (status === 401 && !isPublicEndpoint) {
      if (isLoggingOut) return Promise.reject(error);

      // Neu da retry roi ma van 401 -> Logout luon, tranh loop
      if (originalRequest._retry) {
        handleLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest._retry = true; // Danh dau da retry de khong refresh lai lan nua
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        isRefreshing = false;
        handleLogout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)}/users/refresh-token`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        isRefreshing = false;
        processQueue(null, accessToken);

        // Retry the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    console.error("Loi tu Server:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
