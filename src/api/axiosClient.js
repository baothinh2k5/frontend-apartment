import axios from "axios";

const normalizeBaseUrl = (baseUrl) => {
  if (!baseUrl) {
    return "http://localhost:8080";
  }

  return baseUrl.replace(/\/+$/, "");
};

const PUBLIC_ENDPOINTS = new Set(["/users/login", "/users/register"]);

const axiosClient = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const requestPath = config.url ?? "";
    const accessToken = localStorage.getItem("accessToken");

    if (PUBLIC_ENDPOINTS.has(requestPath)) {
      if (config.headers?.Authorization) {
        delete config.headers.Authorization;
      }

      return config;
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRereshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

axiosClient.interceptors.response.use(
  (response) => (response && response.data !== undefined ? response.data : response),
  async (error) => {
    const { config } = error;
    const status = error.response?.status;
    const originalRequest = config;

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        isRefreshing = false;
        // Redirect to login or clear data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
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
        onRereshed(accessToken);

        return axiosClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    console.error("Loi tu Server:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
