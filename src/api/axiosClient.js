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

axiosClient.interceptors.response.use(
  (response) => (response && response.data !== undefined ? response.data : response),
  (error) => {
    console.error("Loi tu Server:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
